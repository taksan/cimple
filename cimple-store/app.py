import json
import os
from typing import Dict

from fastapi import FastAPI, File, HTTPException, Query, Request, Response, UploadFile
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import base64
import logging

# Configure the logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.StreamHandler()]
)

current_task_id = 0
task_repo_cache = None

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


def get_repo():
    global task_repo_cache
    if task_repo_cache is None:
        if os.path.exists("tasks.json"):
            with open("tasks.json", "r") as f:
                task_repo_cache = json.load(f)
            global current_task_id
            current_task_id = max([int(k) for k in task_repo_cache.keys()])
        else:
            task_repo_cache = {}
            save_repo()
    return task_repo_cache

def save_repo():
    with open("tasks.json", "w") as f:
        f.write(json.dumps(task_repo_cache))

@app.get("/tasks")
async def get_tasks():
    return get_repo()


@app.post("/tasks")
async def create_task(task: Dict):
    tasks_repo = get_repo()
    global current_task_id
    current_task_id+=1
    task['id'] = str(current_task_id)
    tasks_repo[current_task_id] = task
    save_repo()
    logging.info(f"New task {current_task_id} created")
    return task


@app.get("/tasks/{task_id}")
async def get_task(task_id: str):
    tasks_repo = get_repo()
    if task_id not in tasks_repo:
        return Response(status_code=404)

    return tasks_repo.get(task_id)


@app.put("/tasks/{task_id}")
async def update_task(task_id: str, updated_task: Dict):
    tasks_repo = get_repo()
    if task_id not in tasks_repo:
        return Response(status_code=404)

    print(updated_task)
    updated_task['id'] = task_id
    tasks_repo[task_id] = updated_task
    save_repo()
    logging.info(f"Task {task_id} updated")


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    tasks_repo = get_repo()
    if task_id not in tasks_repo:
        return Response(status_code=404)
    del tasks_repo[task_id]
    save_repo()

