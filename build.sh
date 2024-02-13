#!/bin/sh
mkdir -p dist
# commonjs build
tsc --build tsconfig-commonjs.json
# esm build
tsc --build tsconfig-esm.json
echo '{"type": "module"}' > dist/esm/package.json
# react-native build
mkdir -p tmp
jscodeshift --transform=./react-native/build.ts --parser=ts --extensions=ts --print --dry --silent simplex-noise.ts > ./tmp/simplex-noise.ts
tsc --build tsconfig-react-native.json
rm -rf tmp