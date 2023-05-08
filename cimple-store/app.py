import base64
import logging
import os
from typing import Dict

from fastapi import FastAPI, Request, Response

from store import Repo

# Configure the logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.StreamHandler()]
)

tasks_repo = Repo(os.environ.get("DB_FILE", "tasks.json"))
app = FastAPI()


def authenticate(username, password):
    correct_username = os.environ.get("STORE_USER")
    correct_password = os.environ.get("STORE_PASS")
    if username == correct_username and password == correct_password:
        return True
    return False


@app.middleware("http")
async def basic_auth_middleware(request: Request, call_next):
    auth = request.headers.get("Authorization")
    if auth is None:
        return Response(status_code=401, content="No credentials provided")
    if not auth.startswith("Basic "):
        return Response(status_code=401, content="Invalid authentication mode")

    username, password = base64.b64decode(auth.split(" ")[1]).decode('utf-8').split(":")
    if not authenticate(username, password):
        return Response(status_code=401, content="Invalid credentials")

    response = await call_next(request)
    return response


@app.get("/tasks")
async def get_tasks():
    global tasks_repo
    return tasks_repo.list()


@app.post("/tasks")
async def create_task(task: Dict):
    global tasks_repo
    tasks_repo += task
    logging.info(f"New task {task['id']} created")
    return task


@app.get("/tasks/{task_id}")
async def get_task(task_id: str):
    global tasks_repo
    if task_id not in tasks_repo:
        return Response(status_code=404)

    return tasks_repo[task_id]


@app.put("/tasks/{task_id}")
async def update_task(task_id: str, updated_task: Dict):
    global tasks_repo
    if task_id not in tasks_repo:
        return Response(status_code=404)

    updated_task['id'] = task_id
    tasks_repo[task_id] = updated_task
    logging.info(f"Task {task_id} updated")


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    global tasks_repo
    if task_id not in tasks_repo:
        return Response(status_code=404)
    del tasks_repo[task_id]
    logging.info(f"Task {task_id} removed")
