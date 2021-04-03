import Source from '../Source';
import { blheliSource } from '../index';

test('Source without parameters', () => {
  expect(() => new Source()).toThrow();
});

test('Source with invalid URL', async() => {
  const invalidSource = new Source('invalid', 'invalid', 'invalid', 'invalid', 'invalid', 'localVersions', 'localESCs', 'invalid');

  const versions = await invalidSource.getVersions();
  expect(versions).toBe('localVersions');

  const escs = await invalidSource.getEscs();
  expect(escs).toBe('localESCs');
});

test('offline', async() => {
  jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
  const invalidSource = new Source('invalid', 'invalid', 'https://google.com', 'invalid', 'invalid', 'localVersions', 'localESCs', 'invalid');

  const versions = await invalidSource.getVersions();
  expect(versions).toBe('localVersions');
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

test('blheliSource get name', async() => {
  const name = await blheliSource.getName();
  expect(name).toBe('Blheli');
});

test('blheliSource get pwm', async() => {
  const pwm = await blheliSource.getPwm();
  expect(pwm.length).toBe(0);
});
