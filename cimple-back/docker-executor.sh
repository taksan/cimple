#!/usr/bin/env bash

trap "rm -f task-script.sh output.log" EXIT

# fetch the docker network
NETWORK=$(docker inspect "$HOSTNAME" -f '{{range $k, $v := .NetworkSettings.Networks}}{{printf "%s\n" $k}}{{end}}')
BACKEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$HOSTNAME")

TASK_ID=$1
BUILD_ID=$2
TASK_IMAGE=$(curl -s http://localhost:8000/tasks/"$TASK_ID"/field/image)
if  [ -z "$TASK_IMAGE" ]; then
  echo "Image not specified, using 'alpine' as default image"
  TASK_IMAGE=alpine
fi

docker run --rm --name job-for-task-"$TASK_ID" --network "$NETWORK" "$TASK_IMAGE" /bin/sh -c "
if ! which curl >/dev/null; then
  echo 'curl not found, will try to install it'
  if which apk >/dev/null; then
    echo 'installing curl'
    apk add --no-cache curl
  elif which apt > /dev/null; then
    echo 'installing curl'
    apt update && apt install -y curl
  elif which yum > /dev/null; then
    echo 'installing curl'
    yum -y install curl
  else
    echo 'Cant install curl, this linux flavor is not supported'
    exit 1
  fi
fi
curl -s http://$BACKEND_IP:8000/tasks/$TASK_ID/field/script > task-script.sh
chmod u+x task-script.sh
./task-script.sh >output.log 2>&1
STATUS=\$?
curl -s -X POST -F 'file=@output.log' http://$BACKEND_IP:8000/tasks/$TASK_ID/builds/$BUILD_ID?exit_code=\$STATUS
"
