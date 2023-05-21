import os

import requests

_ENVIRONMENT = None


def send_data_to_remote(param):
    target = os.environ.get('CIMPLE_COLLECTOR_PEER_URL', None)
    if target is None:
        # should raise exception
        raise Exception("CIMPLE_COLLECTOR_PEER_URL variable must be set")

    message = {"environment": get_namespace(), "content": param}
    print(f"will send : {message} to {target}")
    requests.post(url=target, json=message)


def get_namespace():
    global _ENVIRONMENT
    if _ENVIRONMENT is not None:
        return _ENVIRONMENT

    if os.path.exists("/var/run/secrets/kubernetes.io/serviceaccount/namespace"):
        # running on kubernetes, so use the namespace as the environment
        with open("/var/run/secrets/kubernetes.io/serviceaccount/namespace", "r") as f:
            _ENVIRONMENT = f.read()
    elif os.path.exists("/etc/hostname"):
        # running on linux, so use the hostname as the environment
        with open("/etc/hostname", "r") as f:
            _ENVIRONMENT = f.read()
    else:
        # can't figure out the environment, so default to unknown
        _ENVIRONMENT = "unknown"
    _ENVIRONMENT = _ENVIRONMENT.strip()
    return _ENVIRONMENT
