#!/bin/sh

export TASK_ID=$1
export BUILD_ID=$2
export TASK_IMAGE
export MEMORY_LIMIT
export CPU_LIMIT
# shellcheck disable=SC2039
export JOB_NAME="job-$RANDOM-${TASK_ID}-${BUILD_ID}"
export BACKEND_SERVICE

TASK_IMAGE=$(curl -s http://localhost:8000/tasks/"$TASK_ID"/field/image)
MEMORY_LIMIT=$(curl -s http://localhost:8000/tasks/"$TASK_ID"/field/memory_limit)
CPU_LIMIT=$(curl -s http://localhost:8000/tasks/"$TASK_ID"/field/cpu_limit)

if [ -z "$BACKEND_SERVICE" ]; then
  BACKEND_SERVICE="http://cimple-back"
fi

if  [ -z "$TASK_IMAGE" ]; then
  echo "Image not specified, using 'alpine' as default image"
  TASK_IMAGE=alpine
else
  echo "Image specified: $TASK_IMAGE. Warning, only alpine based images are officially supported"
fi

echo "Will run task $TASK_ID with image $TASK_IMAGE and build $BUILD_ID, job name: $JOB_NAME"
envsubst < templates/job-template.yml | kubectl apply -f -
