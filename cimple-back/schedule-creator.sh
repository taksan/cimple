#!/usr/bin/env bash

export TASK_ID="$1"
export JOB_SCHEDULE="$2"
export CRONJOB_NAME="$3"
export CLIENT_ID="schedule manager"
export BACKEND_SERVICE

if [[ -z $BACKEND_SERVICE ]]; then
  BACKEND_SERVICE="http://cimple-back"
fi

TEMPLATE_PATH=templates/cronjob-template.yml

if [ ! -e "$TEMPLATE_PATH" ]; then
  echo "Warning: cronjob-template.yml not found, no schedule will be created"
  exit 0
fi
TEMPLATE_CONTENTS=$(cat "$TEMPLATE_PATH")
if [ -z "$TEMPLATE_CONTENTS" ]; then
  echo "Warning: cronjob-template.yml is empty, no schedule will be created"
  exit 0
fi
envsubst < "$TEMPLATE_PATH" | kubectl apply -f -
