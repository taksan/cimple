#!/bin/bash

set -e

VERSION=$(git branch --show-current)

ARCH=$(uname -m)
for D in $(ls -1d --color=none cimple-*)
do
    echo $D
    if [ ! -d $D ]; then
        continue
    fi
    cd $D
    docker build -t taksan/$D:$VERSION-$ARCH .
    docker push taksan/$D:$VERSION-$ARCH 
    cd ..
done
