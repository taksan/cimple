import contextvars
import logging
import os

import asyncio
from fastapi import FastAPI, UploadFile, File, Query, Response, Request, status, WebSocket
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from .event_log import EVENT_LOGGER
from .memory_repo import MemoryRepo
from .model.task import Task
from .remote_repo import RemoteRepo
from .utils.log_filter_request_ip import LogFilterRequestIP
from .websocket_manager import WebSocketManager

# Basic logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.StreamHandler()]
)

current_request = contextvars.ContextVar("current_request")
app = FastAPI()
task_repo = MemoryRepo() if os.environ.get("STORE_URL") is None else RemoteRepo()
LOG_IP_FILTER = LogFilterRequestIP(current_request)
EVENT_LOGGER.addFilter(LOG_IP_FILTER)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ProxyHeadersMiddleware)

wsManager = WebSocketManager()


@app.middleware("http")
async def add_request_to_log_filter(request: Request, call_next):
    current_request.set(request)
    response = await call_next(request)
    current_request.set(None)
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
    logging.error(f"{request}: {exc_str}")
    content = {'status_code': 10422, 'message': exc_str, 'data': None}
    return JSONResponse(content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


@app.get("/tasks")
async def get_tasks():
    return task_repo.list()


@app.post("/tasks")
async def create_task(task: Task):
    task_repo.add(task)
    EVENT_LOGGER.info(f"Task '{task.name}' created")
    return task


@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    return task_repo.get(task_id)


@app.put("/tasks/{task_id}")
async def update_task(task_id: int, updated_task: Task):
    previous_task = task_repo.get(task_id)
    task_repo.update(task_id, updated_task)
    EVENT_LOGGER.info(f"Task '{previous_task.name}' updated")


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    task_to_remove = task_repo.get(task_id)
    task_repo.delete(task_id)
    EVENT_LOGGER.info(f"Task '{task_to_remove.name}' removed")
    return {'taskId': task_id, 'detail': 'removal succeeded'}


@app.post("/tasks/{task_id}/trigger")
async def trigger_task(task_id: int, request: Request):
    task = task_repo.get(task_id)
    client_id = request.headers.get("X-CLIENT-ID")

    def handle_failure(build_id: int, log_output: str, exit_code: int):
        completed_build = task.complete(build_id, log_output, exit_code)
        task_repo.update(task_id, task)
        asyncio.run(wsManager.notify_build_result(completed_build, f"build #{build_id} failed to start"))

    build = task.trigger(client_id, handle_failure)
    task_repo.update(task_id, task)

    response_data = {
        "taskId": task_id,
        "buildNumber": build.id,
        "task": task.name
    }
    EVENT_LOGGER.info(f"Task '{task.name}' build #{build.id} started")

    return response_data


@app.post("/tasks/{task_id}/builds/{build_id}")
async def build_completed(task_id: int, build_id: int, exit_code: int = Query(...), file: UploadFile = File(...)):
    log_output = await file.read()
    task = task_repo.get(task_id)
    build = task.complete(build_id, log_output, exit_code)
    task_repo.update(task_id, task)
    EVENT_LOGGER.info(f"Task '{task.name}' build #{build_id} completed (exit code = {exit_code})")
    await wsManager.notify_build_result(build, f"build #{build_id} completed")


@app.get("/tasks/{task_id}/field/{field}")
async def get_task(task_id: int, field: str):
    return Response(getattr(task_repo.get(task_id), field), media_type="text/plain")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await wsManager.handle_client(websocket)
