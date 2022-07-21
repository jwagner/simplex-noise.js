import {createNoise3D} from 'simplex-noise';

const canvas =  document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
document.body.appendChild(canvas);

const noise3D = createNoise3D(),
  ctx = canvas.getContext('2d'),
  imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height),
  width = imgdata.width,
  height = imgdata.height,
  data = imgdata.data;

function render() {
  const t = performance.now()/1000;
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var r = noise3D(x / 16, y / 16, t) * 0.5 + 0.5;
      var g = noise3D(x / 8, y / 8, t) * 0.5 + 0.5;
      data[(x + y * width) * 4 + 0] = r * 255;
      data[(x + y * width) * 4 + 1] = (r + g) * 200;
      data[(x + y * width) * 4 + 2] = 0;
      data[(x + y * width) * 4 + 3] = 255;
    }
  }
  ctx.putImageData(imgdata, 0, 0);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);