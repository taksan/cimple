import os
import subprocess
import threading
from datetime import datetime
from typing import Optional, Callable

from pydantic import BaseModel


class Build(BaseModel):
    task_id: int
    id: int
    output: Optional[str] = None
    status: str = 'started'
    exit_code: Optional[int] = None
    created: str
    finished: Optional[datetime] = None
    started_by: str

    def __init__(self, **data):
        data['created'] = datetime.now().isoformat()
        super().__init__(**data)

    def run(self, on_start_failure: Callable[[int, str, int], None]):
        def run_script(build: Build):
            process = subprocess.Popen(f"{os.environ.get('TASK_EXECUTOR', './executor.sh')} {build.task_id} {build.id}",
                                       stdout=subprocess.PIPE,
                                       stderr=subprocess.STDOUT,
                                       shell=True)
            out, err = process.communicate()
            print(out)

            if process.returncode != 0:
                print(f'Process failed to start with code {process.returncode}')
                on_start_failure(build.id, out.decode(), process.returncode)

        t = threading.Thread(target=run_script, args=(self,))
        t.start()

    def complete(self, output, exit_code):
        self.output = output
        self.exit_code = exit_code
        self.finished = datetime.now()
