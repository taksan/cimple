import logging
import os

from cimple_back.utils.log_request_formatter import LogRequestFormatter

_request_formatter = LogRequestFormatter("[%(asctime)s] %(levelname)s: %(message)s")

audit_logs = os.environ.get("AUDIT_LOG_FILE", 'logs/audit_events.log')
# create all directories required for AUDIT_LOG_FILE.
os.makedirs(os.path.dirname(audit_logs), exist_ok=True)

_file_handler = logging.FileHandler(audit_logs)
_file_handler.setLevel(logging.INFO)
_file_handler.setFormatter(_request_formatter)

EVENT_LOGGER = logging.getLogger("Event Logger")
EVENT_LOGGER.setLevel(logging.INFO)
EVENT_LOGGER.addHandler(_file_handler)
