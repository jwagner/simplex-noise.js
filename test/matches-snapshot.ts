const fs = require('fs');
// const PNG = require('pngjs').PNG;
const path = require('path');

import {PNG} from 'pngjs';

const snapshotsPath = 'snapshots';

export function assertMatchesImage(actual: ImageData, imageFilename: string) {
  if(!imageFilename.endsWith('.png')) {
    console.log('throwing');
    throw new Error('imageFilename must end in .png');
  }
  let fileBuffer;
  try {
    fileBuffer = fs.readFileSync(path.join(snapshotsPath, imageFilename));
  }
  catch (_) {
    writeImageSnapshot(actual, imageFilename);
    return;
  }
  const png = PNG.sync.read(fileBuffer);
  if (actual.data.length * 4 !== png.data.length) {
    throw new Error('Expected actual.length to match png.data.length');
  }
  const identical = actual.data.every((value, i) => value == png.data[i*4]);
  if(!identical) {
    console.log(png.data);
    writeImageSnapshot(actual, imageFilename.replace('.png', '.error.png'));
    throw new Error('expected data to be identitcal');
  }
  
}

function writeImageSnapshot(actual: ImageData, imageFilename: string) {
  const png = new PNG({
    colorType: 0,
    inputColorType: 0,
    bitDepth: 16,
    width: actual.width,
    height: actual.height,
    inputHasAlpha: false,
  });
  if (actual.data.length*4 !== png.data.length) {
    console.warn(actual.data.length, png.data.length);
    throw new Error('Expected actual.data.length to match png.data.length');
  }
  png.data.forEach((_,i, a) => a[i] = (i%4==3) ? 255 : actual.data[(i/4)|0]);

  fs.writeFileSync(path.join(snapshotsPath, imageFilename), PNG.sync.write(png.pack(), {colorType: 0} ));
}

type SmampleFunction = (x: number, y:number) => number;
export function sampleFunctionToImageData(f: SmampleFunction, width: number, height: number) {
  let imageData = {
    width,
    height,
    data: new Uint8ClampedArray(width*height)
  };
  for(let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      imageData.data[y*width+x] = f(x, y);
    }
  }
  return imageData;
}