import asyncio
import logging
import os
from typing import Callable

import pyinotify


def trigger_when_file_exists(file_to_watch_name: str, callback: Callable[[str], None]):
    def on_created(event):
        if event.name == os.path.basename(file_to_watch_name):
            callback(file_to_watch_name)

    loop = asyncio.get_event_loop()
    file_dir = os.path.dirname(file_to_watch_name)
    wm = pyinotify.WatchManager()
    mask = pyinotify.IN_CREATE
    pyinotify.AsyncioNotifier(wm, loop)
    wm.add_watch(file_dir, mask, on_created)


def watch_file(file_to_watch_name: str, callback: Callable[[str], None], new_file: bool = False):
    if not os.path.exists(file_to_watch_name):
        logging.info(f"File {file_to_watch_name} does not exist, waiting for it to be created")
        trigger_when_file_exists(file_to_watch_name, lambda x: watch_file(x, callback, True))
        return

    file_being_watched = open(file_to_watch_name, "r")

    def on_changes(_event):
        for line in file_being_watched.readlines():
            callback(line)
    if not new_file:
        file_being_watched.seek(0, os.SEEK_END)
    else:
        on_changes(None)
    logging.info(f"Watching file {file_to_watch_name}")
    wm = pyinotify.WatchManager()
    mask = pyinotify.IN_MODIFY

    loop = asyncio.get_event_loop()
    pyinotify.AsyncioNotifier(wm, loop)

    wm.add_watch(file_to_watch_name, mask, on_changes)
