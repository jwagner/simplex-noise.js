/* eslint-disable @typescript-eslint/no-var-requires */
let Benchmark = require('benchmark');
let SimplexNoise = require('..').SimplexNoise;

const invocationsPerRun = 8*8*8;
const simplex = new SimplexNoise('seed');

const {makeNoise2D,makeNoise4D} = require('fast-simplex-noise');
const noise2D = makeNoise2D();
const noise4D = makeNoise4D();


// prevent the compiler from optimizing away the calls
let sideEffect = 0.0;
new Benchmark.Suite('simplex-noise')
  .add('init', function() {
    new SimplexNoise();
  })
  .add('noise2D', function() {
    let a = 0.0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 8; z++) {
          a += simplex.noise2D(x / 8, y / 8);
        }
      }
    }
    sideEffect += a;
  })
  .add('fast-simplex-noise noise2D', function() {
    let a = 0.0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 8; z++) {
          a += noise2D(x / 8, y / 8);
        }
      }
    }
    sideEffect += a;
  })
  .add('noise3D', function() {
    let a = 0.0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 8; z++) {
          a += simplex.noise3D(x / 8, y / 8, z / 8);
        }
      }
    }
    sideEffect += a;
  })
  .add('noise4D', function() {
    let a = 0.0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 8; z++) {
          a += simplex.noise4D(x / 8, y / 8, z / 8, (x + y) / 16);
        }
      }
    }
    sideEffect += a;
  })
  .add('fast-simplex-noise noise4D', function() {
    let a = 0.0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 8; z++) {
          a += noise4D(x / 8, y / 8, z / 8, (x + y) / 16);
        }
      }
    }
    sideEffect += a;
  })
  
  .on('complete', function() {
    console.log(sideEffect);
    this.forEach(function(bench) {
      console.log(
        bench.name +
        ': ' +
        Benchmark.formatNumber(Math.round(1.0 / bench.times.period * (bench.name == 'init' ? 1 : invocationsPerRun))) +
        ' ops/sec ±' +
        Math.round(bench.stats.rme) + '%'
      );
    });
  })
  .run();
