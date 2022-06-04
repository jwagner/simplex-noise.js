import { noiseFunction2D, noiseFunction3D, noiseFunction4D } from '../simplex-noise';
import { buildPermutationTable } from '../simplex-noise';
import alea from 'alea';
import { assert } from 'chai';


import { assertMatchesImage, sampleFunctionToImageData } from './matches-snapshot';

function getRandom(seed = 'seed') {
  return alea(seed);
}

// TODO improve those
describe('buildPermutationTable', function () {
  it('contains all indices exactly once', function () {
    const table = buildPermutationTable(getRandom());
    const aTable = Array.prototype.slice.call(table);
    for (let i = 0; i < aTable.length / 2; i++) {
      assert.include(aTable, i);
    }
  });
  it('can contain 0 in the first position', function () {
    function zero() { return 0; }
    const table = buildPermutationTable(zero);
    const aTable = Array.prototype.slice.call(table);
    for (let i = 0; i < aTable.length; i++) {
      assert.equal(aTable[i], i & 255);
    }
  });
  it('matches snapshot', function () {
    const table = buildPermutationTable(getRandom());

    const actual = { width: 16, height: 16, data: new Uint8ClampedArray(table.slice(0, 256)) };
    assertMatchesImage(actual, 'permutationTable.png');

    const actual512 = { width: 16, height: 32, data: new Uint8ClampedArray(table) };
    assertMatchesImage(actual512, 'permutationTable512.png');
  });
});

describe('noiseFunction2D', () => {
  const noise2D = noiseFunction2D(getRandom());
  describe('noise2D', () => {
    it('should return the same value for the same input', function () {
      assert.equal(noise2D(0.1, 0.2), noise2D(0.1, 0.2));
    });
    it('should return a different value for a different input', function () {
      assert.notEqual(noise2D(0.1, 0.2), noise2D(0.101, 0.202));
    });
    it('should return the same output with the same seed', function () {
      const noise2D2 = noiseFunction2D(getRandom());
      assert.equal(noise2D(0.1, 0.2), noise2D2(0.1, 0.2));
    });
    it('should return a different output with a different seed', function () {
      const noise2D2 = noiseFunction2D(getRandom('other seed'));
      assert.notEqual(noise2D(0.1, 0.2), noise2D2(0.1, 0.2));
    });
    it('should return values between -1 and 1', function () {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          assert(noise2D(x / 5, y / 5) >= -1);
          assert(noise2D(x / 5, y / 5) <= 1);
        }
      }
    });
    it('should return similar values for similar inputs', function () {
      assert(Math.abs(noise2D(0.1, 0.2) - noise2D(0.101, 0.202)) < 0.1);
    });
    it('should match snapshot', function () {
      const actual = sampleFunctionToImageData((x, y) => noise2D(x / 10, y / 10) * 128 + 128, 64, 64);
      assertMatchesImage(actual, 'noise2D.png');
    });
  });
});

describe('noiseFunction3D', () => {
  const noise3D = noiseFunction3D(getRandom());
  describe('noise3D', () => {
    it('should return the same value for the same input', function () {
      assert.equal(noise3D(0.1, 0.2, 0.3), noise3D(0.1, 0.2, 0.3));
    });
    it('should return a different value for a different input', function () {
      assert.notEqual(noise3D(0.1, 0.2, 0.3), noise3D(0.101, 0.202, 0.303));
    });
    it('should return the same output with the same seed', function () {
      const noise3D2 = noiseFunction3D(getRandom());
      assert.equal(noise3D(0.1, 0.2, 0.3), noise3D2(0.1, 0.2, 0.3));
    });
    it('should return a different output with a different seed', function () {
      const noise3D2 = noiseFunction3D(getRandom('other seed'));
      assert.notEqual(noise3D(0.1, 0.2, 0.3), noise3D2(0.1, 0.2, 0.3));
    });
    it('should return values between -1 and 1', function () {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          assert(noise3D(x / 5, y / 5, x + y) >= -1);
          assert(noise3D(x / 5, y / 5, x + y) <= 1);
        }
      }
    });
    it('should return similar values for similar inputs', function () {
      assert(Math.abs(noise3D(0.1, 0.2, 0.3) - noise3D(0.101, 0.202, 0.303)) < 0.1);
    });
    it('should match snapshot', function () {
      const actual = sampleFunctionToImageData((x, y) => noise3D(x / 10, y / 10, (x + y) / 2) * 128 + 128, 64, 64);
      assertMatchesImage(actual, 'noise3D.png');
    });
  });
});

describe('noiseFunction4D', () => {
  const noise4D = noiseFunction4D(getRandom());
  describe('noise4D', () => {
    it('should return the same value for the same input', function () {
      assert.equal(noise4D(0.1, 0.2, 0.3, 0.4), noise4D(0.1, 0.2, 0.3, 0.4));
    });
    it('should return a different value for a different input', function () {
      assert.notEqual(noise4D(0.1, 0.2, 0.3, 0.4), noise4D(0.101, 0.202, 0.303, 0.404));
    });
    it('should return the same output with the same seed', function () {
      const noise4D2 = noiseFunction4D(getRandom());
      assert.equal(noise4D(0.1, 0.2, 0.3, 0.4), noise4D2(0.1, 0.2, 0.3, 0.4));
    });
    it('should return a different output with a different seed', function () {
      const noise4D2 = noiseFunction4D(getRandom('other seed'));
      assert.notEqual(noise4D(0.1, 0.2, 0.3, 0.4), noise4D2(0.1, 0.2, 0.3, 0.4));
    });
    it('should return values between -1 and 1', function () {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          assert(noise4D(x / 5, y / 5, x + y, x - y) >= -1);
          assert(noise4D(x / 5, y / 5, x + y, x - y) <= 1);
        }
      }
    });
    it('should return similar values for similar inputs', function () {
      assert(Math.abs(noise4D(0.1, 0.2, 0.3, 0.4) - noise4D(0.101, 0.202, 0.303, 0.404)) < 0.1);
    });
    it('should match snapshot', function () {
      const actual = sampleFunctionToImageData((x, y) => noise4D(x / 10, y / 10, x / 4, y / 3) * 128 + 128, 64, 64);
      assertMatchesImage(actual, 'noise4D.png');
    });
  });
});
