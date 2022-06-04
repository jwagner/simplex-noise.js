#!/bin/sh
npm run docs
cd examples
npx webpack -c webpack.config.js
cd ..
#rsync -rv public/ x.29a.ch:/var/www/static/simplex-noise/