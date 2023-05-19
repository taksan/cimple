import os

import pytest
from cimple_store.store import app, items_repo
from fastapi.testclient import TestClient

client = TestClient(app)
auth = {"Authorization": "Basic ZmFrZXVzZXI6ZmFrZXBhc3M="}


@pytest.fixture(autouse=True)
def cleanup_db():
    items_repo.reset()
    yield
    print("auto remove")
    if os.path.exists(os.environ['DB_FILE']):
        os.unlink(os.environ['DB_FILE'])


def test_when_requesting_without_credentials_401_is_returned():
    response = client.get("/items")
    assert response.status_code == 401


def test_when_fetching_items_should_return_empty():
    response = client.get("/items", headers=auth)
    assert response.status_code == 200
    assert response.json() == {}


def test_when_item_is_added_should_return_item():
    create_one_item()

    response = client.get("/items", headers=auth)
    assert response.json() == {'1': {'id': 1, 'name': 'a task', 'script': 'a value'}}


def test_when_fetching_existing_item_should_return():
    create_one_item()

    response = client.get("/items/1", headers=auth)
    assert response.json() == {'id': 1, 'name': 'a task', 'script': 'a value'}


def test_when_fetching_non_existing_item_should_return_404():
    response = client.get("/items/1", headers=auth)
    assert response.status_code == 404


def test_when_removing_item_should_be_removed():
    create_one_item()
    response = client.delete('/items/1', headers=auth)
    assert response.status_code == 200
    response = client.get('/items', headers=auth)
    assert response.json() == {}


def test_when_update_item_should_have_updated_value():
    create_one_item()
    response = client.put('/items/1', headers=auth, json={'name': 'new value', 'script': 'new script'})
    assert response.status_code == 200

    response = client.get('/items/1', headers=auth)
    assert response.status_code == 200
    assert response.json() == {'id': '1', 'name': 'new value', 'script': 'new script'}


def create_one_item():
    response = client.post('/items', json={'name': 'a task', 'script': 'a value'}, headers=auth)
    assert response.status_code == 200
