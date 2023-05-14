import os


def pytest_configure(config):
    os.environ['RUN_WITHOUT_DATABASE'] = 'true'
    current_script_path = os.path.dirname(os.path.abspath(__file__))
    os.environ['TASK_EXECUTOR'] = f"{current_script_path}/mock-executor.sh"
    del os.environ['STORE_URL']
