#!/bin/sh
set -ex
node_modules/.bin/tsc
node_modules/.bin/tsc -p src
