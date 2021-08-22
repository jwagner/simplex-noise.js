#!/bin/sh
npm run-scripts docs
rsync -rv public/ x.29a.ch:/var/www/static/simplex-noise/