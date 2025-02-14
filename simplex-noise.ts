/*
 * A fast javascript implementation of simplex noise by Jonas Wagner

Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
Better rank ordering method by Stefan Gustavson in 2012.

 Copyright (c) 2024 Jonas Wagner

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */


// these __PURE__ comments help uglifyjs with dead code removal
//
const SQRT3 = /*#__PURE__*/ Math.sqrt(3.0);
const SQRT5 = /*#__PURE__*/ Math.sqrt(5.0);
const F2 = 0.5 * (SQRT3 - 1.0);
const G2 = (3.0 - SQRT3) / 6.0;
const F3 = 1.0 / 3.0;
const G3 = 1.0 / 6.0;
const F4 = (SQRT5 - 1.0) / 4.0;
const G4 = (5.0 - SQRT5) / 20.0;

// I'm really not sure why this | 0 (basically a coercion to int)
// is making this faster but I get ~5 million ops/sec more on the
// benchmarks across the board or a ~10% speedup.
const fastFloor = (x: number) => Math.floor(x) | 0;

const grad2 = /*#__PURE__*/ new Float64Array([1, 1,
  -1, 1,
  1, -1,

  -1, -1,
  1, 0,
  -1, 0,

  1, 0,
  -1, 0,
  0, 1,

  0, -1,
  0, 1,
  0, -1]);

// double seems to be faster than single or int's
// probably because most operations are in double precision
const grad3 = /*#__PURE__*/ new Float64Array([1, 1, 0,
  -1, 1, 0,
  1, -1, 0,

  -1, -1, 0,
  1, 0, 1,
  -1, 0, 1,

  1, 0, -1,
  -1, 0, -1,
  0, 1, 1,

  0, -1, 1,
  0, 1, -1,
  0, -1, -1]);

// double is a bit quicker here as well
const grad4 = /*#__PURE__*/ new Float64Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1,
  0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1,
  1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1,
  -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1,
  1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1,
  -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1,
  1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0,
  -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0]);

/**
 * A random() function, must return a number in the interval [0,1), just like Math.random().
 */
export type RandomFn = () => number;

/**
 * Samples the noise field in two dimensions
 * 
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @returns a number in the interval [-1, 1]
 */
export type NoiseFunction2D = (x: number, y: number) => number;

/**
 * Creates a 2D noise function
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseFunction2D}
 */
