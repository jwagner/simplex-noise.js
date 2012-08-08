all: tests simplex-noise.min.js

tests:
	jshint simplex-noise.js
	./node_modules/buster/bin/buster test


simplex-noise.min.js: simplex-noise.js
	uglifyjs --unsafe < simplex-noise.js > simplex-noise.min.js
