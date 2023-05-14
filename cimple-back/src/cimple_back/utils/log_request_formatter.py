import logging


class LogRequestFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        client_ip = "[-]"
        if hasattr(record, "client_ip"):
            client_ip = record.client_ip

        record.msg = f"[{client_ip}] {record.msg}"
        return super().format(record)
