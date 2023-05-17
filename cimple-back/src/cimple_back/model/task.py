from datetime import datetime
from typing import Optional, List, Callable

from fastapi import HTTPException
from pydantic import BaseModel

from .build import Build


class Task(BaseModel):
    id: Optional[int] = None
    name: str
    image: Optional[str] = ""
    schedule: Optional[str] = None
    script: str
    created: str
    builds: List[Build] = []
    memory: str = "10Mi"
    cpu: str = "0.1"

    def __init__(self, **data):
        data['created'] = datetime.now().isoformat()
        super().__init__(**data)

    def trigger(self, client_id: str, handle_start_failure: Callable[[int, str, int], None]) -> Build:
        build = Build(id=len(self.builds), task_id=self.id, script=self.script, started_by=client_id)
        self.builds.append(build)
        build.run(handle_start_failure)
        return build

    def complete(self, build_id: int, output: str, exit_code: int):
        if build_id < 0 or build_id >= len(self.builds):
            raise HTTPException(status_code=404, detail="Build not found")

        self.builds[build_id].complete(output, exit_code)
        return self.builds[build_id]
