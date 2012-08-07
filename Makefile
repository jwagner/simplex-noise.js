all: simplex-noise.min.js

simplex-noise.min.js: simplex-noise.js
	jshint simplex-noise.js
	uglifyjs < simplex-noise.js > simplex-noise.min.js
