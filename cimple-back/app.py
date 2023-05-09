import logging
import os

from fastapi import FastAPI, UploadFile, File, Query, Response
from fastapi.middleware.cors import CORSMiddleware

from local_repo import TaskRepo
from model.task import Task
from remote_repo import RemoteRepo

# Configure the logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.StreamHandler()]
)

app = FastAPI()

task_repo = TaskRepo() if os.environ.get("STORE_DOMAIN") is None else RemoteRepo()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/tasks")
async def get_tasks():
    return task_repo.list()


@app.post("/tasks")
async def create_task(task: Task):
    task_repo.add(task)
    logging.info(f"Task '{task.name}' created")
    return task


@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    return task_repo.get(task_id)


@app.put("/tasks/{task_id}")
async def update_task(task_id: int, updated_task: Task):
    task_repo.update(task_id, updated_task)
    logging.info(f"Task '{updated_task.name}' updated")


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    task_to_remove = task_repo.get(task_id)
    task_repo.delete(task_id)
    logging.info(f"Task '{task_to_remove.name}' removed")
    return {'taskId': task_id, 'detail': 'removal succeeded'}


@app.post("/tasks/{task_id}/trigger")
async def trigger_task(task_id: int):
    task = task_repo.get(task_id)
    build = task.trigger()

    task_repo.update(task_id, task)

    response_data = {
        "taskId": task_id,
        "buildNumber": build.id,
        "task": task.name
    }
    logging.info(f"Task '{task.name}' build #{build.id} started")

    return response_data


@app.post("/tasks/{task_id}/builds/{build_id}")
async def build_completed(task_id: int, build_id: int, exit_code: int = Query(...), file: UploadFile = File(...)):
    log_output = await file.read()
    task = task_repo.get(task_id)
    task.complete(build_id, log_output, exit_code)
    task_repo.update(task_id, task)
    logging.info(f"Task '{task.name}' build #{build_id} completed")


@app.get("/tasks/{task_id}/field/{field}")
async def get_task(task_id: int, field: str):
    return Response(getattr(task_repo.get(task_id), field), media_type="text/plain")
