import Source from '../Source';
import { blheliSource } from '../index';

describe('Source', () => {
  it('should throw without parameters', () => {
    expect(() => new Source()).toThrow();
  });

  it('should throw with invalid URL', async() => {
    const invalidSource = new Source('invalid', 'invalid', 'invalid', 'invalid', 'invalid', 'invalid');

    await expect(() => invalidSource.getVersions()).rejects.toThrow();
    await expect(() => invalidSource.getEscs()).rejects.toThrow();
  });

  it('should return values from local storage with invalid URL', async() => {
    const invalidSource = new Source('invalid', 'invalid', 'invalid', 'invalid', 'invalid', 'invalid');

    localStorage.setItem('invalid_versions', '{}');
    localStorage.setItem('invalid_escs', '{}');

    let versions = await invalidSource.getVersions();
    expect(versions).toStrictEqual({});

    let escs = await invalidSource.getEscs();
    expect(escs).toStrictEqual({});
  });

  it('should return local escs', async() => {
    localStorage.setItem('BLHeli_escs', '{}');

    let escs = await blheliSource.getLocalEscs();
    expect(escs).toStrictEqual({});
  });

  it('should return BLHeli_S versions', async() => {
    let versions = await blheliSource.getVersions();
    expect(versions).not.toBe({});
  });

  it('should return escs', async() => {
    const escs = await blheliSource.getEscs();
    expect(escs).not.toBe({});
  });

  it('should return platform', async() => {
    const platform = await blheliSource.getPlatform();
    expect(platform).toBe(0);
  });

  it('should return name', async() => {
    const name = await blheliSource.getName();
    expect(name).toBe('BLHeli');
  });

  it('should return pwm', async() => {
    const pwm = await blheliSource.getPwm();
    expect(pwm.length).toBe(0);
  });
});