export function createNoise2D(random: RandomFn = Math.random): NoiseFunction2D {
  const perm = buildPermutationTable(random);
  // precalculating this yields a little ~3% performance improvement.
  const permGrad2x = new Float64Array(perm).map(v => grad2[(v % 12) * 2]);
  const permGrad2y = new Float64Array(perm).map(v => grad2[(v % 12) * 2 + 1]);
  return function noise2D(x: number, y: number): number {
    // if(!isFinite(x) || !isFinite(y)) return 0;
    let n0 = 0; // Noise contributions from the three corners
    let n1 = 0;
    let n2 = 0;
    // Skew the input space to determine which simplex cell we're in
    const s = (x + y) * F2; // Hairy factor for 2D
    const i = fastFloor(x + s);
    const j = fastFloor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t; // Unskew the cell origin back to (x,y) space
    const Y0 = j - t;
    const x0 = x - X0; // The x,y distances from the cell origin
    const y0 = y - Y0;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    else {
      i1 = 0;
      j1 = 1;
    } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    const x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
    const y2 = y0 - 1.0 + 2.0 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    const ii = i & 255;
    const jj = j & 255;
    // Calculate the contribution from the three corners
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      const gi0 = ii + perm[jj];
      const g0x = permGrad2x[gi0];
      const g0y = permGrad2y[gi0];
      t0 *= t0;
      // n0 = t0 * t0 * (grad2[gi0] * x0 + grad2[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
      n0 = t0 * t0 * (g0x * x0 + g0y * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      const gi1 = ii + i1 + perm[jj + j1];
      const g1x = permGrad2x[gi1];
      const g1y = permGrad2y[gi1];
      t1 *= t1;
      // n1 = t1 * t1 * (grad2[gi1] * x1 + grad2[gi1 + 1] * y1);
      n1 = t1 * t1 * (g1x * x1 + g1y * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      const gi2 = ii + 1 + perm[jj + 1];
      const g2x = permGrad2x[gi2];
      const g2y = permGrad2y[gi2];
      t2 *= t2;
      // n2 = t2 * t2 * (grad2[gi2] * x2 + grad2[gi2 + 1] * y2);
      n2 = t2 * t2 * (g2x * x2 + g2y * y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70.0 * (n0 + n1 + n2);
  };
}

/**
 * Samples the noise field in three dimensions
 * 
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @param z
 * @returns a number in the interval [-1, 1]
 */
export type NoiseFunction3D = (x: number, y: number, z: number) => number;

/**
 * Creates a 3D noise function
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseFunction3D}
 */
export function createNoise3D(random: RandomFn = Math.random): NoiseFunction3D {
  const perm = buildPermutationTable(random);
  // precalculating these seems to yield a speedup of over 15%
  const permGrad3x = new Float64Array(perm).map(v => grad3[(v % 12) * 3]);
  const permGrad3y = new Float64Array(perm).map(v => grad3[(v % 12) * 3 + 1]);
  const permGrad3z = new Float64Array(perm).map(v => grad3[(v % 12) * 3 + 2]);
  return function noise3D(x: number, y: number, z: number): number {
    let n0, n1, n2, n3; // Noise contributions from the four corners
    // Skew the input space to determine which simplex cell we're in
    const s = (x + y + z) * F3; // Very nice and simple skew factor for 3D
    const i = fastFloor(x + s);
    const j = fastFloor(y + s);
    const k = fastFloor(z + s);
    const t = (i + j + k) * G3;
    const X0 = i - t; // Unskew the cell origin back to (x,y,z) space
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = x - X0; // The x,y,z distances from the cell origin
    const y0 = y - Y0;
    const z0 = z - Z0;
    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    let i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    let i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } // X Y Z order
      else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } // X Z Y order
      else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } // Z X Y order
    }
    else { // x0<y0
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } // Z Y X order
      else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } // Y Z X order
      else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } // Y X Z order
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    const x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;
    // Work out the hashed gradient indices of the four simplex corners
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    // Calculate the contribution from the four corners
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0.0;
    else {
      const gi0 = ii + perm[jj + perm[kk]];
      t0 *= t0;
      n0 = t0 * t0 * (permGrad3x[gi0] * x0 + permGrad3y[gi0] * y0 + permGrad3z[gi0] * z0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0.0;
    else {
      const gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1]];
      t1 *= t1;
      n1 = t1 * t1 * (permGrad3x[gi1] * x1 + permGrad3y[gi1] * y1 + permGrad3z[gi1] * z1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0.0;
    else {
      const gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2]];
      t2 *= t2;
      n2 = t2 * t2 * (permGrad3x[gi2] * x2 + permGrad3y[gi2] * y2 + permGrad3z[gi2] * z2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0.0;
    else {
      const gi3 = ii + 1 + perm[jj + 1 + perm[kk + 1]];
      t3 *= t3;
      n3 = t3 * t3 * (permGrad3x[gi3] * x3 + permGrad3y[gi3] * y3 + permGrad3z[gi3] * z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to stay just inside [-1,1]
    return 32.0 * (n0 + n1 + n2 + n3);
  };
}

/**
 * Samples the noise field in four dimensions
 * 
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @param z
 * @param w
 * @returns a number in the interval [-1, 1]
 */
export type NoiseFunction4D = (x: number, y: number, z: number, w: number) => number;

/**
 * Creates a 4D noise function
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseFunction4D}
 */
export function createNoise4D(random: RandomFn = Math.random): NoiseFunction4D {
  const perm = buildPermutationTable(random);
  // precalculating these leads to a ~10% speedup
  const permGrad4x = new Float64Array(perm).map(v => grad4[(v % 32) * 4]);
  const permGrad4y = new Float64Array(perm).map(v => grad4[(v % 32) * 4 + 1]);
  const permGrad4z = new Float64Array(perm).map(v => grad4[(v % 32) * 4 + 2]);
  const permGrad4w = new Float64Array(perm).map(v => grad4[(v % 32) * 4 + 3]);
  return function noise4D(x: number, y: number, z: number, w: number): number {
    let n0, n1, n2, n3, n4; // Noise contributions from the five corners
    // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
    const s = (x + y + z + w) * F4; // Factor for 4D skewing
    const i = fastFloor(x + s);
    const j = fastFloor(y + s);
    const k = fastFloor(z + s);
    const l = fastFloor(w + s);
    const t = (i + j + k + l) * G4; // Factor for 4D unskewing
    const X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
    const Y0 = j - t;
    const Z0 = k - t;
    const W0 = l - t;
    const x0 = x - X0; // The x,y,z,w distances from the cell origin
    const y0 = y - Y0;
    const z0 = z - Z0;
    const w0 = w - W0;
    // For the 4D case, the simplex is a 4D shape I won't even try to describe.
    // To find out which of the 24 possible simplices we're in, we need to
    // determine the magnitude ordering of x0, y0, z0 and w0.
    // Six pair-wise comparisons are performed between each possible pair
    // of the four coordinates, and the results are used to rank the numbers.
    let rankx = 0;
    let ranky = 0;
    let rankz = 0;
    let rankw = 0;
    if (x0 > y0) rankx++;
    else ranky++;
    if (x0 > z0) rankx++;
    else rankz++;
    if (x0 > w0) rankx++;
    else rankw++;
    if (y0 > z0) ranky++;
    else rankz++;
    if (y0 > w0) ranky++;
    else rankw++;
    if (z0 > w0) rankz++;
    else rankw++;
    // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
    // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
    // impossible. Only the 24 indices which have non-zero entries make any sense.
    // We use a thresholding to set the coordinates in turn from the largest magnitude.
    // Rank 3 denotes the largest coordinate.
    // Rank 2 denotes the second largest coordinate.
    // Rank 1 denotes the second smallest coordinate.

    // The integer offsets for the second simplex corner
    const i1 = rankx >= 3 ? 1 : 0;
    const j1 = ranky >= 3 ? 1 : 0;
    const k1 = rankz >= 3 ? 1 : 0;
    const l1 = rankw >= 3 ? 1 : 0;
    // The integer offsets for the third simplex corner
    const i2 = rankx >= 2 ? 1 : 0;
    const j2 = ranky >= 2 ? 1 : 0;
    const k2 = rankz >= 2 ? 1 : 0;
    const l2 = rankw >= 2 ? 1 : 0;

    // The integer offsets for the fourth simplex corner
    const i3 = rankx >= 1 ? 1 : 0;
    const j3 = ranky >= 1 ? 1 : 0;
    const k3 = rankz >= 1 ? 1 : 0;
    const l3 = rankw >= 1 ? 1 : 0;
    // The fifth corner has all coordinate offsets = 1, so no need to compute that.
    const x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
    const y1 = y0 - j1 + G4;
    const z1 = z0 - k1 + G4;
    const w1 = w0 - l1 + G4;
    const x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
    const y2 = y0 - j2 + 2.0 * G4;
    const z2 = z0 - k2 + 2.0 * G4;
    const w2 = w0 - l2 + 2.0 * G4;
    const x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
    const y3 = y0 - j3 + 3.0 * G4;
    const z3 = z0 - k3 + 3.0 * G4;
    const w3 = w0 - l3 + 3.0 * G4;
    const x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
    const y4 = y0 - 1.0 + 4.0 * G4;
    const z4 = z0 - 1.0 + 4.0 * G4;
    const w4 = w0 - 1.0 + 4.0 * G4;
    // Work out the hashed gradient indices of the five simplex corners
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const ll = l & 255;
    // Calculate the contribution from the five corners
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
    if (t0 < 0) n0 = 0.0;
    else {
      const gi0 = ii + perm[jj + perm[kk + perm[ll]]];
      t0 *= t0;
      n0 = t0 * t0 * (permGrad4x[gi0] * x0 + permGrad4y[gi0] * y0 + permGrad4z[gi0] * z0 + permGrad4w[gi0] * w0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
    if (t1 < 0) n1 = 0.0;
    else {
      const gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]];
      t1 *= t1;
      n1 = t1 * t1 * (permGrad4x[gi1] * x1 + permGrad4y[gi1] * y1 + permGrad4z[gi1] * z1 + permGrad4w[gi1] * w1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
    if (t2 < 0) n2 = 0.0;
    else {
      const gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]];
      t2 *= t2;
      n2 = t2 * t2 * (permGrad4x[gi2] * x2 + permGrad4y[gi2] * y2 + permGrad4z[gi2] * z2 + permGrad4w[gi2] * w2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
    if (t3 < 0) n3 = 0.0;
    else {
      const gi3 = ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]];
      t3 *= t3;
      n3 = t3 * t3 * (permGrad4x[gi3] * x3 + permGrad4y[gi3] * y3 + permGrad4z[gi3] * z3 + permGrad4w[gi3] * w3);
    }
    let t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
    if (t4 < 0) n4 = 0.0;
    else {
      const gi4 = ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]];
      t4 *= t4;
      n4 = t4 * t4 * (permGrad4x[gi4] * x4 + permGrad4y[gi4] * y4 + permGrad4z[gi4] * z4 + permGrad4w[gi4] * w4);
    }
    // Sum up and scale the result to cover the range [-1,1]
    return 27.0 * (n0 + n1 + n2 + n3 + n4);
  };
}

