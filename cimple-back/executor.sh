#!/usr/bin/env bash

trap "rm -f task-script.sh output.log" EXIT

TASK_ID=$1
BUILD_ID=$2

curl http://localhost:8000/tasks/"$TASK_ID"/script > task-script.sh
chmod u+x task-script.sh

./task-script.sh > output.log 2>&1
STATUS=$?

curl -X POST -F "file=@output.log" http://localhost:8000/tasks/"$TASK_ID"/builds/"$BUILD_ID"?exit_code="$STATUS"
