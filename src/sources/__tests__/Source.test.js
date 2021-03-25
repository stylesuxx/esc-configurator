import {
  Source
} from '../Source';

import {
  blheliSource,
} from '../index';

test('Source without parameters', () => {
  try {
    const source = new Source();
  } catch(e) {
    expect(e).not.toBeNull();
  }
});

test('blheliSource get versions', async() => {
  let versions = await blheliSource.getVersions();
  expect(versions).not.toBe({});
});

test('blheliSource get escs', async() => {
  const escs = await blheliSource.getEscs();
  expect(escs).not.toBe({});
});

test('blheliSource get platform', async() => {
  const platform = await blheliSource.getPlatform();
  expect(platform).toBe(0);
});

test('blheliSource get platform', async() => {
  const name = await blheliSource.getName();
  expect(name).toBe('Blheli');
});

test('blheliSource get platform', async() => {
  const pwm = await blheliSource.getPwm();
  expect(pwm.length).toBe(0);
});
