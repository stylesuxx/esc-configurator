import fs from 'fs';

import Flash from '../Flash';

describe('Flash', () => {
  it('should parse a valid hex file', () => {
    const hexContent = fs.readFileSync(`${__dirname}/valid.hex`);
    const hexString = hexContent.toString();
    const result = Flash.parseHex(hexString);

    expect(result).not.toBeNull();
  });

  it('should not parse an invalid hex file', () => {
    const hexContent = fs.readFileSync(`${__dirname}/invalid.hex`);
    const hexString = hexContent.toString();
    const result = Flash.parseHex(hexString);

    expect(result).toBeNull();
  });

  it('should not parse a hex file with broken checksum', () => {
    const hexContent = fs.readFileSync(`${__dirname}/broken_checksum.hex`);
    const hexString = hexContent.toString();
    const result = Flash.parseHex(hexString);

    expect(result).toBeNull();
  });

  it('should throw with invalid record type', () => {
    expect(() => Flash.parseHex(':01000002FFFF')).toThrow();
    expect(() => Flash.parseHex(':01000003FFFF')).toThrow();

    expect(() => Flash.parseHex(':0100000200FF')).not.toThrow();
    expect(() => Flash.parseHex(':0100000300FF')).not.toThrow();
  });

  it('should handle linear address record type', () => {
    const result = Flash.parseHex(':01000005FF6D\n:00000001FF');
    expect(result).not.toBeNull();
  });

  it('should fill an Image to a given size', () => {
    const hexContent = fs.readFileSync(`${__dirname}/valid.hex`);
    const hexString = hexContent.toString();
    const parsed = Flash.parseHex(hexString);
    const endAddress = parsed.data[parsed.data.length - 1].address + parsed.data[parsed.data.length - 1].bytes;
    const flashOffset = 0;
    const result = Flash.fillImage(parsed, endAddress - flashOffset, flashOffset);

    expect(result.length).toEqual(endAddress);
  });

  it('should fail filling an Image with address higher than length', () => {
    const hexContent = fs.readFileSync(`${__dirname}/valid.hex`);
    const hexString = hexContent.toString();
    const parsed = Flash.parseHex(hexString);
    const endAddress = parsed.data[parsed.data.length - 1].address + parsed.data[parsed.data.length - 1].bytes;
    const flashOffset = 0;
    const result = Flash.fillImage(parsed, endAddress - flashOffset - 1000, flashOffset);

    expect(result).toBeNull();
  });

  it('should return information about SiLabs flash', () => {
    const flash = { params: [0xB2, 0xE8, 0x64, 0x01] };
    const info = Flash.getInfo(flash);

    expect(info && typeof info === 'object').toBeTruthy();
    expect(info.isSiLabs).toBeTruthy();
    expect(info.isAtmel).toBeFalsy();
    expect(info.isArm).toBeFalsy();

    expect(info.meta && typeof info.meta === 'object').toBeTruthy();
    expect(info.meta.signature).toBe(0xE8B2);
    expect(info.meta.input).toBe(0x64);
    expect(info.meta.interfaceMode).toBe(0x01);
    expect(info.meta.available).toBeTruthy();
  });
});