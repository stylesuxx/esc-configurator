import fs from 'fs';

import Flash from '../Flash';

describe('Flash', () => {
  test('should parse a valid hex file', () => {
    const hexContent = fs.readFileSync(`${__dirname}/valid.hex`);
    const hexString = hexContent.toString();
    const result = Flash.parseHex(hexString);

    expect(result).not.toBeNull();
  });

  test('should not parse an invalid hex file', () => {
    const hexContent = fs.readFileSync(`${__dirname}/invalid.hex`);
    const hexString = hexContent.toString();
    const result = Flash.parseHex(hexString);

    expect(result).toBeNull();
  });

  test('should not parse a hex file with broken checksum', () => {
    const hexContent = fs.readFileSync(`${__dirname}/broken_checksum.hex`);
    const hexString = hexContent.toString();
    const result = Flash.parseHex(hexString);

    expect(result).toBeNull();
  });

  test('should fill an Image to a given size', () => {
    const hexContent = fs.readFileSync(`${__dirname}/valid.hex`);
    const hexString = hexContent.toString();
    const parsed = Flash.parseHex(hexString);
    const endAddress = parsed.data[parsed.data.length - 1].address + parsed.data[parsed.data.length - 1].bytes;
    const flashOffset = 0;
    const result = Flash.fillImage(parsed, endAddress - flashOffset, flashOffset);

    expect(result.length).toEqual(endAddress);
  });

  test('should fail filling an Image with address higher than length', () => {
    const hexContent = fs.readFileSync(`${__dirname}/valid.hex`);
    const hexString = hexContent.toString();
    const parsed = Flash.parseHex(hexString);
    const endAddress = parsed.data[parsed.data.length - 1].address + parsed.data[parsed.data.length - 1].bytes;
    const flashOffset = 0;
    const result = Flash.fillImage(parsed, endAddress - flashOffset - 1000, flashOffset);

    expect(result).toBeNull();
  });

  test('should handle extended segment address record', () => {
    let hexContent = ':0100000200000000000000';
    let hexString = hexContent.toString();
    let result = Flash.parseHex(hexString);

    expect(result).toBeNull();

    hexContent = ':01000002FF000000000000';
    hexString = hexContent.toString();
    result = Flash.parseHex(hexString);

    expect(result).toBeNull();
  });

  test('should handle start of segment address record', () => {
    let hexContent = ':0100000300000000000000';
    let hexString = hexContent.toString();
    let result = Flash.parseHex(hexString);

    expect(result).toBeNull();

    hexContent = ':01000003FF000000000000';
    hexString = hexContent.toString();
    result = Flash.parseHex(hexString);

    expect(result).toBeNull();
  });

  test('should handle start of linear address record', () => {
    const hexContent = ':01000005FF000000000000';
    const hexString = hexContent.toString();
    const result = Flash.parseHex(hexString);

    expect(result).toBeNull();
  });
});
