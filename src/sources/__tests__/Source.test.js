import Source from '../Source';
import { blheliSource } from '../index';

describe('Source', () => {
  it('should throw without parameters', () => {
    expect(() => new Source()).toThrow();
  });

  it('should return local veriions with invalid URL', async() => {
    const invalidSource = new Source('invalid', 'invalid', 'invalid', 'invalid', 'invalid', 'localVersions', 'localESCs', 'invalid');

    const versions = await invalidSource.getVersions();
    expect(versions).toBe('localVersions');

    const escs = await invalidSource.getEscs();
    expect(escs).toBe('localESCs');
  });

  it('should return local versions with invalid URL', async() => {
    jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    const invalidSource = new Source('invalid', 'invalid', 'https://google.com', 'invalid', 'invalid', 'localVersions', 'localESCs', 'invalid');

    const versions = await invalidSource.getVersions();
    expect(versions).toBe('localVersions');
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
