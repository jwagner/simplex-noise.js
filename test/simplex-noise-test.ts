import { createNoise2D, createNoise2DWithDerivatives, createNoise3D, createNoise3DWithDerivatives, createNoise4D, buildPermutationTable, createNoise4DWithDerivatives } from '../simplex-noise';
import alea from 'alea';
import { assert } from 'chai';


import { assertMatchesImage, assertMatchesRGBAImage, sampleFunctionToImageDataOne, sampleFunctionToRGBAImageDataOne } from './matches-snapshot';

function getRandom(seed = 'seed') {
  return alea(seed);
}

const mathRandom = Math.random;

beforeEach(() => {
  Math.random = getRandom('Math.random');
});

afterEach(() => {
  Math.random = mathRandom;
});

describe('buildPermutationTable', function () {
  it('first half contains all indices exactly once', function () {
    const table = buildPermutationTable(getRandom());
    const firstHalf = Array.prototype.slice.call(table, 0, table.length / 2);
    for (let i = 0; i < firstHalf.length / 2; i++) {
      assert.include(firstHalf, i);
    }
  });
  it('is shuffled', function () {
    const tableA = buildPermutationTable(getRandom('A'));
    const tableB = buildPermutationTable(getRandom('B'));
    assert.notDeepEqual(tableA, tableB);
  });
  it('second half mirrors first half', function () {
    const table = buildPermutationTable(getRandom());
    const firstHalf = Array.prototype.slice.call(table, 0, table.length / 2);
    const secondHalf = Array.prototype.slice.call(table, table.length / 2);
    assert.deepEqual(firstHalf, secondHalf);
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

describe('createNoise2D', () => {
  const noise2D = createNoise2D(getRandom());
  describe('noise2D', () => {
    it('is initialized randomly without arguments', function () {
      const noise2DA = createNoise2D();
      const noise2DB = createNoise2D();
      assert.notEqual(noise2DA(0.1, 0.1), noise2DB(0.0, 0.1));
    });
    it('should return the same value for the same input', function () {
      assert.equal(noise2D(0.1, 0.2), noise2D(0.1, 0.2));
    });
    it('should return a different value for a different input', function () {
      assert.notEqual(noise2D(0.1, 0.2), noise2D(0.101, 0.202));
    });
    it('should return the same output with the same seed', function () {
      const noise2D2 = createNoise2D(getRandom());
      assert.equal(noise2D(0.1, 0.2), noise2D2(0.1, 0.2));
    });
    it('should return a different output with a different seed', function () {
      const noise2D2 = createNoise2D(getRandom('other seed'));
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
    it('should match snapshot for small inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise2D(x * 2, y * 2), size, size);
      assertMatchesImage(actual, 'noise2Dsmall.png');
    });
    it('should match snapshot for large inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise2D(x * 1000, y * 1000), size, size);
      assertMatchesImage(actual, 'noise2Dlarge.png');
    });
    it('should match snapshot for gigantic inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise2D(x * 5e9, y * 5e9), size, size);
      assertMatchesImage(actual, 'noise2Dgiga.png');
    });
  });
});

describe('createNoise3D', () => {
  const noise3D = createNoise3D(getRandom());
  describe('noise3D', () => {
    it('is initialized randomly without arguments', function () {
      const noise3DA = createNoise3D();
      const noise3DB = createNoise3D();
      assert.notEqual(noise3DA(0.1, 0.1, 0.1), noise3DB(0.0, 0.1, 0.1));
    });
    it('should return the same value for the same input', function () {
      assert.equal(noise3D(0.1, 0.2, 0.3), noise3D(0.1, 0.2, 0.3));
    });
    it('should return a different value for a different input', function () {
      assert.notEqual(noise3D(0.1, 0.2, 0.3), noise3D(0.101, 0.202, 0.303));
    });
    it('should return the same output with the same seed', function () {
      const noise3D2 = createNoise3D(getRandom());
      assert.equal(noise3D(0.1, 0.2, 0.3), noise3D2(0.1, 0.2, 0.3));
    });
    it('should return a different output with a different seed', function () {
      const noise3D2 = createNoise3D(getRandom('other seed'));
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
    it('should match snapshot for small inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise3D(x * 2, y * 2, (x + y)), size, size);
      assertMatchesImage(actual, 'noise3Dsmall.png');
    });
    it('should match snapshot for large inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise3D(x * 1000, y * 1000, (x + y) * 500), size, size);
      assertMatchesImage(actual, 'noise3Dlarge.png');
    });
  });
});

describe('createNoise4D', () => {
  const noise4D = createNoise4D(getRandom());
  describe('noise4D', () => {
    it('is initialized randomly without arguments', function () {
      const noise4DA = createNoise4D();
      const noise4DB = createNoise4D();
      assert.notEqual(noise4DA(0.1, 0.1, 0.1, 0.1), noise4DB(0.0, 0.1, 0.1, 0.1));
    });
    it('should return the same value for the same input', function () {
      assert.equal(noise4D(0.1, 0.2, 0.3, 0.4), noise4D(0.1, 0.2, 0.3, 0.4));
    });
    it('should return a different value for a different input', function () {
      assert.notEqual(noise4D(0.1, 0.2, 0.3, 0.4), noise4D(0.101, 0.202, 0.303, 0.404));
    });
    it('should return the same output with the same seed', function () {
      const noise4D2 = createNoise4D(getRandom());
      assert.equal(noise4D(0.1, 0.2, 0.3, 0.4), noise4D2(0.1, 0.2, 0.3, 0.4));
    });
    it('should return a different output with a different seed', function () {
      const noise4D2 = createNoise4D(getRandom('other seed'));
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
    it('should match snapshot for small inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise4D(x * 2, y * 2, x + y, x - y), size, size);
      assertMatchesImage(actual, 'noise4Dsmall.png');
    });
    it('should match snapshot for large inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise4D(x * 1000, y * 1000, (x + y) * 500, (x - y) * 500), size, size);
      assertMatchesImage(actual, 'noise4Dlarge.png');
    });
  });
});



describe('createNoise2DWithDerivatives', () => {
  const noise2DWithDerivatives = createNoise2DWithDerivatives(getRandom());
  const noise2D = createNoise2D(getRandom());

  describe('noise2DWithDerivatives', () => {
    it('is initialized randomly without arguments', function () {
      const noise3DA = createNoise3DWithDerivatives();
      const noise3DB = createNoise3DWithDerivatives();
      assert.notEqual(noise3DA(0.1, 0.1, 0.1), noise3DB(0.0, 0.1, 0.1));
    });
    it('should return the same value for the same input', function () {
      assert.equal(noise2DWithDerivatives(0.1, 0.2).value, noise2D(0.1, 0.2));
    });
    it('should return a different value for a different input', function () {
      assert.notEqual(noise2DWithDerivatives(0.1, 0.2).value, noise2DWithDerivatives(0.101, 0.202).value);
    });
    it('should return a different output with a different seed', function () {
      const noise2D2 = createNoise2DWithDerivatives(getRandom('other seed'));
      assert.notEqual(noise2DWithDerivatives(0.1, 0.2).value, noise2D2(0.1, 0.2).value);
    });
    it('should return values between -1 and 1', function () {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          assert(noise2DWithDerivatives(x / 5, y / 5).value >= -1);
          assert(noise2DWithDerivatives(x / 5, y / 5).value <= 1);
        }
      }
    });
    it('should return similar values for similar inputs', function () {
      assert(Math.abs(noise2DWithDerivatives(0.1, 0.2).value - noise2DWithDerivatives(0.101, 0.202).value) < 0.1);
    });
    it('should match snapshot for small inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise2DWithDerivatives(x * 2, y * 2).value, size, size);
      assertMatchesImage(actual, 'noise2Dsmall.png');
    });
    it('should match snapshot for large inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise2DWithDerivatives(x * 1000, y * 1000).value, size, size);
      assertMatchesImage(actual, 'noise2Dlarge.png');
    });
    it('should be close to finite difference derivatives', function () {
      const epsilon = 0.00001;
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          const output = noise2DWithDerivatives(x / 5, y / 5);

          const dx = (noise2D(x / 5 + epsilon, y / 5) - output.value) / epsilon;
          const dy = (noise2D(x / 5, y / 5 + epsilon) - output.value) / epsilon;
          
          assert(Math.abs(dx - output.dx) < 0.001);
          assert(Math.abs(dy - output.dy) < 0.001);
        }
      }
    });
    it('should use supplied output parameter if provided', function () {
      const output = { value: 0, dx: 0, dy: 0 };
      const newOutput = noise2DWithDerivatives(0.1, 0.2, output);
      assert.equal(output.value, noise2D(0.1, 0.2));
      assert.equal(newOutput, output);
    });
  });
});

