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

items_repo = Repo(os.environ.get("DB_FILE", "tasks.json"))
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


@app.get("/items")
async def get_items():
    global items_repo
    return items_repo.list()


@app.post("/items")
async def create_item(item: Dict):
    global items_repo
    items_repo += item
    logging.info(f"New item {item['id']} created")

    return item


@app.get("/items/{item_id}")
async def get_task(item_id: str):
    global items_repo
    if item_id not in items_repo:
        return Response(status_code=404)

    return items_repo[item_id]


@app.put("/items/{task_id}")
async def update_task(item_id: str, updated_item: Dict):
    global items_repo
    if item_id not in items_repo:
        return Response(status_code=404)

    updated_item['id'] = item_id
    items_repo[item_id] = updated_item
    logging.info(f"Item {item_id} updated")


@app.delete("/items/{item_id}")
async def delete_task(item_id: str):
    global items_repo
    if item_id not in items_repo:
        return Response(status_code=404)
    del items_repo[item_id]
    logging.info(f"Item {item_id} removed")
