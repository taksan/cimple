import subprocess
import threading
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class Build(BaseModel):
    task_id: int
    id: int
    output: Optional[str] = None
    status: str = 'started'
    exit_code: Optional[int] = None
    created: str
    finished: Optional[datetime] = None

    def __init__(self, **data):
        data['created'] = datetime.now().isoformat()
        super().__init__(**data)

    def run(self):
        def run_script(build):
            process = subprocess.Popen(f"./executor.sh {build.task_id} {build.id}",
                                       stdout=subprocess.PIPE,
                                       stderr=subprocess.PIPE,
                                       shell=True)
            process.communicate()

        t = threading.Thread(target=run_script, args=(self,))
        t.start()

    def complete(self, output, exit_code):
        self.output = output
        self.exit_code = exit_code
        self.finished = datetime.now()
