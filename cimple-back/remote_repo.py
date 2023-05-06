import base64
import json
import os

import requests

from model.task import Task


class RemoteRepo:
    def __init__(self):
        self.repo_url = os.environ.get("STORE_DOMAIN")
        store_user = os.environ.get("STORE_USER")
        store_pass = os.environ.get("STORE_PASS")
        if store_user is None or store_pass is None:
            raise ValueError("Store credentials are not set")

        repo_pass = base64.b64encode(f"{store_user}:{store_pass}".encode("UTF-8")).decode()
        self.headers = {'Content-Type': 'application/json', 'Authorization': f'Basic {repo_pass}'}

    def list(self):
        response = requests.get(f"{self.repo_url}/tasks", headers=self.headers)
        response.raise_for_status()
        task_list = {}
        remote_tasks = response.json()
        for task in remote_tasks.values():
            task_list[task["id"]] = Task.parse_obj(task)
        return task_list

    def add(self, task: Task):
        response = requests.post(f"{self.repo_url}/tasks", json=task.dict(), headers=self.headers)
        response.raise_for_status()
        return Task.parse_obj(response.json())

    def get(self, task_id: int) -> Task:
        response = requests.get(f"{self.repo_url}/tasks/{task_id}", headers=self.headers)
        response.raise_for_status()
        return Task.parse_obj(response.json())

    def delete(self, task_id: int):
        requests.delete(f"{self.repo_url}/tasks/{task_id}", headers=self.headers)

    def update(self, task_id: int, updated_task: Task):
        x = json.loads(updated_task.json())
        response = requests.put(f"{self.repo_url}/tasks/{task_id}", json=x, headers=self.headers)
        response.raise_for_status()

