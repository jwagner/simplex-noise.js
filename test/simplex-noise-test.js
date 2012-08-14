if(typeof require !== 'undefined'){
    var buster = require("buster");
    var SimplexNoise = require("../simplex-noise");
}

var assert = buster.assertions.assert,
    refute = buster.assertions.refute;

var _rnd;
function random(){
    return 1.0/(_rnd++);
}

buster.testCase("simplex-noise", {
    setUp: function() {_rnd = 0;},
    "should initialize with Math.random": function () {
        var simplex = new SimplexNoise();
        assert.equals(simplex.perm.length, 512);
        assert.equals(simplex.permMod12.length, 512);
        for(var i = 0; i < 512; i++){
            assert(simplex.perm[i] < 256);
            assert(simplex.perm[i] >= 0);
            assert(simplex.perm[i] >= 0);
            assert.equals(simplex.perm[i], simplex.perm[i&255]);
            assert.equals(simplex.permMod12[i], simplex.perm[i]%12);
        }
    },
    "should initialize with a custom random function": function () {
        var i = 2,
            simplex = new SimplexNoise(function(){return 1.0/i++;});
            assert.equals(simplex.perm.length, 512);
            assert.equals(simplex.permMod12.length, 512);
            assert.equals(simplex.perm[0], 128);
            assert.equals(simplex.perm[1], 85);
            assert.equals(simplex.perm[256], 128);
            assert.equals(simplex.perm[257], 85);
            assert.equals(simplex.permMod12[0], 128%12);
            assert.equals(simplex.permMod12[1], 85%12);
    },
    'noise': {
        setUp: function() {
            this.simplex = new SimplexNoise(random);
        },
        'noise2D': {
            'should return the same value for the same input': function() {
                assert.equals(this.simplex.noise2D(0.1, 0.2), this.simplex.noise2D(0.1, 0.2));
            },
            'should return a different value for a different input': function() {
                refute.equals(this.simplex.noise2D(0.1, 0.2), this.simplex.noise2D(0.101, 0.202));
            },
            'should return values between -1 and 1': function () {
                for(var x = 0; x < 10; x++) {
                    for(var y = 0; y < 10; y++) {
                        assert(this.simplex.noise2D(x/5, y/5) >= -1);
                        assert(this.simplex.noise2D(x/5, y/5) <= 1);
                    }
                }
            },
            'should return similar values for similar inputs': function () {
                assert(Math.abs(this.simplex.noise2D(0.1, 0.2)-this.simplex.noise2D(0.101, 0.202))<0.1);
            }
        },
        'noise3D': {
            'should return the same value for the same input': function() {
                assert.equals(this.simplex.noise3D(0.1, 0.2, 0.3), this.simplex.noise3D(0.1, 0.2, 0.3));
            },
            'should return a different value for a different input': function() {
                refute.equals(this.simplex.noise3D(0.1, 0.2, 0.3), this.simplex.noise3D(0.101, 0.202, 0.303));
                refute.equals(this.simplex.noise3D(0.1, 0.2, 0.3), this.simplex.noise3D(0.1, 0.2, 0.303));
            },
            'should return values between -1 and 1': function () {
                for(var x = 0; x < 10; x++) {
                    for(var y = 0; y < 10; y++) {
                        assert(this.simplex.noise3D(x/5, y/5, x+y) >= -1);
                        assert(this.simplex.noise3D(x/5, y/5, x+y) <= 1);
                    }
                }
            },
            'should return similar values for similar inputs': function () {
                assert(Math.abs(this.simplex.noise3D(0.1, 0.2, 0.3)-this.simplex.noise3D(0.101, 0.202, 0.303))<0.1);
            }
        },
        'noise4D': {
            'should return the same value for the same input': function() {
                assert.equals(this.simplex.noise4D(0.1, 0.2, 0.3, 0.4), this.simplex.noise4D(0.1, 0.2, 0.3, 0.4));
            },
            'should return a different value for a different input': function() {
                refute.equals(this.simplex.noise4D(0.1, 0.2, 0.3, 0.4), this.simplex.noise4D(0.101, 0.202, 0.303, 0.404));
                refute.equals(this.simplex.noise4D(0.1, 0.2, 0.3, 0.4), this.simplex.noise4D(0.1, 0.2, 0.3, 0.404));
            },
            'should return values between -1 and 1': function () {
                for(var x = 0; x < 10; x++) {
                    for(var y = 0; y < 10; y++) {
                        assert(this.simplex.noise4D(x/5, y/5, x+y, x-y) >= -1);
                        assert(this.simplex.noise4D(x/5, y/5, x+y, x-y) <= 1);
                    }
                }
            },
            'should return similar values for similar inputs': function () {
                assert(Math.abs(this.simplex.noise4D(0.1, 0.2, 0.3, 0.4)-this.simplex.noise4D(0.101, 0.202, 0.303, 0.404))<0.1);
            }
        }


    } 
});
