import os

import requests


def send_data_to_remote(param):
    target = os.environ.get('CIMPLE_COLLECTOR_PEER_URL', None)
    if target is None:
        # should raise exception
        raise Exception("CIMPLE_COLLECTOR_PEER_URL variable is not set")

    requests.post(url=target, data=param)
