all: tests simplex-noise.min.js

tests:
	jshint simplex-noise.js
	./node_modules/buster/bin/buster-test

benchmark:
	node ./perf/benchmark.js

compare:
	@echo "old"
	@git stash >> /dev/null
	@node ./perf/benchmark.js
	@git stash pop >> /dev/null
	@echo "new"
	@node ./perf/benchmark.js

install:
	npm install --dev


simplex-noise.min.js: simplex-noise.js
	echo "/*! simplex-noise.js: copyright 2012 Jonas Wagner, licensed under a MIT license. See https://github.com/jwagner/simplex-noise.js for details */" > simplex-noise.min.js
	uglifyjs -nc --unsafe < simplex-noise.js >> simplex-noise.min.js
