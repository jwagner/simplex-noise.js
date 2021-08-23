#!/bin/sh
npm run-scripts docs
webpack --entry ./examples/plasma.html -o public/
cd examples
npx webpack -c webpack.config.js
cd ..
rsync -rv public/ x.29a.ch:/var/www/static/simplex-noise/