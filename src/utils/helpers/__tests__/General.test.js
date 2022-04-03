import fs from 'fs';

import Flash from '../Flash';

let retry, delay, compare, isValidFlash, isValidLayout;

describe('General', () => {
  beforeAll(async() => {
    /**
     * require component instead of import so that we can properly
     * pre-populate the local storage
     */
    const general = require('../General');
    retry = general.retry;
    delay = general.delay;
    compare = general.compare;
    isValidFlash = general.isValidFlash;
    isValidLayout = general.isValidLayout;
  });

  it('compare same buffers', () => {
    const buffer1 = new Uint8Array([1, 2, 3]);
    const buffer2 = new Uint8Array([1, 2, 3]);

    expect(compare(buffer1, buffer2)).toBeTruthy();
  });

  it('compare buffers of different length', () => {
    const buffer1 = new Uint8Array([1, 2, 3]);
    const buffer2 = new Uint8Array([1, 2]);

    expect(compare(buffer1, buffer2)).not.toBeTruthy();
  });

  it('compare different buffers', () => {
    const buffer1 = new Uint8Array([1, 2, 3]);
    const buffer2 = new Uint8Array([3, 2, 1]);

    expect(compare(buffer1, buffer2)).not.toBeTruthy();
  });

  it('delay', async() => {
    await delay(500);

    expect(true).toBeTruthy();
  });

  it('valid Flash', () => {
    const hexContent = fs.readFileSync(`${__dirname}/valid.hex`);
    const hexString = hexContent.toString();
    const parsed = Flash.parseHex(hexString);
    const endAddress = parsed.data[parsed.data.length - 1].address + parsed.data[parsed.data.length - 1].bytes;
    const flashOffset = 0;
    const flash = Flash.fillImage(parsed, endAddress - flashOffset, flashOffset);

    expect(isValidFlash('#BLHELI$EFM8B21#', flash)).toBeTruthy();
  });

  it('invalid Flash', () => {
    expect(isValidFlash('#BLHELI$INVALID', new Uint8Array([1,2,3,4]))).not.toBeTruthy();
  });

  it('retry failing each time', async() => {
    function test(resolve, reject) {
      reject(new Error('Fail'));
    }

    await expect(retry(test, 5, 10)).rejects.toThrow();
  });

  it('retry failing each time without delay', async() => {
    function test(resolve, reject) {
      reject(new Error('Fail'));
    }

    await expect(retry(test, 5)).rejects.toThrow();
  });

  it('retry succeeds at first try', async() => {
    function test(resolve) {
      resolve(true);
    }

    const success = await retry(test, 5, 10);
    expect(success).toBeTruthy();
  });

  it('retry succeeds at third try', async() => {
    let count = 0;

    function test(resolve, reject) {
      count += 1;
      if(count === 3) {
        resolve(true);
      } else {
        reject(new Error('Fail'));
      }
    }

    const success = await retry(test, 5, 10);
    expect(success).toBeTruthy();
  });

  it('check invalid layout', async() => {
    const valid = isValidLayout('invalid');
    expect(valid).not.toBeTruthy();
  });

  it('check valid layout', async() => {
    const valid = isValidLayout('#A_L_00#');
    expect(valid).toBeTruthy();
  });
});
