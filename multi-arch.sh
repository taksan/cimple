#!/bin/bash

set -eo pipefail

ARCH=$(uname -m)
VERSION=$(git branch --show-current)
for D in $(ls -1d --color=none cimple-*)
do
    if [ ! -d $D ]; then
        continue
    fi
    IMAGE=taksan/$D
    echo "Creating manifest for $IMAGE"
    docker pull $IMAGE:${VERSION}-aarch64
    docker manifest rm $IMAGE:${VERSION} || true
    docker manifest create $IMAGE:${VERSION} --amend $IMAGE:${VERSION}-aarch64 --amend $IMAGE:${VERSION}-$ARCH
    docker manifest push $IMAGE:${VERSION}
done

