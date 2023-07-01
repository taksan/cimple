#!/bin/bash

set -eo pipefail

APP=$1
VERSION=$2

if [[ -z $APP ]]; then
    echo "You must speficify the app"
    exit 1
fi
if [[ -z "$VERSION" ]]; then
    echo "you must specify the branch to generate"
    exit 1
fi

ARCH=$(uname -m)
cd $APP
docker build -t taksan/$APP:v$VERSION-$ARCH .
docker push taksan/$APP:v$VERSION-$ARCH 

