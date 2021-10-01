import Source from '../Source';
import { blheliSSource } from '../index';

describe('Source', () => {
  it('should throw without parameters', () => {
    expect(() => new Source()).toThrow();
  });

  it('should throw with invalid URL', async() => {
    const invalidSource = new Source('invalid', 'invalid', 'invalid', 'invalid', 'invalid', 'invalid');

    await expect(() => invalidSource.getVersionsList()).rejects.toThrow();
    await expect(() => invalidSource.getEscs()).rejects.toThrow();
  });

  it('should return values from local storage with invalid URL', async() => {
    const invalidSource = new Source('invalid', 'invalid', 'invalid', 'invalid', 'invalid', 'invalid');

    localStorage.setItem('invalid_versions', '{}');
    localStorage.setItem('invalid_escs', '{}');

    let versions = await invalidSource.getVersionsList();
    expect(versions).toStrictEqual({});

    let escs = await invalidSource.getEscs();
    expect(escs).toStrictEqual({});
  });

  it('should return local escs', async() => {
    localStorage.setItem('BLHeli_S_escs', '{}');

    let escs = await blheliSSource.getLocalEscs();
    expect(escs).toStrictEqual({});
  });

  it('should return BLHeli_S versions', async() => {
    let versions = await blheliSSource.getVersions();
    expect(versions).not.toBe({});
  });

  it('should return escs', async() => {
    const escs = await blheliSSource.getEscs();
    expect(escs).not.toBe({});
  });

  it('should return name', async() => {
    const name = await blheliSSource.getName();
    expect(name).toBe('BLHeli_S');
  });

  it('should return pwm', async() => {
    const pwm = await blheliSSource.getPwm();
    expect(pwm.length).toBe(0);
  });
});
