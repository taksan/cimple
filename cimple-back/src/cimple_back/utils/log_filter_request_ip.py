import contextvars
import logging


class LogFilterRequestIP(logging.Filter):
    def __init__(self, current_request):
        super().__init__('')
        self.current_request = current_request

    def filter(self, record: logging.LogRecord) -> bool:
        record.client_ip = "-"
        current_req = self.current_request.get()
        if current_req is not None:
            record.client_ip = current_req.client.host
            record.client_id = current_req.headers.get("X-CLIENT-ID", "-")

        return True