/**
 * Builds a random permutation table.
 * This is exported only for (internal) testing purposes.
 * Do not rely on this export.
 * @private
 */
export function buildPermutationTable(random: RandomFn): Uint8Array {
  const tableSize = 512;
  const p = new Uint8Array(tableSize);
  for (let i = 0; i < tableSize / 2; i++) {
    p[i] = i;
  }
  for (let i = 0; i < tableSize / 2 - 1; i++) {
    const r = i + ~~(random() * (256 - i));
    const aux = p[i];
    p[i] = p[r];
    p[r] = aux;
  }
  for (let i = 256; i < tableSize; i++) {
    p[i] = p[i - 256];
  }
  return p;
}


/**
 * The output of the noise function with derivatives
 * 
 * @property value the noise value in the interval [-1, 1]
 * @property dx the partial derivative with respect to x
 * @property dy the partial derivative with respect to y
 */
export type NoiseDeriv2DOutput = {
  value: number;
  dx: number;
  dy: number;
};

/**
 * Samples the noise field in two dimensions and returns the partial derivatives (dx, dy).
 * 
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @param output optional output object to store the result, if not provided, a new one will be created
 * @returns {NoiseDeriv2DOutput}
 */
export type NoiseDerivFunction2D = (x: number, y: number, output?: NoiseDeriv2DOutput) => NoiseDeriv2DOutput;