describe('createNoise3DWithDerivatives', () => {
  const noise3DWithDerivatives = createNoise3DWithDerivatives(getRandom());
  const noise3D = createNoise3D(getRandom());

  describe('noise3DWithDerivatives', () => {
    it('is initialized randomly without arguments', function () {
      const noise3DA = createNoise3DWithDerivatives();
      const noise3DB = createNoise3DWithDerivatives();
      assert.notEqual(noise3DA(0.1, 0.1, 0.1), noise3DB(0.0, 0.1, 0.1));
    });
    it('should return the same value for the same input', function () {
      assert.equal(noise3DWithDerivatives(0.1, 0.2, 0.3).value, noise3D(0.1, 0.2, 0.3));
    });
    it('should return a different value for a different input', function () {
      assert.notEqual(noise3DWithDerivatives(0.1, 0.2, 0.3).value, noise3DWithDerivatives(0.101, 0.202, 0.303).value);
    });
    it('should return a different output with a different seed', function () {
      const noise3D2 = createNoise3DWithDerivatives(getRandom('other seed'));
      assert.notEqual(noise3DWithDerivatives(0.1, 0.2, 0.3).value, noise3D2(0.1, 0.2, 0.3).value);
    });
    it('should return values between -1 and 1', function () {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          assert(noise3DWithDerivatives(x / 5, y / 5, x + y).value >= -1);
          assert(noise3DWithDerivatives(x / 5, y / 5, x + y).value <= 1);
        }
      }
    });
    it('should return similar values for similar inputs', function () {
      assert(Math.abs(noise3DWithDerivatives(0.1, 0.2, 0.3).value - noise3DWithDerivatives(0.101, 0.202, 0.303).value) < 0.1);
    });
    it('should match snapshot for small inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise3DWithDerivatives(x * 2, y * 2, (x + y)).value, size, size);
      assertMatchesImage(actual, 'noise3Dsmall.png');
    });
    it('should match snapshot for large inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise3DWithDerivatives(x * 1000, y * 1000, (x + y) * 500).value, size, size);
      assertMatchesImage(actual, 'noise3Dlarge.png');
    });
    it('should be close to finite difference derivatives', function () {
      const epsilon = 0.00001;
      for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
          // this test can fail on boundaries, so we have to use smaller inputs
          const [ix, iy, iz] = [x / 50, y / 50, (x + y) / 80];
          const output = noise3DWithDerivatives(ix, iy, iz);

          const dx = (noise3D(ix + epsilon, iy, iz) - output.value) / epsilon;
          const dy = (noise3D(ix, iy + epsilon, iz) - output.value) / epsilon;
          const dz = (noise3D(ix, iy, iz + epsilon) - output.value) / epsilon;

          assert(Math.abs(dx - output.dx) < 0.001);
          assert(Math.abs(dy - output.dy) < 0.001);
          assert(Math.abs(dz - output.dz) < 0.001);
        }
      }
    });
    it('should use supplied output parameter if provided', function () {
      const output = { value: 0, dx: 0, dy: 0, dz: 0 };
      const newOutput = noise3DWithDerivatives(0.1, 0.2, 0.3, output);
      assert.equal(output.value, noise3D(0.1, 0.2, 0.3));
      assert.equal(newOutput, output);
    });
    it('should match small snapshot with derivatives', function () {
      const size = 64;
      const actual = sampleFunctionToRGBAImageDataOne((x, y) => {
        const output = noise3DWithDerivatives(x * 2, y * 2, (x + y));

        // cap dx, dy, dz to be max length 1
        const length = Math.sqrt(output.dx * output.dx + output.dy * output.dy + output.dz * output.dz);
        if(length > 1) {
          output.dx /= length;
          output.dy /= length;
          output.dz /= length;
        }

        return [(output.dx + 1) * 128, (output.dy + 1) * 128, (output.dz + 1) * 128, output.value * 128 + 128];
      }, size, size);
      assertMatchesRGBAImage(actual, 'noise3DsmallWithDerivatives.png');
    });
    it('should match large snapshot with derivatives', function () {
      const size = 64;
      const actual = sampleFunctionToRGBAImageDataOne((x, y) => {
        const output = noise3DWithDerivatives(x * 1000, y * 1000, (x + y) * 500);

        // cap dx, dy, dz to be max length 1
        const length = Math.sqrt(output.dx * output.dx + output.dy * output.dy + output.dz * output.dz);
        if(length > 1) {
          output.dx /= length;
          output.dy /= length;
          output.dz /= length;
        }

        return [(output.dx + 1) * 128, (output.dy + 1) * 128, (output.dz + 1) * 128, output.value * 128 + 128];
      }, size, size);
      assertMatchesRGBAImage(actual, 'noise3DlargeWithDerivatives.png');
    });
  });
});


