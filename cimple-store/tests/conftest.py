import os


def pytest_configure(config):
    os.environ['STORE_USER'] = 'fakeuser'
    os.environ['STORE_PASS'] = 'fakepass'
    os.environ['DB_FILE'] = 'fakefile.json'