/**
 * Creates a 2D noise function with derivatives
 * 
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseDerivFunction2D}
 */
export function createNoise2DWithDerivatives(random: RandomFn = Math.random): NoiseDerivFunction2D {
  const perm = buildPermutationTable(random);
  // Precompute the x/y gradients for each possible permutation value
  const permGrad2x = new Float64Array(perm).map(v => grad2[(v % 12) * 2]);
  const permGrad2y = new Float64Array(perm).map(v => grad2[(v % 12) * 2 + 1]);

  return function noise2DWithDerivatives(x: number, y: number, output?: NoiseDeriv2DOutput): NoiseDeriv2DOutput {
    // Noise and derivatives that we'll accumulate
    let value = 0;
    let dx = 0;
    let dy = 0;

    // Skew the input space to determine which simplex cell we're in
    const s = (x + y) * F2;
    const i = fastFloor(x + s);
    const j = fastFloor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;

    // Unskewed distances from the cell origin
    const x0 = x - X0;
    const y0 = y - Y0;

    // Determine which simplex triangle we are in
    let i1, j1;
    if (x0 > y0) {
      i1 = 1; j1 = 0;
    } else {
      i1 = 0; j1 = 1;
    }

    // Offsets for the other two corners
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    // Work out the hashed gradient indices of the three corners
    const ii = i & 255;
    const jj = j & 255;

    // -- Corner 0
    const t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) {
      // Precompute the gradient index and the actual gradient
      const gi0 = ii + perm[jj];
      const g0x = permGrad2x[gi0];
      const g0y = permGrad2y[gi0];

      // Contribution (the usual simplex noise formula)
      const t0sq = t0 * t0;        // t0^2
      const t0p4 = t0sq * t0sq;    // t0^4
      const dot0 = g0x * x0 + g0y * y0;
      const n0 = t0p4 * dot0;

      // Derivatives:
      //
      // t0 = 0.5 - x0^2 - y0^2
      // dt0/dx = -2 * x0
      // dt0/dy = -2 * y0
      //
      // ∂n0/∂x = ∂/∂x [ t0^4 * (g0x*x0 + g0y*y0) ]
      //        = (4 * t0^3 * dt0/dx) * (g0x*x0 + g0y*y0)
      //          + t0^4 * g0x * (∂x0/∂x)
      // Since x0 = x - X0, (∂x0/∂x) = 1
      //
      // Putting it together:
      const t0cubic = t0sq * t0;   // t0^3
      const dT0dx = -2.0 * x0;
      const dT0dy = -2.0 * y0;

      const dn0dx = 4.0 * t0cubic * dT0dx * dot0 + t0p4 * g0x;
      const dn0dy = 4.0 * t0cubic * dT0dy * dot0 + t0p4 * g0y;

      // Accumulate
      value += n0;
      dx += dn0dx;
      dy += dn0dy;
    }

    // -- Corner 1
    const t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      const gi1 = ii + i1 + perm[jj + j1];
      const g1x = permGrad2x[gi1];
      const g1y = permGrad2y[gi1];

      const t1sq = t1 * t1;
      const t1p4 = t1sq * t1sq;
      const dot1 = g1x * x1 + g1y * y1;
      const n1 = t1p4 * dot1;

      const t1cubic = t1sq * t1;
      const dT1dx = -2.0 * x1; // because x1 depends on x
      const dT1dy = -2.0 * y1; // because y1 depends on y

      const dn1dx = 4.0 * t1cubic * dT1dx * dot1 + t1p4 * g1x;
      const dn1dy = 4.0 * t1cubic * dT1dy * dot1 + t1p4 * g1y;

      value += n1;
      dx += dn1dx;
      dy += dn1dy;
    }

    // -- Corner 2
    const t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      const gi2 = (ii + 1) + perm[jj + 1];
      const g2x = permGrad2x[gi2];
      const g2y = permGrad2y[gi2];

      const t2sq = t2 * t2;
      const t2p4 = t2sq * t2sq;
      const dot2 = g2x * x2 + g2y * y2;
      const n2 = t2p4 * dot2;

      const t2cubic = t2sq * t2;
      const dT2dx = -2.0 * x2;
      const dT2dy = -2.0 * y2;

      const dn2dx = 4.0 * t2cubic * dT2dx * dot2 + t2p4 * g2x;
      const dn2dy = 4.0 * t2cubic * dT2dy * dot2 + t2p4 * g2y;

      value += n2;
      dx += dn2dx;
      dy += dn2dy;
    }

    // Scale the final result (the same factor 70 used in standard 2D simplex)
    value *= 70.0;
    dx    *= 70.0;
    dy    *= 70.0;

    if (output) {
      output.value = value;
      output.dx = dx;
      output.dy = dy;
      return output;
    }
    
    return { value, dx, dy };
  };
}

