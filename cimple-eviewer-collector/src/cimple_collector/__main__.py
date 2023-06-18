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
    config_file = "/opt/config.json"
    events_file = "audit.log"
    peer_url = None
    if os.path.exists(config_file):
        import json
        with open(config_file, "r") as f:
            config = json.load(f)
        events_file = config.get("events_file", "audit.log")
        peer_url = config.get("peer_url", None)
    else:
        logging.warning("Config file not found, will use defaults")

    sender_function = lambda msg: send_data_to_remote(peer_url, msg)
    if not peer_url:
        logging.warning("Peer URL not set, will print to stdout")
        sender_function = lambda msg: logging.info(f"read data: {msg.strip()}")

    watch_file(events_file, sender_function)
    asyncio.get_event_loop().run_forever()


if __name__ == "__main__":
    main()
