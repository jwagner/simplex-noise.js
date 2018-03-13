var simplex = require('../simplex-noise');
var Alea = require('alea');
var assert = require('chai').assert;

describe('SimplexNoise', function() {
  describe('factory', function() {
    it('should initialize consistently when using the same seed', function() {
      var randomA = new Alea('seed')
      var randomB = new Alea('seed')
      var noiseA = simplex(randomA);
      var noiseB = simplex(randomB);
      assert.equal(noiseA(1, 1), noiseB(1, 1));
    });

    it('should initialize differently when using a different seed', function() {
      var randomA = new Alea('seed')
      var randomB = new Alea('different seed')
      var noiseA = simplex(randomA);
      var noiseB = simplex(randomB);
      assert.notEqual(noiseA(1, 1), noiseB(1, 1));
    });
  });

  describe('noise', function() {
    var noise, noise2;
    beforeEach(function() {
      noise = simplex(new Alea('seed'));
      noise2 = simplex(new Alea('other seed'))
    });
    describe('noise2D', function() {
      it('should return the same value for the same input', function() {
        assert.equal(noise(0.1, 0.2), noise(0.1, 0.2));
      });
      it('should return a different value for a different input', function() {
        assert.notEqual(noise(0.1, 0.2), noise(0.101, 0.202));
      });
      it('should return a different output with a different seed', function() {
        assert.notEqual(noise(0.1, 0.2), noise2(0.1, 0.2));
      });
      it('should return values between -1 and 1', function() {
        for (var x = 0; x < 10; x++) {
          for (var y = 0; y < 10; y++) {
            assert(noise(x / 5, y / 5) >= -1);
            assert(noise(x / 5, y / 5) <= 1);
          }
        }
      });
      it('should return similar values for similar inputs', function() {
        assert(Math.abs(noise(0.1, 0.2) - noise(0.101, 0.202)) < 0.1);
      });
    });

    describe('noise3D', function() {
      it('should return the same value for the same input', function() {
        assert.equal(noise(0.1, 0.2, 0.3), noise(0.1, 0.2, 0.3));
      });
      it('should return a different value for a different input', function() {
        assert.notEqual(noise(0.1, 0.2, 0.3), noise(0.101, 0.202, 0.303));
        assert.notEqual(noise(0.1, 0.2, 0.3), noise(0.1, 0.2, 0.303));
      });
      it('should return a different output with a different seed', function() {
        assert.notEqual(noise(0.1, 0.2, 0.3), noise2(0.1, 0.2, 0.3));
      });
      it('should return values between -1 and 1', function() {
        for (var x = 0; x < 10; x++) {
          for (var y = 0; y < 10; y++) {
            assert(noise(x / 5, y / 5, x + y) >= -1);
            assert(noise(x / 5, y / 5, x + y) <= 1);
          }
        }
      });
      it('should return similar values for similar inputs', function() {
        assert(Math.abs(noise(0.1, 0.2, 0.3) - noise(0.101, 0.202, 0.303)) < 0.1);
      });
    });

    describe('noise4D', function() {
      it('should return the same value for the same input', function() {
        assert.equal(noise(0.1, 0.2, 0.3, 0.4), noise(0.1, 0.2, 0.3, 0.4));
      });
      it('should return a different value for a different input', function() {
        assert.notEqual(noise(0.1, 0.2, 0.3, 0.4), noise(0.101, 0.202, 0.303, 0.404));
        assert.notEqual(noise(0.1, 0.2, 0.3, 0.4), noise(0.1, 0.2, 0.3, 0.404));
      });
      it('should return a different output with a different seed', function() {
        assert.notEqual(noise(0.1, 0.2, 0.3, 0.4), noise2(0.1, 0.2, 0.3, 0.4));
      });
      it('should return values between -1 and 1', function() {
        for (var x = 0; x < 10; x++) {
          for (var y = 0; y < 10; y++) {
            assert(noise(x / 5, y / 5, x + y, x - y) >= -1);
            assert(noise(x / 5, y / 5, x + y, x - y) <= 1);
          }
        }
      });
      it('should return similar values for similar inputs', function() {
        assert(
          Math.abs(
            noise(0.1, 0.2, 0.3, 0.4) -
            noise(0.101, 0.202, 0.303, 0.404)
          ) < 0.1);
      });
    });
  });
});
