import os
import subprocess
import sys

from cimple_back.model.task import Task


def cronjob_name_from_task(task: Task):
    return f"cimple-cronjob-{task.id}"


class TaskScheduleManager:
    def __init__(self):
        self.schedule_creator = os.environ.get("SCHEDULE_CREATOR", "/app/schedule-creator.sh")

    def add(self, task: Task):
        if task.schedule is None or task.schedule == "":
            return
        if self.schedule_creator == "":
            raise ValueError("SCHEDULE_CREATOR must be set")

        self.delete(task)
        self.create_schedule(task)

    def delete(self, task: Task):
        if task.schedule is None:
            return
        cronjob_name = cronjob_name_from_task(task)

        result = subprocess.run(f"kubectl delete cronjob {cronjob_name}", shell=True)
        exit_code = result.returncode

        if exit_code != 0:  # Failed to delete cronjob
            print(f"Failed to delete cronjob '{cronjob_name}' with exit code {exit_code}. Error ignored",
                  file=sys.stderr)
            print(result.stderr,
                  file=sys.stderr)
        else:
            print(f"CronJob '{cronjob_name}' deleted successfully.")

    def create_schedule(self, task):
        cronjob_name = cronjob_name_from_task(task)
        schedule_creator = os.environ.get('SCHEDULE_CREATOR', self.schedule_creator)
        process = subprocess.Popen(
            f"{schedule_creator} '{task.id}' '{task.schedule}' '{cronjob_name}'",
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=True)
        out, err = process.communicate()

        if process.returncode != 0:
            print(f'Process failed to create cronjob with code {process.returncode}\n', sys.stderr)
            print(out.decode(), sys.stderr)
            raise ValueError(f"Failed to create cronjob for task {task.id}")
