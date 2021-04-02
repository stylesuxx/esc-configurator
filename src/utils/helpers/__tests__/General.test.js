import fs from 'fs';

import Flash from '../Flash';

import {
  retry,
  delay,
  compare,
  isValidFlash,
  isValidLayout,
  getPossibleTypes,
} from '../General';

test('compare same buffers', () => {
  const buffer1 = new Uint8Array([1, 2, 3]);
  const buffer2 = new Uint8Array([1, 2, 3]);

  expect(compare(buffer1, buffer2)).toBeTruthy();
});

test('compare buffers of different length', () => {
  const buffer1 = new Uint8Array([1, 2, 3]);
  const buffer2 = new Uint8Array([1, 2]);

  expect(compare(buffer1, buffer2)).not.toBeTruthy();
});

test('compare different buffers', () => {
  const buffer1 = new Uint8Array([1, 2, 3]);
  const buffer2 = new Uint8Array([3, 2, 1]);

  expect(compare(buffer1, buffer2)).not.toBeTruthy();
});

test('delay', async() => {
  await delay(500);

  expect(true).toBeTruthy();
});

test('valid Flash', () => {
  const hexContent = fs.readFileSync(`${__dirname}/valid.hex`);
  const hexString = hexContent.toString();
  const parsed = Flash.parseHex(hexString);
  const endAddress = parsed.data[parsed.data.length - 1].address + parsed.data[parsed.data.length - 1].bytes;
  const flashOffset = 0;
  const flash = Flash.fillImage(parsed, endAddress - flashOffset, flashOffset);

  expect(isValidFlash('#BLHELI$EFM8B21#', flash)).toBeTruthy();
});

test('invalid Flash', () => {
  expect(isValidFlash('#BLHELI$INVALID', new Uint8Array([1,2,3,4]))).not.toBeTruthy();
});

test('retry failing each time', async() => {
  function test(resolve, reject) {
    reject(new Error('Fail'));
  }

  try {
    await retry(test, 5, 10);
  } catch(e) {
    expect();
  }
});

test('retry failing each time without delay', async() => {
  function test(resolve, reject) {
    reject(new Error('Fail'));
  }

  try {
    await retry(test, 5);
  } catch(e) {
    expect();
  }
});

test('retry succeeds at first try', async() => {
  function test(resolve, reject) {
    resolve(true);
  }

  const success = await retry(test, 5, 10);
  expect(success).toBeTruthy();
});

test('retry succeeds at third try', async() => {
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

test('check invalid layout', async() => {
  const valid = isValidLayout('invalid');
  expect(valid).not.toBeTruthy();
});

test('check valid layout', async() => {
  const valid = isValidLayout('#A_L_00#');
  expect(valid).toBeTruthy();
});

test('possible EFM8', async() => {
  const types = getPossibleTypes(0xE8B1);

  expect(types.length).toBe(2);
});

test('possible AM32', async() => {
  const types = getPossibleTypes(0x1f06);

  expect(types.length).toBe(1);
});

test('possible Blheli Silabs', async() => {
  const types = getPossibleTypes(0xF310);

  expect(types.length).toBe(1);
});

test('possible Blheli Atmel', async() => {
  const types = getPossibleTypes(0x9307);

  expect(types.length).toBe(1);
});
