#!/usr/bin/env bash

trap "rm -f task-script.sh output.log" EXIT

TASK_ID=$1
BUILD_ID=$2

curl -s http://localhost:8000/tasks/"$TASK_ID"/field/script > task-script.sh
chmod u+x task-script.sh

./task-script.sh > output.log 2>&1
STATUS=$?

curl -s -X POST -F "file=@output.log" http://localhost:8000/tasks/"$TASK_ID"/builds/"$BUILD_ID"?exit_code="$STATUS"
