var Benchmark = this.Benchmark || require('benchmark');
var simplex = this.simplex || require('../simplex-noise');

var suite = new Benchmark.Suite('simplex-noise')
  .add('init', function() {
    var noise = simplex(Math.random);
  })
  .add('noise1D', function() {
    for (var x = 0; x < 8; x++) {
      noise(x / 8);
    }
  })
  .add('noise2D', function() {
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        noise(x / 8, y / 8);
      }
    }
  })
  .add('noise3D', function() {
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        for (var z = 0; z < 8; z++) {
          noise(x / 8, y / 8, z / 8);
        }
      }
    }
  })
  .add('noise3D2', function() {
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        for (var z = 0; z < 8; z++) {
          noise(x / 8, y / 8, z / 8);
        }
      }
    }
  })
  .add('noise4D', function() {
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        for (var z = 0; z < 8; z++) {
          noise(x / 8, y / 8, z / 8, (x + y) / 16);
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
