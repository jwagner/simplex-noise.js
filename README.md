# simplex-noise.js
[![Build Status](https://travis-ci.org/jwagner/simplex-noise.js.svg?branch=master)](https://travis-ci.org/jwagner/simplex-noise.js)

simplex-noise.js is a fast simplex noise implementation in Javascript. It works in the browser and on nodejs.

## Requirements

It requires typed arrays, if you want to use it in browsers without support
you will need to use a polyfill like [typedarray.js](http://www.calormen.com/polyfill/typedarray.js).

## Demos

- Simple 2D plasma demo on [codepen.io](http://codepen.io/jwagner/pen/BNmpdm/?editors=001).
- A more complex [3D voxel world generation](http://29a.ch/sandbox/2012/voxelworld/) example.
- Real world usage for creating film grain in my [analog film emulator](http://29a.ch/film-emulator/).

## Usage

By default simplex-noise.js will use Math.random() to seed the noise.
```javascript
// initializing a new simplex instance
// do this only once as it is relatively expensive
var simplex = new SimplexNoise(),
    value2d = simplex.noise2D(x, y),
    value3d = simplex.noise3D(x, y, z),
    value4d = simplex.noise4D(x, y, z, w);
```

You can also pass in a seed string which will then be used to initialize
the noise using the built in alea PRNG.
```javascript
var simplex = new SimplexNoise('seed'),
    value2d = simplex.noise2D(x, y),
    sameSeed = new SimplexNoise('seed'),
    differentSeed = new SimplexNoise('different seed');

sameSeed.noise2D(x, y) === value2d
differentSeed.noise2D(x, y) !== value2d
```

You can also pass an alternative random function to the constructor that is
used to build the permutation table.
This can be used with a custom pseudo random number generator:

```javascript
var random = new Alea(seed),
    simplex = new SimplexNoise(random),
    value2d = simplex.noise2D(x, y);
```

The ALEA PRNG can be found on in the npm package [alea](https://npmjs.org/package/alea).

## node.js

Node.js is also supported, you can install the package using [npm](https://npmjs.org/package/simplex-noise).

```javascript
var SimplexNoise = require('simplex-noise'),
    simplex = new SimplexNoise(Math.random),
    value2d = simplex.noise2D(x, y);
```

## Benchmarks

- [Comparison between 2D and 3D noise](http://jsperf.com/simplex-noise/4)
- [Comparison with simplex implementation in three.js](http://jsperf.com/simplex-noise-comparison/3)

For development you can open `perf/index.html` and watch the console or run `node perf/benchmark.js` in a shell.
There is also a rake task for comparing your current changes can also run `make compare`.
The command works using git stash.

## Tests

There are some simple unit tests for this library to run them
```shell
npm install && npm test
```

## Changelog

### 2.4.0
- Included a PRNG based on ALEA to directly allow seeding
- Included typescript definitions

### 2.3.0

:warning: **This release changes the output of the noise functions.** :warning:

In the future such changes will be released as a new major version.

- Corrected generation of permutation table
- Moved tests to mocha/chai
- Cleanup

### 2.2.0
- Small performance improvement for 2D noise

### 2.1.1
- Increased entropy by fixing a little initialization issue.

### 2.1.0
- AMD support

### 2.0.0
- Changed node.js api, SimplexNoise is now exported directly.
- Added unit tests

### 1.0.0
- Initial Release

## License
Copyright (c) 2015 Jonas Wagner, licensed under the MIT License (enclosed)

## Credits
This is mostly a direct javascript port of the [Java implementation](http://webstaff.itn.liu.se/~stegu/simplexnoise/SimplexNoise.java)
by Stefan Gustavson and Peter Eastman.

The integrated pseudo random generator is based on code by by Johannes Baagøe.

The typescript definition has been provided by [Neonit](https://github.com/Neonit).
