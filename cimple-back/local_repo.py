from typing import Dict

from fastapi import HTTPException

from model.task import Task


class TaskRepo:
    def __init__(self):
        self.current_task_id = 0
        self.task_list: Dict[int, Task] = {}

    def list(self) -> Dict[int, Task]:
        return self.task_list.copy()

    def add(self, task: Task):
        self.current_task_id += 1
        task.id = self.current_task_id
        self.task_list[task.id] = task

    def get(self, task_id: int) -> Task:
        self.validate_task_exists(task_id)
        return self.task_list[task_id]

    def delete(self, task_id: int):
        self.validate_task_exists(task_id)
        del self.task_list[task_id]

    def update(self, task_id: int, updated_task: Task):
        self.validate_task_exists(task_id)

        updated_task.id = task_id
        self.task_list[task_id] = updated_task

    def validate_task_exists(self, task_id: int):
        if task_id not in self.task_list:
            raise HTTPException(status_code=404, detail="Task not found")

