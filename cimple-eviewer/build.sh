#!/usr/bin/env bash

set -euo pipefail

(
  cd front
  npm run build
)

(
  cd back
  npm run build
)

cp -rf back/dist build
