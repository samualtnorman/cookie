#!/bin/sh
set -ex
rm dist --recursive --force
./rollup.config.js
scripts/emit-dts.sh
scripts/emit-package-json.js
cp readme.md license dist
