var Benchmark = this.Benchmark || require('benchmark');
var SimplexNoise = this.SimplexNoise || require('../simplex-noise');
var simplex = new SimplexNoise();

var suite = new Benchmark.Suite('simplex-noise')
  .add('init', function() {
    var simplex = new SimplexNoise();
  })
  .add('noise2D', function() {
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        for (var z = 0; z < 8; z++) {
          simplex.noise2D(x / 8, y / 8);
        }
      }
    }
  })
  .add('noise3D', function() {
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        for (var z = 0; z < 8; z++) {
          simplex.noise3D(x / 8, y / 8, z / 8);
        }
      }
    }
  })
  .add('noise3D2', function() {
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        for (var z = 0; z < 8; z++) {
          simplex.noise3D(x / 8, y / 8, z / 8);
        }
      }
    }
  })
  .add('noise4D', function() {
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        for (var z = 0; z < 8; z++) {
          simplex.noise4D(x / 8, y / 8, z / 8, (x + y) / 16);
        }
      }
    }
  })
  .on('complete', function() {
    this.forEach(function(bench) {
      console.log(
        bench.name +
        ': ' +
        Benchmark.formatNumber(Math.round(1.0 / bench.times.period)) +
        ' ops/sec ±' +
        Math.round(bench.stats.rme) + '%'
      );
    });
  })
  .run();
