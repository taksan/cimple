import contextvars
import logging


class LogFilterRequestIP(logging.Filter):
    def __init__(self, name: str = ''):
        super().__init__(name)
        self.current_request = contextvars.ContextVar("current_request")

    def filter(self, record: logging.LogRecord) -> bool:
        record.client_ip = "-"
        current_req = self.current_request.get()
        if current_req is not None:
            record.client_ip = current_req.client.host

        return True
