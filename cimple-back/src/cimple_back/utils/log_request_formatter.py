import logging


class LogRequestFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        client_ip = "-"
        client_id = "-"
        if hasattr(record, "client_ip"):
            client_ip = record.client_ip
        if hasattr(record, "client_id"):
            client_id = record.client_id

        record.msg = f"[{client_ip}] [{client_id}] {record.msg}"
        return super().format(record)
