#!/bin/sh
mkdir -p dist
tsc --build tsconfig-commonjs.json
tsc --build tsconfig-esm.json
echo '{"type": "module"}' > dist/esm/package.json