/**
 * The output of the noise function with derivatives
 * 
 * @property value the noise value in the interval [-1, 1]
 * @property dx the partial derivative with respect to x
 * @property dy the partial derivative with respect to y
 * @property dz the partial derivative with respect to z
 */
export type NoiseDeriv3DOutput = {
  value: number;
  dx: number;
  dy: number;
  dz: number;
};

/**
 * Samples the noise field in three dimensions and returns the partial derivatives (dx, dy, dz).
 * 
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @param z
 * @param output
 * @returns a number in the interval [-1, 1]
 */
export type NoiseDerivFunction3D = (x: number, y: number, z: number, output?: NoiseDeriv3DOutput) => NoiseDeriv3DOutput;


/**
 * Creates a 3D Simplex noise function that also returns partial derivatives (dx, dy, dz).
 * 
 * The final noise value is scaled to ~[-1, 1], just like `createNoise3D`.
 * The derivatives match that same scaling.
 * 
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseDerivFunction3D}
 */
export function createNoise3DWithDerivatives(
  random: RandomFn = Math.random
): NoiseDerivFunction3D {
  // Build the permutation table
  const perm = buildPermutationTable(random);

  // Precompute the 3D gradients for each possible perm value
  // i.e. permGrad3x[i] = grad3[(perm[i] % 12)*3 + 0]
  const permGrad3x = new Float64Array(512);
  const permGrad3y = new Float64Array(512);
  const permGrad3z = new Float64Array(512);
  for (let i = 0; i < 512; i++) {
    const gIndex = (perm[i] % 12) * 3;
    permGrad3x[i] = grad3[gIndex + 0];
    permGrad3y[i] = grad3[gIndex + 1];
    permGrad3z[i] = grad3[gIndex + 2];
  }

  return function noise3DWithDerivatives(x: number, y: number, z: number, output?: NoiseDeriv3DOutput): NoiseDeriv3DOutput {
    // Skew the input space
    const s = (x + y + z) * F3;
    const i = fastFloor(x + s);
    const j = fastFloor(y + s);
    const k = fastFloor(z + s);

    const t = (i + j + k) * G3;
    // Unskew
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;

    // Distances from cell origin
    const x0 = x - X0;
    const y0 = y - Y0;
    const z0 = z - Z0;

    // Determine simplex region
    let i1, j1, k1;
    let i2, j2, k2;

    if (x0 >= y0) {
      if (y0 >= z0) {
        // X Y Z order
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        // X Z Y order
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        // Z X Y order
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      // x0 < y0
      if (y0 < z0) {
        // Z Y X order
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        // Y Z X order
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        // Y X Z order
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    }

    // Offsets for second corner
    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    // Offsets for third corner
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    // Offsets for last corner
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    // Hashed gradient indices
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    // Contribution accumulators
    let n0 = 0,
      n1 = 0,
      n2 = 0,
      n3 = 0;
    let dx0 = 0,
      dy0 = 0,
      dz0 = 0;
    let dx1 = 0,
      dy1 = 0,
      dz1 = 0;
    let dx2 = 0,
      dy2 = 0,
      dz2 = 0;
    let dx3 = 0,
      dy3 = 0,
      dz3 = 0;

    // For each corner, we compute t_i, the gradient dot, and the derivatives

    // Corner 0
    {
      const t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 > 0) {
        const gi0 = ii + perm[jj + perm[kk]];
        const gx0 = permGrad3x[gi0];
        const gy0 = permGrad3y[gi0];
        const gz0 = permGrad3z[gi0];

        const gDot0 = gx0 * x0 + gy0 * y0 + gz0 * z0;
        const t0Sq = t0 * t0;
        const t0Pow4 = t0Sq * t0Sq; // t0^4

        n0 = t0Pow4 * gDot0;

        // Derivative of (t0^4 * (g·(x,y,z))) w.r.t x:
        // d/dx [t0^4 * gDot0] = (d/dx t0^4)*gDot0 + t0^4*gx0
        // where t0 = 0.6 - (x^2 + y^2 + z^2),
        // d/dx t0^4 = 4 * t0^3 * d/dx t0 = 4*t0^3*(-2*x) = -8*t0^3*x
        // => partial_x = -8*t0^3*x0*gDot0 + t0^4*gx0
        const t0Cub = t0Sq * t0; // t0^3
        const coeff = -8.0 * t0Cub; // factor for x*gDot
        dx0 = coeff * x0 * gDot0 + t0Pow4 * gx0;
        dy0 = coeff * y0 * gDot0 + t0Pow4 * gy0;
        dz0 = coeff * z0 * gDot0 + t0Pow4 * gz0;
      }
    }

    // Corner 1
    {
      const t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 > 0) {
        const gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1]];
        const gx1 = permGrad3x[gi1];
        const gy1 = permGrad3y[gi1];
        const gz1 = permGrad3z[gi1];

        const gDot1 = gx1 * x1 + gy1 * y1 + gz1 * z1;
        const t1Sq = t1 * t1;
        const t1Pow4 = t1Sq * t1Sq;

        n1 = t1Pow4 * gDot1;

        const t1Cub = t1Sq * t1;
        const coeff = -8.0 * t1Cub;
        dx1 = coeff * x1 * gDot1 + t1Pow4 * gx1;
        dy1 = coeff * y1 * gDot1 + t1Pow4 * gy1;
        dz1 = coeff * z1 * gDot1 + t1Pow4 * gz1;
      }
    }

    // Corner 2
    {
      const t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 > 0) {
        const gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2]];
        const gx2 = permGrad3x[gi2];
        const gy2 = permGrad3y[gi2];
        const gz2 = permGrad3z[gi2];

        const gDot2 = gx2 * x2 + gy2 * y2 + gz2 * z2;
        const t2Sq = t2 * t2;
        const t2Pow4 = t2Sq * t2Sq;

        n2 = t2Pow4 * gDot2;

        const t2Cub = t2Sq * t2;
        const coeff = -8.0 * t2Cub;
        dx2 = coeff * x2 * gDot2 + t2Pow4 * gx2;
        dy2 = coeff * y2 * gDot2 + t2Pow4 * gy2;
        dz2 = coeff * z2 * gDot2 + t2Pow4 * gz2;
      }
    }

    // Corner 3
    {
      const t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 > 0) {
        const gi3 = ii + 1 + perm[jj + 1 + perm[kk + 1]];
        const gx3 = permGrad3x[gi3];
        const gy3 = permGrad3y[gi3];
        const gz3 = permGrad3z[gi3];

        const gDot3 = gx3 * x3 + gy3 * y3 + gz3 * z3;
        const t3Sq = t3 * t3;
        const t3Pow4 = t3Sq * t3Sq;

        n3 = t3Pow4 * gDot3;

        const t3Cub = t3Sq * t3;
        const coeff = -8.0 * t3Cub;
        dx3 = coeff * x3 * gDot3 + t3Pow4 * gx3;
        dy3 = coeff * y3 * gDot3 + t3Pow4 * gy3;
        dz3 = coeff * z3 * gDot3 + t3Pow4 * gz3;
      }
    }

    // Sum up contributions
    const value = n0 + n1 + n2 + n3;
    const dx = dx0 + dx1 + dx2 + dx3;
    const dy = dy0 + dy1 + dy2 + dy3;
    const dz = dz0 + dz1 + dz2 + dz3;

    // The original 3D simplex scaling factor is 32.0 in this library
    // (makes final output ~in [-1,1]).
    const scale = 32.0;

    if (output) {
      output.value = scale * value;
      output.dx = scale * dx;
      output.dy = scale * dy;
      output.dz = scale * dz;
      return output;
    }

    return {
      value: scale * value,
      dx: scale * dx,
      dy: scale * dy,
      dz: scale * dz,
    };
  };
}


