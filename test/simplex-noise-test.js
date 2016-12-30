var SimplexNoise = require('../simplex-noise');

var assert = require('chai').assert;

describe('simplex-noise', function() {
  function getRandom() {
    var rnd = 0;
    return function() {
      return 1.0 / (rnd++);
    };
  }

  describe('constructor', function() {
    it('should initialize with Math.random', function() {
      var simplex = new SimplexNoise();
      assert.equal(simplex.perm.length, 512);
      assert.equal(simplex.permMod12.length, 512);
      for (var i = 0; i < 512; i++) {
        assert(simplex.perm[i] < 256);
        assert(simplex.perm[i] >= 0);
        assert(simplex.perm[i] >= 0);
        assert.equal(simplex.perm[i], simplex.perm[i & 255]);
        assert.equal(simplex.permMod12[i], simplex.perm[i] % 12);
      }
    });

    it('should initialize with a custom random function', function() {
      var i = 2;
      var simplex = new SimplexNoise(function() {
        return 1.0 / i++;
      });
      assert.equal(simplex.perm.length, 512);
      assert.equal(simplex.permMod12.length, 512);
      assert.equal(simplex.perm[0], 128);
      assert.equal(simplex.perm[1], 85);
      assert.equal(simplex.perm[256], 128);
      assert.equal(simplex.perm[257], 85);
      assert.equal(simplex.permMod12[0], 128 % 12);
      assert.equal(simplex.permMod12[1], 85 % 12);
    });
  });

  describe('noise', function() {
    var simplex;
    beforeEach(function() {
      simplex = new SimplexNoise(getRandom());
    });
    describe('noise2D', function() {
      it('should return the same value for the same input', function() {
        assert.equal(simplex.noise2D(0.1, 0.2), simplex.noise2D(0.1, 0.2));
      });
      it('should return a different value for a different input', function() {
        assert.notEqual(simplex.noise2D(0.1, 0.2), simplex.noise2D(0.101, 0.202));
      });
      it('should return values between -1 and 1', function() {
        for (var x = 0; x < 10; x++) {
          for (var y = 0; y < 10; y++) {
            assert(simplex.noise2D(x / 5, y / 5) >= -1);
            assert(simplex.noise2D(x / 5, y / 5) <= 1);
          }
        }
      });
      it('should return similar values for similar inputs', function() {
        assert(Math.abs(simplex.noise2D(0.1, 0.2) - simplex.noise2D(0.101, 0.202)) < 0.1);
      });
    });

    describe('noise3D', function() {
      it('should return the same value for the same input', function() {
        assert.equal(simplex.noise3D(0.1, 0.2, 0.3), simplex.noise3D(0.1, 0.2, 0.3));
      });
      it('should return a different value for a different input', function() {
        assert.notEqual(simplex.noise3D(0.1, 0.2, 0.3), simplex.noise3D(0.101, 0.202, 0.303));
        assert.notEqual(simplex.noise3D(0.1, 0.2, 0.3), simplex.noise3D(0.1, 0.2, 0.303));
      });
      it('should return values between -1 and 1', function() {
        for (var x = 0; x < 10; x++) {
          for (var y = 0; y < 10; y++) {
            assert(simplex.noise3D(x / 5, y / 5, x + y) >= -1);
            assert(simplex.noise3D(x / 5, y / 5, x + y) <= 1);
          }
        }
      });
      it('should return similar values for similar inputs', function() {
        assert(Math.abs(simplex.noise3D(0.1, 0.2, 0.3) - simplex.noise3D(0.101, 0.202, 0.303)) < 0.1);
      });
    });

    describe('noise4D', function() {
      it('should return the same value for the same input', function() {
        assert.equal(simplex.noise4D(0.1, 0.2, 0.3, 0.4), simplex.noise4D(0.1, 0.2, 0.3, 0.4));
      });
      it('should return a different value for a different input', function() {
        assert.notEqual(simplex.noise4D(0.1, 0.2, 0.3, 0.4), simplex.noise4D(0.101, 0.202, 0.303, 0.404));
        assert.notEqual(simplex.noise4D(0.1, 0.2, 0.3, 0.4), simplex.noise4D(0.1, 0.2, 0.3, 0.404));
      });
      it('should return values between -1 and 1', function() {
        for (var x = 0; x < 10; x++) {
          for (var y = 0; y < 10; y++) {
            assert(simplex.noise4D(x / 5, y / 5, x + y, x - y) >= -1);
            assert(simplex.noise4D(x / 5, y / 5, x + y, x - y) <= 1);
          }
        }
      });
      it('should return similar values for similar inputs', function() {
        assert(
          Math.abs(
            simplex.noise4D(0.1, 0.2, 0.3, 0.4) -
            simplex.noise4D(0.101, 0.202, 0.303, 0.404)
          ) < 0.1);
      });
    });
  });
});
