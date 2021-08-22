#!/bin/bash
NAME=$(jq -r .name package.json)
set -e
node_major_version=$(node --version|sed 's/v\([^.]*\).*/\1/g')
rm -rf e2e
mkdir -p e2e
rm -f $($NAME*.tgz)
npm pack
tarball=($NAME*.tgz)
mv "$tarball" e2e
cd e2e
cp -R ../test/module-compatibility .
cd module-compatibility
npm install "../$tarball" 
echo "testing node commonjs"
node commonjs.js
if [ "$node_major_version" -ge 14 ]
  then
  echo "testing typescript"
  cp esm.mjs typescript.ts
  node --loader ts-node/esm  typescript.ts
    echo "testing node esm"
    node esm.mjs
fi
cd ..

cd ..
rm -rf e2e