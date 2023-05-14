import asyncio
import os
import tempfile

import pytest

from cimple_collector.send_to_peer import send_data_to_remote
from cimple_collector.watch_file import watch_file


@pytest.fixture(autouse=True)
def clean_env():
    yield
    if 'CIMPLE_COLLECTOR_PEER_URL' in os.environ:
        del os.environ['CIMPLE_COLLECTOR_PEER_URL']


@pytest.fixture(scope='function')
def temp_file():
    with tempfile.NamedTemporaryFile() as temp_file:
        yield temp_file


@pytest.mark.asyncio
async def test_watch_file_should_trigger_when_new_content_is_written(temp_file):
    read_content = {'data': []}
    written = asyncio.Event()

    temp_file.write(b"this content should be ignored\n")
    temp_file.flush()

    def callback(content):
        read_content['data'] += [content]
        written.set()

    watch_file(temp_file.name, callback)

    temp_file.write(b"only this content matters\n")
    temp_file.flush()

    await written.wait()

    assert read_content['data'][0].strip() == 'only this content matters'


def test_should_send_string_to_peer(mocker):
    os.environ['CIMPLE_COLLECTOR_PEER_URL'] = 'http://localhost:8080'
    post_mock = mocker.patch('requests.post')
    post_mock.return_value.status_code = 200

    send_data_to_remote("test")

    assert (post_mock.call_count == 1)
    assert (post_mock.call_args.kwargs['url'] == 'http://localhost:8080')
    assert (post_mock.call_args.kwargs['data'] == 'test')


def test_should_fail_when_url_is_not_configured():
    try:
        send_data_to_remote("test")
        raise Exception("Should have failed")
    except Exception as e:
        assert str(e) == "CIMPLE_COLLECTOR_PEER_URL variable is not set"


@pytest.mark.asyncio
async def test_should_wait_until_file_exists(temp_file):
    os.remove(temp_file.name)

    read_content = {'data': []}
    written = asyncio.Event()

    def callback(content):
        read_content['data'] += [content]
        written.set()

    watch_file(temp_file.name, callback)

    with open(temp_file.name, 'w') as f:
        f.write("only this content matters")
        temp_file.flush()

    await written.wait()

    assert read_content['data'][0].strip() == 'only this content matters'
