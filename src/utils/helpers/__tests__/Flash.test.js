import fs from 'fs';
import path from 'path';

import {
  buf2ascii,
  ascii2buf,
  parseHex,
  fillImage,
} from '../Flash';

test('buffer to ACSII', () => {
  const ascii = buf2ascii([0x0054, 0x0045, 0x0053, 0x0054]);
  expect(ascii).toEqual('TEST');
});

test('ASCII to buffer', () => {
  const buffer = ascii2buf('TEST');
  expect(buffer).toEqual(new Uint8Array([0x0054, 0x0045, 0x0053, 0x0054]));
});

test('should parse a valid hex file', () => {
  const hexContent = fs.readFileSync(`${__dirname}/valid.hex`);
  const hexString = hexContent.toString();
  const result = parseHex(hexString);

  expect(result).not.toBeNull();
});

test('should not parse an invalid hex file', () => {
  const hexContent = fs.readFileSync(`${__dirname}/invalid.hex`);
  const hexString = hexContent.toString();
  const result = parseHex(hexString);

  expect(result).toBeNull();
});

test('should fill an Image to a given size', () => {
  const hexContent = fs.readFileSync(`${__dirname}/valid.hex`);
  const hexString = hexContent.toString();
  const parsed = parseHex(hexString);
  const endAddress = parsed.data[parsed.data.length - 1].address + parsed.data[parsed.data.length - 1].bytes;
  const flashOffset = 0;
  const result = fillImage(parsed, endAddress - flashOffset, flashOffset);

  expect(result.length).toEqual(endAddress);
});
