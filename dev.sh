#!/usr/bin/env bash

set -eou pipefail

source ./task-decorator.sh

export STORE_USER=storeuser
export STORE_PASS=storepassword

if [ ! -e venv ]; then
  python3 -m venv venv
fi
source venv/bin/activate
export PATH=$PATH:./venv/bin

(
  task "cimple-store"
  cd cimple-store
  pip install --upgrade .
  cimple-store
) &

(
  task "cimple-back"
  cd cimple-back
  pip install --upgrade .
  export STORE_URL=http://localhost:8001
  cimple-back
) &

(
  task "cimple-front"

  cd cimple-front
  yarn
  yarn start
) &

(
  task "cimple-eviewer:back"
  cd cimple-eviewer/back
  yarn
  yarn start
) &

(
  task "cimple-eviewer:front"
  cd cimple-eviewer/front
  yarn
  yarn start
) &

(
  task "cimple-eviewer-collector"
  cd cimple-eviewer-collector
  pip install --upgrade .
  export CIMPLE_COLLECTOR_PEER_URL=http://localhost:5000
  cimple-collector
) &

wait
