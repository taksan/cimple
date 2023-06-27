#!/usr/bin/env bash

set -euo pipefail

(
  cd front
  npm run build
)

rm -rf back/dist
(
  cd back
  npm run build
)

cp -rf back/dist build
