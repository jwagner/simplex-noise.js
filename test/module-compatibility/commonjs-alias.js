// eslint-disable-next-line @typescript-eslint/no-var-requires
const SimplexNoise = require('simplex-noise').SimplexNoise;
console.log(new SimplexNoise('seed').noise2D(1, 2));