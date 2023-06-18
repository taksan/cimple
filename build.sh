#!/bin/bash

set -e

ARCH=$(uname -m)
for D in $(ls -1d --color=none cimple-*)
do
    echo $D
    if [ ! -d $D ]; then
        continue
    fi
    cd $D
    docker build -t taksan/$D:v1-$ARCH .
    cd ..
done
