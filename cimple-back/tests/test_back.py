import json
import os.path
import re
import time

import pytest
from fastapi.testclient import TestClient
from freezegun import freeze_time

from cimple_back.back import server, task_repo


class WebSocketServer:
    def send_message(self, message):
        # Implementation of sending message
        pass


class CustomTestClient(TestClient):
    def request(self, *args, **kwargs):
        kwargs.setdefault('headers', {})
        kwargs['headers']['X-CLIENT-ID'] = 'bob'

        return super().request(*args, **kwargs)


client = CustomTestClient(server)


@pytest.fixture(autouse=True)
def cleanup_repo(tmp_path):
    audit_log_file = os.environ["AUDIT_LOG_FILE"]
    if os.path.exists(audit_log_file):
        os.truncate(audit_log_file, 0)

    yield

    task_repo.reset()
    os.truncate(audit_log_file, 0)


def get_audit_logs():
    with open(os.environ["AUDIT_LOG_FILE"]) as file:
        return file.read()


def test_when_fetching_tasks_should_return_empty():
    response = client.get("/tasks")
    assert response.status_code == 200
    assert response.json() == {}


@freeze_time("2023-06-01")
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
    assert get_audit_logs().strip() == "[2023-05-31 21:00:00,000] INFO: [testclient] [bob] Task 'a task' created"


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


@freeze_time("2023-06-01")
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

    assert get_audit_logs() == "[2023-05-31 21:00:00,000] INFO: [testclient] [bob] Task 'a task' created\n" \
                               "[2023-05-31 21:00:00,000] INFO: [testclient] [bob] Task 'a task' updated\n"


@freeze_time("2023-06-01")
def test_when_task_is_deleted_list_should_be_empty():
    create_one_task()
    response = client.delete(f'/tasks/1')
    assert response.status_code == 200

    response = client.get('/tasks')
    assert response.status_code == 200
    assert response.json() == {}

    assert get_audit_logs() == "[2023-05-31 21:00:00,000] INFO: [testclient] [bob] Task 'a task' created\n" \
                               "[2023-05-31 21:00:00,000] INFO: [testclient] [bob] Task 'a task' removed\n"


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
@freeze_time("2023-06-01")
def test_when_trigger_script_should_be_executed(tmp_path):
    with client.websocket_connect("/ws") as websocket:
        websocket.send_json({"clientId": "bob"})
        websocket.receive_json()  # discard handshake

        mock_result_file = tmp_path / "temp.txt"
        os.environ['MOCK_OUTPUT_FILE'] = str(mock_result_file)

        create_one_task()

        response = client.post("/tasks/1/trigger", headers={'X-bob': 'bob'})
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
        assert builds[0]['started_by'] == 'bob'

        assert get_audit_logs() == \
               "[2023-05-31 21:00:00,000] INFO: [testclient] [bob] Task 'a task' created\n" \
               "[2023-05-31 21:00:00,000] INFO: [testclient] [bob] Task 'a task' build #0 started\n" \
               "[2023-05-31 21:00:00,000] INFO: [testclient] [bob] Task 'a task' build #0 completed (exit code = 0)\n"

        serialized_build = json.loads(json.dumps(builds[0], default=str))
        assert websocket.receive_json() == {"type": "build_completed",
                                            "message": "build #0 completed",
                                            "details": serialized_build}


@pytest.mark.timeout(1)
@freeze_time('2023-06-01')
def test_when_trigger_script_fails_to_start_sends_notification(tmp_path):
    with client.websocket_connect("/ws") as websocket:
        websocket.send_json({"clientId": "bob"})
        websocket.receive_json()  # discard handshake

        current_script_path = os.path.dirname(os.path.abspath(__file__))
        task_executor = f"{current_script_path}/missing-executor.sh"
        os.environ['TASK_EXECUTOR'] = task_executor

        create_one_task()

        response = client.post("/tasks/1/trigger")
        assert response.status_code == 200
        trigger_data = response.json()
        assert trigger_data == {'taskId': 1, 'buildNumber': 0, 'task': 'a task'}

        build_result = websocket.receive_json()
        build = client.get("/tasks/1").json()['builds'][0]
        assert build_result == {"type": "build_completed",
                                "message": "build #0 failed to start",
                                "details": build}

        actual = re.sub(f".*{re.escape(task_executor)}", os.environ['TASK_EXECUTOR'], build['output'].strip())
        assert actual == f"{task_executor}: not found"
        assert build['exit_code'] == 127


def test_websocket_endpoint():
    with client.websocket_connect("/ws") as websocket:
        websocket.send_json({"clientId": "bob"})
        assert websocket.receive_json() == {"type": "handshake", "message": "Welcome bob"}


def create_one_task(script='echo "happy day"'):
    response = client.post('/tasks',
                           json={'name': 'a task', 'script': script, 'memory': '20Mi', 'cpu': '0.2'})
    assert response.status_code == 200

    return response.json()
