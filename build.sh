#!/bin/bash

set -e

for D in $(ls -1d --color=none cimple-*)
do
    echo $D
    if [ ! -d $D ]; then
        continue
    fi
    cd $D
    docker build -t taksan/$D:v1 .
    docker push taksan/$D:v1 
    cd ..
done
