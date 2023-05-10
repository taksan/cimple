import base64
import json
import os

import requests
from fastapi import HTTPException
from requests import Response

from .model.task import Task


def handle_errors(response: Response):
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Task not found")
    response.raise_for_status()


class RemoteRepo:
    def __init__(self):
        self.repo_url = os.environ.get("STORE_DOMAIN")
        store_user = os.environ.get("STORE_USER")
        store_pass = os.environ.get("STORE_PASS")
        if store_user is None or store_pass is None:
            raise ValueError("Store credentials are not set")

        repo_pass = base64.b64encode(f"{store_user}:{store_pass}".encode("UTF-8")).decode()
        self.headers = {'Content-Type': 'application/json', 'Authorization': f'Basic {repo_pass}'}

    def reset(self):
        pass # can't reset the remote repo yet

    def list(self):
        response = requests.get(f"{self.repo_url}/items", headers=self.headers)
        handle_errors(response)
        task_list = {}
        remote_tasks = response.json()
        for task in remote_tasks.values():
            task_list[task["id"]] = Task.parse_obj(task)
        return task_list

    def add(self, task: Task):
        response = requests.post(f"{self.repo_url}/items", json=task.dict(), headers=self.headers)
        response.raise_for_status()
        return Task.parse_obj(response.json())

    def get(self, task_id: int) -> Task:
        response = requests.get(f"{self.repo_url}/items/{task_id}", headers=self.headers)
        handle_errors(response)

        return Task.parse_obj(response.json())

    def delete(self, task_id: int):
        requests.delete(f"{self.repo_url}/items/{task_id}", headers=self.headers)

    def update(self, task_id: int, updated_task: Task):
        # This conversion forces updated_task to be json serializable
        canonized = json.loads(updated_task.json())
        response = requests.put(f"{self.repo_url}/items/{task_id}", json=canonized, headers=self.headers)
        handle_errors(response)