/**
 * The output of the noise function with derivatives
 * 
 * @property value the noise value in the interval [-1, 1]
 * @property dx the partial derivative with respect to x
 * @property dy the partial derivative with respect to y
 * @property dz the partial derivative with respect to z
 * @property dw the partial derivative with respect to w
 */
export type NoiseDeriv4DOutput = {
  value: number;
  dx: number;
  dy: number;
  dz: number;
  dw: number;
};

/**
 * Samples the noise field in four dimensions and returns the partial derivatives (dx, dy, dz, dw).
 *
 * Coordinates should be finite, bigger than -2^31 and smaller than 2^31.
 * @param x
 * @param y
 * @param z
 * @param w
 * @param output (optional) an object to re-use for the result, so as to avoid allocations
 * @returns {NoiseDeriv4DOutput}
 */
export type NoiseDerivFunction4D = (
  x: number,
  y: number,
  z: number,
  w: number,
  output?: NoiseDeriv4DOutput
) => NoiseDeriv4DOutput;

/**
 * Creates a 4D Simplex noise function that also computes its analytical partial derivatives.
 *
 * @param random the random function that will be used to build the permutation table
 * @returns {NoiseDerivFunction4D}
 */
export function createNoise4DWithDerivatives(random: RandomFn = Math.random): NoiseDerivFunction4D {
  // Build the standard permutation table
  const perm = buildPermutationTable(random);

  // Precompute gradient indices for each possible value in `perm` (0..511).
  // Because the default grad4 array has 32 different grad vectors for 4D, we do `perm[i] % 32`.
  const permGrad4x = new Float64Array(512);
  const permGrad4y = new Float64Array(512);
  const permGrad4z = new Float64Array(512);
  const permGrad4w = new Float64Array(512);
  for (let i = 0; i < 512; i++) {
    const gi = (perm[i] % 32) * 4;
    permGrad4x[i] = grad4[gi + 0];
    permGrad4y[i] = grad4[gi + 1];
    permGrad4z[i] = grad4[gi + 2];
    permGrad4w[i] = grad4[gi + 3];
  }

  return function noise4DWithDerivatives(
    x: number,
    y: number,
    z: number,
    w: number,
    output?: NoiseDeriv4DOutput
  ): NoiseDeriv4DOutput {
    // Skew the (x,y,z,w) space
    const s = (x + y + z + w) * F4; 
    const i = fastFloor(x + s);
    const j = fastFloor(y + s);
    const k = fastFloor(z + s);
    const l = fastFloor(w + s);

    // Unskew
    const t = (i + j + k + l) * G4;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const W0 = l - t;

    // Distances from cell origin
    const x0 = x - X0;
    const y0 = y - Y0;
    const z0 = z - Z0;
    const w0 = w - W0;

    // 4D simplex region rank ordering
    let rankx = 0;
    let ranky = 0;
    let rankz = 0;
    let rankw = 0;
    if (x0 > y0) rankx++; else ranky++;
    if (x0 > z0) rankx++; else rankz++;
    if (x0 > w0) rankx++; else rankw++;
    if (y0 > z0) ranky++; else rankz++;
    if (y0 > w0) ranky++; else rankw++;
    if (z0 > w0) rankz++; else rankw++;

    // Offsets for each corner
    const i1 = rankx >= 3 ? 1 : 0;
    const j1 = ranky >= 3 ? 1 : 0;
    const k1 = rankz >= 3 ? 1 : 0;
    const l1 = rankw >= 3 ? 1 : 0;

    const i2 = rankx >= 2 ? 1 : 0;
    const j2 = ranky >= 2 ? 1 : 0;
    const k2 = rankz >= 2 ? 1 : 0;
    const l2 = rankw >= 2 ? 1 : 0;

    const i3 = rankx >= 1 ? 1 : 0;
    const j3 = ranky >= 1 ? 1 : 0;
    const k3 = rankz >= 1 ? 1 : 0;
    const l3 = rankw >= 1 ? 1 : 0;

    // Position deltas for each corner
    const x1 = x0 - i1 + G4;
    const y1 = y0 - j1 + G4;
    const z1 = z0 - k1 + G4;
    const w1 = w0 - l1 + G4;

    const x2 = x0 - i2 + 2.0 * G4;
    const y2 = y0 - j2 + 2.0 * G4;
    const z2 = z0 - k2 + 2.0 * G4;
    const w2 = w0 - l2 + 2.0 * G4;

    const x3 = x0 - i3 + 3.0 * G4;
    const y3 = y0 - j3 + 3.0 * G4;
    const z3 = z0 - k3 + 3.0 * G4;
    const w3 = w0 - l3 + 3.0 * G4;

    const x4 = x0 - 1.0 + 4.0 * G4;
    const y4 = y0 - 1.0 + 4.0 * G4;
    const z4 = z0 - 1.0 + 4.0 * G4;
    const w4 = w0 - 1.0 + 4.0 * G4;

    // Hashed gradient indices
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const ll = l & 255;

    // Corner accumulators
    let n0 = 0, n1 = 0, n2 = 0, n3 = 0, n4 = 0;
    let dx0 = 0, dx1 = 0, dx2 = 0, dx3 = 0, dx4 = 0;
    let dy0 = 0, dy1 = 0, dy2 = 0, dy3 = 0, dy4 = 0;
    let dz0 = 0, dz1 = 0, dz2 = 0, dz3 = 0, dz4 = 0;
    let dw0 = 0, dw1 = 0, dw2 = 0, dw3 = 0, dw4 = 0;

    // A small helper to do the repeated derivative logic
    function cornerContribution(
      tx: number, ty: number, tz: number, tw: number,
      cornerIdx: number
    ) {
      // t = 0.6 - sum of squares
      const tVal = 0.6 - (tx * tx + ty * ty + tz * tz + tw * tw);
      if (tVal <= 0) {
        return {
          n: 0, dx: 0, dy: 0, dz: 0, dw: 0
        };
      }
      // Hashed gradient
      const gx = permGrad4x[cornerIdx];
      const gy = permGrad4y[cornerIdx];
      const gz = permGrad4z[cornerIdx];
      const gw = permGrad4w[cornerIdx];

      // Gradient dot
      const gDot = gx * tx + gy * ty + gz * tz + gw * tw;

      // t^2, t^3, t^4
      const t2 = tVal * tVal;
      const t4 = t2 * t2;      // t^4
      const t3 = t2 * tVal;    // t^3

      // Contribution
      const n = t4 * gDot;

      // Derivatives:
      // dn/d(tx) = ∂/∂(tx) [ t^4 * (grad·(tx,ty,tz,tw)) ]
      //           = (4 * t^3 * d(t)/d(tx)) * gDot + t^4 * gx
      // where d(t)/d(tx) = -2*tx
      const factor = -8.0 * t3;  // 4 * t^3 * -2
      const dx = factor * tx * gDot + t4 * gx;
      const dy = factor * ty * gDot + t4 * gy;
      const dz = factor * tz * gDot + t4 * gz;
      const dw = factor * tw * gDot + t4 * gw;

      return { n, dx, dy, dz, dw };
    }

    // Evaluate each corner's contribution
    {
      // Corner 0
      const gi0 = ii + perm[jj + perm[kk + perm[ll]]];
      const c0 = cornerContribution(x0, y0, z0, w0, gi0);
      n0 = c0.n; dx0 = c0.dx; dy0 = c0.dy; dz0 = c0.dz; dw0 = c0.dw;
    }
    {
      // Corner 1
      const gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]];
      const c1 = cornerContribution(x1, y1, z1, w1, gi1);
      n1 = c1.n; dx1 = c1.dx; dy1 = c1.dy; dz1 = c1.dz; dw1 = c1.dw;
    }
    {
      // Corner 2
      const gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]];
      const c2 = cornerContribution(x2, y2, z2, w2, gi2);
      n2 = c2.n; dx2 = c2.dx; dy2 = c2.dy; dz2 = c2.dz; dw2 = c2.dw;
    }
    {
      // Corner 3
      const gi3 = ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]];
      const c3 = cornerContribution(x3, y3, z3, w3, gi3);
      n3 = c3.n; dx3 = c3.dx; dy3 = c3.dy; dz3 = c3.dz; dw3 = c3.dw;
    }
    {
      // Corner 4
      const gi4 = ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]];
      const c4 = cornerContribution(x4, y4, z4, w4, gi4);
      n4 = c4.n; dx4 = c4.dx; dy4 = c4.dy; dz4 = c4.dz; dw4 = c4.dw;
    }

    // Sum contributions
    let value = n0 + n1 + n2 + n3 + n4;
    let dx    = dx0 + dx1 + dx2 + dx3 + dx4;
    let dy    = dy0 + dy1 + dy2 + dy3 + dy4;
    let dz    = dz0 + dz1 + dz2 + dz3 + dz4;
    let dw    = dw0 + dw1 + dw2 + dw3 + dw4;

    // Scale it to ~[-1, 1], consistent with createNoise4D
    const scale = 27.0;
    value *= scale;
    dx    *= scale;
    dy    *= scale;
    dz    *= scale;
    dw    *= scale;

    if (!output) {
      return { value, dx, dy, dz, dw };
    }
    // Re-use the output object
    output.value = value;
    output.dx = dx;
    output.dy = dy;
    output.dz = dz;
    output.dw = dw;
    return output;
  };
}


