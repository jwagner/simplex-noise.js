# simplex-noise.js

[API Documentation](https://29a.ch/simplex-noise/docs/classes/SimplexNoise.html)

[![Tests](https://github.com/jwagner/simplex-noise.js/actions/workflows/tests.yml/badge.svg)](https://github.com/jwagner/simplex-noise.js/actions/workflows/tests.yml) [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)


simplex-noise.js is a simplex noise implementation in Javascript/TypeScript.
It works in the browser and nodejs. Using Commonjs and ES Modules.
It is self contained (dependency free), relatively small (about 2k minified and gzipped)
and fairly fast (about 20 nanoseconds for a sample of 2d noise).

## Demos

- Simple 2D plasma on [codepen.io](http://codepen.io/jwagner/pen/BNmpdm/?editors=001).
- [3D voxel world generation](http://29a.ch/sandbox/2012/voxelworld/) example.
- Film grain in [analog film emulator](http://29a.ch/film-emulator/).

Created something awesome with simplex-noise? Let me know so I can add it to the list.

## Installation

```npm i -S simplex-noise```

## Usage

```javascript
// when using es modules
import SimplexNoise from 'simplex-noise';
// when using commonjs
const {SimplexNoise} = require('simplex-noise');
```

By default simplex-noise.js will use Math.random() to seed the noise.
```javascript
// initializing a new simplex instance
// do this only once as it is relatively expensive
const simplex = new SimplexNoise(),
    value2d = simplex.noise2D(x, y),
    value3d = simplex.noise3D(x, y, z),
    value4d = simplex.noise4D(x, y, z, w);
```

You can also pass in a seed string which will then be used to initialize
the noise using the built in alea PRNG.
```javascript
const simplex = new SimplexNoise('seed'),
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
const random = new Alea(seed),
    simplex = new SimplexNoise(random),
    value2d = simplex.noise2D(x, y);
```

The ALEA PRNG can be found in the npm package [alea](https://npmjs.org/package/alea).

## node.js

Node.js is also supported, you can install the package using [npm](https://npmjs.org/package/simplex-noise).

```javascript
const SimplexNoise = require('simplex-noise'),
    simplex = new SimplexNoise(Math.random),
    value2d = simplex.noise2D(x, y);
```

## Benchmarks

simplex-noise.js is reasonably quick.
According to `perf/benchmark.js` I can perform about 50 million `noise2D()` calls/second on a single thread on my desktop (Ryzen 5950X).
So ~20 nanoseconds per call.

```
$ node perf/index.js
27745787.933336906
init: 192,590 ops/sec ±1%
noise2D: 57,928,891 ops/sec ±1%
noise3D: 34,159,230 ops/sec ±0%
noise4D: 24,589,786 ops/sec ±0%
```

At least at a glance it also seems to be faster than 'fast-simplex-noise':
```
simplex-noise noise2D: 53,429,815 ops/sec ±0%
fast-simplex-noise noise2D: 6,239,845 ops/sec ±0%

simplex-noise noise4D: 22,578,593 ops/sec ±0%
fast-simplex-noise noise4D: 5,292,975 ops/sec ±0%
```

## Tests

There are some simple unit tests for this library to run them
```shell
npm install && npm test
```

## Changelog

### 3.0.1
- Include simplex-noise.ts as source file, fixes sourcemap warnings.

### 3.0.0
- Changed module structure. When using bundlers that import the es module even using require() the import might need to be updated.
- Dependency update
- Setting sideEffects: false in package.json
- Added snapshot tests
- Code converted to typescript, the package can of course still be used from regular JS
- Dropped bower
- Added support for es modules

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


## Requirements

It requires typed arrays. If you want to use it in browsers without support
you will need to use a polyfill like [typedarray.js](http://www.calormen.com/polyfill/typedarray.js).


## License
Copyright (c) 2021 Jonas Wagner, licensed under the MIT License (enclosed)

## Credits
This is mostly a direct javascript port of the [Java implementation](http://webstaff.itn.liu.se/~stegu/simplexnoise/SimplexNoise.java)
by Stefan Gustavson and Peter Eastman.

The integrated pseudo random generator is based on code by by Johannes Baagøe.

The initial typescript definition has been provided by [Neonit](https://github.com/Neonit).
