#!/bin/bash

set -eo pipefail

APP=$1
VERSION=$(git branch --show-current)

if [[ -z $APP ]]; then
    echo "You must speficify the app"
    exit 1
fi

ARCH=$(uname -m)
cd $APP
docker build -t taksan/$APP:$VERSION-$ARCH .
docker push taksan/$APP:$VERSION-$ARCH 