describe('createNoise4DWithDerivatives', () => {
  const noise4DWithDerivatives = createNoise4DWithDerivatives(getRandom());
  const noise4D = createNoise4D(getRandom());

  describe('noise4DWithDerivatives', () => {
    it('is initialized randomly without arguments', function () {
      const noise4DA = createNoise4DWithDerivatives();
      const noise4DB = createNoise4DWithDerivatives();
      assert.notEqual(noise4DA(0.1, 0.1, 0.1, 0.1), noise4DB(0.0, 0.1, 0.1, 0.1));
    });
    it('should return the same value for the same input', function () {
      assert.equal(noise4DWithDerivatives(0.1, 0.2, 0.3, 0.4).value, noise4D(0.1, 0.2, 0.3, 0.4));
    });
    it('should return a different value for a different input', function () {
      assert.notEqual(noise4DWithDerivatives(0.1, 0.2, 0.3, 0.4).value, noise4DWithDerivatives(0.101, 0.202, 0.303, 0.404).value);
    });
    it('should return a different output with a different seed', function () {
      const noise4D2 = createNoise4DWithDerivatives(getRandom('other seed'));
      assert.notEqual(noise4DWithDerivatives(0.1, 0.2, 0.3, 0.4).value, noise4D2(0.1, 0.2, 0.3, 0.4).value);
    });
    it('should return values between -1 and 1', function () {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          assert(noise4DWithDerivatives(x / 5, y / 5, x + y, x - y).value >= -1);
          assert(noise4DWithDerivatives(x / 5, y / 5, x + y, x - y).value <= 1);
        }
      }
    });
    it('should return similar values for similar inputs', function () {
      assert(Math.abs(noise4DWithDerivatives(0.1, 0.2, 0.3, 0.4).value - noise4DWithDerivatives(0.101, 0.202, 0.303, 0.404).value) < 0.1);
    });
    it('should match snapshot for small inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise4DWithDerivatives(x * 2, y * 2, (x + y), (x - y)).value, size, size);
      assertMatchesImage(actual, 'noise4Dsmall.png');
    });
    it('should match snapshot for large inputs', function () {
      const size = 64;
      const actual = sampleFunctionToImageDataOne((x, y) => noise4DWithDerivatives(x * 1000, y * 1000, (x + y) * 500, (x - y) * 500).value, size, size);
      assertMatchesImage(actual, 'noise4Dlarge.png');
    });
    it('should be close to finite difference derivatives', function () {
      const epsilon = 0.00001;
      for (let x = 0; x < 20; x++) {
        for (let y = 0; y < 20; y++) {
          // this test can fail on boundaries, so we have to use smaller inputs
          const [ix, iy, iz, iw] = [x / 50, y / 50, (x + y) / 80, (x - y) / 80];
          const output = noise4DWithDerivatives(ix, iy, iz, iw);

          const dx = (noise4D(ix + epsilon, iy, iz, iw) - output.value) / epsilon;
          const dy = (noise4D(ix, iy + epsilon, iz, iw) - output.value) / epsilon;
          const dz = (noise4D(ix, iy, iz + epsilon, iw) - output.value) / epsilon;
          const dw = (noise4D(ix, iy, iz, iw + epsilon) - output.value) / epsilon;

          assert(Math.abs(dx - output.dx) < 0.001);
          assert(Math.abs(dy - output.dy) < 0.001);
          assert(Math.abs(dz - output.dz) < 0.001);
          assert(Math.abs(dw - output.dw) < 0.001);
        }
      }
    });
    it('should use supplied output parameter if provided', function () {
      const output = { value: 0, dx: 0, dy: 0, dz: 0, dw: 0 };
      const newOutput = noise4DWithDerivatives(0.1, 0.2, 0.3, 0.4, output);
      assert.equal(output.value, noise4D(0.1, 0.2, 0.3, 0.4));
      assert.equal(newOutput, output);
    });
    it('should match small snapshot with derivatives', function () {
      const size = 64;
      const actual = sampleFunctionToRGBAImageDataOne((x, y) => {
        const output = noise4DWithDerivatives(x * 2, y * 2, (x + y), (x - y));

        // cap dx, dy, dz, dw to be max length 1
        const length = Math.sqrt(output.dx * output.dx + output.dy * output.dy + output.dz * output.dz + output.dw * output.dw);
        if(length > 1) {
          output.dx /= length;
          output.dy /= length;
          output.dz /= length;
          output.dw /= length;
        }

        return [(output.dx + 1) * 128, (output.dy + 1) * 128, (output.dz + 1) * 128, (output.dw + 1) * 128];
      }, size, size);
      assertMatchesRGBAImage(actual, 'noise4DsmallWithDerivatives.png');
    });
    it('should match large snapshot with derivatives', function () {
      const size = 64;
      const actual = sampleFunctionToRGBAImageDataOne((x, y) => {
        const output = noise4DWithDerivatives(x * 1000, y * 1000, (x + y) * 500, (x - y) * 500);

        // cap dx, dy, dz, dw to be max length 1
        const length = Math.sqrt(output.dx * output.dx + output.dy * output.dy + output.dz * output.dz + output.dw * output.dw);
        if(length > 1) {
          output.dx /= length;
          output.dy /= length;
          output.dz /= length;
          output.dw /= length;
        }

        return [(output.dx + 1) * 128, (output.dy + 1) * 128, (output.dz + 1) * 128, (output.dw + 1) * 128];
      }, size, size);
      assertMatchesRGBAImage(actual, 'noise4DlargeWithDerivatives.png');
    });
  });
});