[![Tests](https://github.com/jwagner/simplex-noise.js/actions/workflows/tests.yml/badge.svg)](https://github.com/jwagner/simplex-noise.js/actions/workflows/tests.yml) [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

![simplex-noise.js header](./doc/github-header-fs8.png)
[API Documentation](https://29a.ch/simplex-noise/docs/modules.html)


simplex-noise.js is a simplex noise implementation in Javascript/TypeScript.
It works in the browser and Node.js, using CommonJS and ES Modules.
It is self-contained (dependency-free), relatively small (about 2k minified and gzipped)
and fairly fast (about 20 nanoseconds for a sample of 2d noise) and tree shakeable.

## Demos & Real World Examples

- [Synthwave Demo](https://29a.ch/sandbox/2022/simplex-noise-synthwave/) shown in the header
- Simple 2D plasma on [codepen.io](http://codepen.io/jwagner/pen/BNmpdm/?editors=001)
- [3D voxel world generation](https://29a.ch/sandbox/2012/voxelworld/) example
- Film grain in [analog film emulator](https://29a.ch/film-emulator/)
- [Applying volumetric wood grain to 3D prints](https://29a.ch/sandbox/2021/3d-print-texturizer/)

Created something awesome with simplex-noise? Let me know so I can add it to the list.

## Installation

```npm i -S simplex-noise```

## Usage Examples

### ES Module Import

```javascript
// import the noise functions you need
import { createNoise2D } from 'simplex-noise';
```

### CommonJS Require

```javascript
// import the noise functions you need
const { createNoise2D } = require('simplex-noise');
```

### 2D

```javascript
// initialize the noise function
const noise2D = createNoise2D();
// returns a value between -1 and 1
console.log(noise2D(x, y));
```

### 3D

```javascript
const noise3D = createNoise3D();
console.log(noise3D(x, y, z));
```

### 4D

```javascript
const noise4D = createNoise4D();
console.log(noise4D(x, y, z, w));
```

### Using a seed value

By default simplex-noise.js will use Math.random() to seed the noise.
You can pass in a PRNG function to use your own seed value.

```bash
# install the alea prng
npm install -S alea
```

```javascript
import alea from 'alea';
// create a new random function based on the seed
const prng = alea('seed');
// use the seeded random function to initialize the noise function
const noise2D = createNoise2D(prng);
console.log(noise2D(x, y));
```

The ALEA PRNG used in the example above can be found in the [alea](https://npmjs.org/package/alea) npm package.

## Benchmarks

simplex-noise.js is reasonably quick.
According to `perf/index.js` I can perform about 70 million `noise2D()` calls/second on a single thread on my desktop (Ryzen 5950X).

```
$ node perf/index.js
noise2D: 72,916,215 ops/sec ±1%
noise3D: 47,855,199 ops/sec ±0%
noise4D: 35,564,111 ops/sec ±0%
```

## Migrating from 3.x to 4.x

### random initialization
```javascript
// 3.x
import SimplexNoise from 'simplex-noise';
const simplex = new SimplexNoise();
const value2d = simplex.noise2D(x, y);
// 4.x
// import the functions you need
import { createNoise2D } from 'simplex-noise';
const noise2D = createNoise2D();
const value2d = noise2D(x, y);
```

### Initialization with a seed
```javascript
// 3.x
import SimplexNoise from 'simplex-noise';
const simplex = new SimplexNoise('seed');
const value2d = simplex.noise2D(x, y);
// 4.x
// npm install -S alea
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
const noise2D = createNoise2D(alea('seed'));
const value2d = noise2D(x, y);

// IMPORTANT: If you use multiple noise functions (for example 2d and 3d)
// and want compatible output with 3.x you will need to pass a fresh instance
// of alea to each create call. If you reuse the alea instance you will
// get different outputs compared to simplex-noise 3.x.
const seed = 'seed';
const noise2D = createNoise2D(alea(seed));
const noise3D = createNoise3D(alea(seed));
```

### Emulating the 3.x and older API
```javascript
const simplex = {
  noise2D: createNoise2D(alea(seed)),
  noise3D: createNoise3D(alea(seed)),
  noise4D: createNoise4D(alea(seed)),
};
```

## Changelog

### 4.0.3
- Additional tweaks to __PURE__ annotations to avoid warnings in rollup.js. Contributed by [Damien Seguin](https://github.com/dmnsgn).

### 4.0.2
- Tweaked __PURE__ annotations to avoid warnings in rollup.js. Contributed by [Damien Seguin](https://github.com/dmnsgn).

### 4.0.1
- Explicitly defined the return type of `createNoise4D` to be `NoiseFunction4D`.
  Contributed by [satelllte](https://github.com/satelllte).

### 4.0.0
:warning: **This release changes the API and the output of the noise functions.** :warning:

- Reworked the API so that the noise functions can be imported individually.
  When combined with tree shaking this helps with build sizes.
- Removed the built in version of the ALEA PRNG to focus the library to do only one thing.
   If you want to continue to use it you'll have to install and import it separately.
- Noise functions are a bit faster (~ 20 - 30%).
- Noise values can be different from previous versions
- Input coordinates bigger than 2^31 may not result in a noisy output anymore.
  If you have a use case that is affected by this change, please file an issue.
- Test coverage is now at 100%.
- A big thank you to @mreinstein, @redblobgames and everyone else involved
  for their comments and PRs which motivated me to create this new version.

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

## License
Copyright (c) 2022 Jonas Wagner, licensed under the MIT License (enclosed)

## Credits
This is mostly a direct javascript port of the [Java implementation](http://webstaff.itn.liu.se/~stegu/simplexnoise/SimplexNoise.java)
by Stefan Gustavson and Peter Eastman.

The initial typescript definition has been provided by [Neonit](https://github.com/Neonit).
