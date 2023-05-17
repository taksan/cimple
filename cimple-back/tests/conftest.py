import os

from _pytest.tmpdir import TempPathFactory


def pytest_configure(config):
    os.environ['RUN_WITHOUT_DATABASE'] = 'true'
    current_script_path = os.path.dirname(os.path.abspath(__file__))
    os.environ['TASK_EXECUTOR'] = f"{current_script_path}/mock-executor.sh"

    tmp_path_factory = TempPathFactory.from_config(config, _ispytest=True)
    tmpdir = tmp_path_factory.mktemp("cimple_back")
    audit_log_file = tmpdir / "audit_events.log"
    os.environ["AUDIT_LOG_FILE"] = str(audit_log_file)

    if 'STORE_URL' in os.environ:
        del os.environ['STORE_URL']
