import fs from 'fs';
import path from 'path';

import { PNG } from 'pngjs';

const snapshotsPath = 'snapshots';

type ImageDataLike = {
  width: number,
  height: number,
  data: Uint8ClampedArray
};

export function assertMatchesImage(actual: ImageDataLike, imageFilename: string): void {
  if (!imageFilename.endsWith('.png')) {
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
  const identical = actual.data.every((value, i) => value == png.data[i * 4]);
  if (!identical) {
    console.log(png.data);
    writeImageSnapshot(actual, imageFilename.replace('.png', '.error.png'));
    throw new Error('expected data to be identitcal');
  }

}

function writeImageSnapshot(actual: ImageDataLike, imageFilename: string) {
  const png = new PNG({
    colorType: 0,
    inputColorType: 0,
    bitDepth: 16,
    width: actual.width,
    height: actual.height,
    inputHasAlpha: false,
  });
  if (actual.data.length * 4 !== png.data.length) {
    console.warn(actual.data.length, png.data.length);
    throw new Error('Expected actual.data.length to match png.data.length');
  }
  png.data.forEach((_, i, a) => a[i] = (i % 4 == 3) ? 255 : actual.data[(i / 4) | 0]);

  fs.writeFileSync(path.join(snapshotsPath, imageFilename), PNG.sync.write(png.pack(), { colorType: 0 }));
}

type SampleFunction = (x: number, y: number) => number;
export function sampleFunctionToImageData(f: SampleFunction, width: number, height: number): ImageDataLike {
  const imageData = {
    width,
    height,
    data: new Uint8ClampedArray(width * height)
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      imageData.data[y * width + x] = f(x, y);
    }
  }
  return imageData;
}

// same as sampleFunctionToImageData but x and y go from -1 .. 1 instead of 0 .. width
// output is scaled from -1 .. 1 to 0 .. 255
export function sampleFunctionToImageDataOne(f: SampleFunction, width: number, height: number): ImageDataLike {
  return sampleFunctionToImageData((x, y) => f(x / width * 2 - 1, y / height * 2 - 1) * 128 + 127, width, height);
}