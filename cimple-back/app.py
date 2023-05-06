from fastapi import FastAPI, UploadFile, File, Query, Response

from local_repo import TaskRepo
from model.task import Task

app = FastAPI()

task_repo = TaskRepo()


@app.get("/tasks")
async def get_tasks():
    return task_repo.task_list


@app.post("/tasks")
async def create_task(task: Task):
    task_repo.add(task)
    return task


@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    return task_repo.get(task_id)


@app.get("/tasks/{task_id}/script")
async def get_task(task_id: int):
    return Response(task_repo.get(task_id).script, media_type="text/plain")


@app.get("/tasks/{task_id}/image")
async def get_task(task_id: int):
    return Response(task_repo.get(task_id).image, media_type="text/plain")


@app.put("/tasks/{task_id}")
async def update_task(task_id: int, updated_task: Task):
    task_repo.update(task_id, updated_task)


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    task_repo.delete(task_id)


@app.post("/tasks/{task_id}/trigger")
async def trigger_task(task_id: int):
    build = task_repo.get(task_id).trigger()

    response_data = {
        "id": task_id,
        "build": build
    }

    return response_data


@app.post("/tasks/{task_id}/builds/{build_id}")
async def build_completed(task_id: int, build_id: int, exit_code: int = Query(...), file: UploadFile = File(...)):
    log_output = await file.read()
    task_repo.get(task_id).complete(build_id, log_output, exit_code)

