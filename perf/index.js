/* eslint-disable @typescript-eslint/no-var-requires */
const Benchmark = require('benchmark');
const Alea = require('alea');
const {createNoise2D, createNoise3D, createNoise4D} = require('..');

const invocationsPerRun = 8*8*8;
const rnd = () => new Alea('seed');
const noise2D = createNoise2D(rnd());
const noise3D = createNoise3D(rnd());
const noise4D = createNoise4D(rnd());

// prevent the compiler from optimizing away the calls
let sideEffect = 0.0;

new Benchmark.Suite('simplex-noise')
  .add('noise2D', function() {
    let a = 0.0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 8; z++) {
          a += noise2D(x / 8, y / 8);
        }
      }
    }
    sideEffect += a;
  }, {minTime: 30})
  .add('noise3D', function() {
    let a = 0.0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        for (let z = 0; z < 8; z++) {
          a += noise3D(x / 8, y / 8, z / 8);
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
  .run({delay: 10, minTime: 50, maxTime: 120, minSamples: 10000});