import SimplexNoise from './simplex-noise.js';
// dumb hack so there is a consistent way to import using commonjs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(SimplexNoise as any)['SimplexNoise'] = SimplexNoise;
export = SimplexNoise;