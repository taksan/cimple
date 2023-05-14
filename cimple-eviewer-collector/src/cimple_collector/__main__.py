import asyncio
import logging
import os

from cimple_collector.send_to_peer import send_data_to_remote
from cimple_collector.watch_file import watch_file

# Configure the logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[logging.StreamHandler()]
)


def main():
    events_file = os.environ.get("EVENTS_FILE", "audit.log")
    target = os.environ.get('CIMPLE_COLLECTOR_PEER_URL', None)
    if not target:
        raise ValueError("CIMPLE_COLLECTOR_PEER_URL is not set")
    watch_file(events_file, send_data_to_remote)
    asyncio.get_event_loop().run_forever()


if __name__ == "__main__":
    main()
