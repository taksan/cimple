from datetime import datetime
from typing import Optional, List

from fastapi import HTTPException
from pydantic import BaseModel

from model.build import Build


class Task(BaseModel):
    id: Optional[int] = None
    name: str
    image: Optional[str] = ""
    schedule: Optional[str] = None
    script: str
    created: datetime
    builds: List[Build] = []

    def __init__(self, **data):
        data['created'] = datetime.now()
        super().__init__(**data)

    def trigger(self) -> Build:
        build = Build(id=len(self.builds), task_id=self.id, script=self.script)
        self.builds.append(build)
        build.run()
        return build

    def complete(self, build_id: int, output: str, exit_code: int):
        print(f"build_id {build_id}")
        print(self.builds)
        print("------------")
        if build_id < 0 or build_id >= len(self.builds):
            print("------------oooooooooooooooo")
            raise HTTPException(status_code=404, detail="Build not found")

        self.builds[build_id].complete(output, exit_code)
