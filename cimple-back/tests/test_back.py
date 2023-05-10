import os.path
import time

import pytest

from fastapi.testclient import TestClient

from cimple_back.app import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def cleanup_repo():
    from cimple_back.app import task_repo
    yield
    task_repo.reset()


def test_when_fetching_tasks_should_return_empty():
    response = client.get("/tasks")
    assert response.status_code == 200
    assert response.json() == {}


def test_when_task_is_created_should_return_new_task():
    created_task = create_one_task()
    del created_task['created']
    assert created_task == {'id': 1,
                            'name': 'a task',
                            'script': 'echo "happy day"',
                            'memory': '20Mi',
                            'cpu': '0.2',
                            'builds': [],
                            'image': '',
                            'schedule': None}


def test_when_task_is_created_should_list_should_return_created_task():
    created_task = create_one_task()

    response = client.get('/tasks')
    assert response.status_code == 200
    assert response.json() == {'1': created_task}


def test_when_task_is_created_should_get_should_return_created_task():
    created_task = create_one_task()

    response = client.get(f'/tasks/{created_task["id"]}')
    assert response.status_code == 200
    assert response.json() == created_task


def test_when_task_is_updated_should_list_and_get_updated_task():
    created_task = create_one_task()

    created_task['name'] = "updated name"
    task_id = str(created_task["id"])
    response = client.put(f'/tasks/{task_id}', json=created_task)
    assert response.status_code == 200

    response = client.get(f'/tasks/{task_id}')
    assert response.status_code == 200
    assert response.json()['name'] == "updated name"

    response = client.get(f'/tasks')
    assert response.status_code == 200
    assert response.json()[task_id]['name'] == "updated name"


def test_when_task_is_deleted_list_should_be_empty():
    create_one_task()
    response = client.delete(f'/tasks/1')
    assert response.status_code == 200

    response = client.get('/tasks')
    assert response.status_code == 200
    assert response.json() == {}


def test_when_fetching_task_that_doesnt_exist_should_return_404():
    response = client.get(f'/tasks/1')
    assert response.status_code == 404


def test_when_deleting_task_that_doesnt_exist_should_return_404():
    response = client.delete(f'/tasks/1')
    assert response.status_code == 404


def test_when_updating_task_that_doesnt_exist_should_return_404():
    response = client.put(f'/tasks/1', json={'name': 'a task', 'script': 'some stuff'})
    assert response.status_code == 404


def test_when_fetching_single_field_should_get_plain_text_value():
    create_one_task()

    response = client.get("/tasks/1/field/script")
    assert response.status_code == 200
    assert response.text == 'echo "happy day"'


@pytest.mark.timeout(1)
def test_when_trigger_script_should_be_executed(tmp_path):
    mock_result_file = tmp_path / "temp.txt"
    os.environ['MOCK_OUTPUT_FILE'] = str(mock_result_file)

    create_one_task()

    response = client.post("/tasks/1/trigger")
    assert response.status_code == 200
    trigger_data = response.json()
    assert trigger_data == {'taskId': 1, 'buildNumber': 0, 'task': 'a task'}

    while not os.path.exists(mock_result_file):
        time.sleep(0.01)

    with open(mock_result_file) as f:
        assert f.read().strip() == "task_id=1,build_id=0"

    with open(mock_result_file, "r") as f:
        response = client.post("/tasks/1/builds/0?exit_code=0", files={'file': f})
        assert response.status_code == 200

    response = client.get("/tasks/1")
    assert response.status_code == 200
    builds = response.json()['builds']
    assert builds[0]['output'].strip() == "task_id=1,build_id=0"
    assert builds[0]['exit_code'] == 0


def create_one_task():
    response = client.post('/tasks',
                           json={'name': 'a task', 'script': 'echo "happy day"', 'memory': '20Mi', 'cpu': '0.2'})
    assert response.status_code == 200

    return response.json()
