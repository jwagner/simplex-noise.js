// This is a minimal test case for performance investigations

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {createNoise2D} = require('..');

const noise2D = createNoise2D();

for(let i = 0; i < 3; i++) {
  console.log('pass', i);
  let sum = 0;
  for(let y = 0; y < 10; y+=0.1) {
    for(let x = 0; x < 10; x+=0.1) {
      sum += noise2D(x, y);
    }
  }
  console.log(sum);
}

