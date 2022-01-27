import Source from '../Source';
import GithubSource from '../GithubSource';

import {
  blheliSource,
  blheliSilabsSource,
  blheliSSource,
} from '../index';

const mockJsonResponse = (content) =>
  new window.Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Time-Cached': Date.now().toString(),
    },
  });

describe('Invalid Source', () => {
  it('should throw without parameters', () => {
    expect(() => new Source()).toThrow();
  });

  it('should throw with invalid Source', async() => {
    const invalidSource = new Source('invalid', 'invalid', 'invalid');

    await expect(() => invalidSource.getRemoteVersionsList()).rejects.toThrow();
    expect(() => invalidSource.buildDisplayName()).toThrow();
    expect(() => invalidSource.getVersions()).toThrow();
  });

  it('should return response from cache with invalid versions URL', async() => {
    global.caches = {
      open: jest.fn().mockImplementationOnce(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse('{}'))) });
        })
      ),
    };

    const invalidSource = new Source('invalid', 'invalid', 'invalid');

    const versions = await invalidSource.getRemoteVersionsList();

    expect(versions).toStrictEqual({});
  });

  it('should return response from cache with invalid github URL', async() => {
    global.caches = {
      open: jest.fn().mockImplementationOnce(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse('[]'))) });
        })
      ),
    };

    const invalidGithubSource = new GithubSource('invalid', 'invalid', 'invalid');

    const versions = await invalidGithubSource.getRemoteVersionsList();

    expect(versions).toStrictEqual([]);
  });
});

describe('BLHeli Source', () => {
  it('should return BLHeli versions', async() => {
    let versions = await blheliSource.getVersions();
    expect(versions).not.toBe({});
  });

  it('should return BLHeli ESCs', async() => {
    const escs = await blheliSource.getEscLayouts();
    expect(escs).not.toBe({});
  });

  it('should return BLHeli MCU signatures', async() => {
    const escs = await blheliSource.getMcus();
    expect(escs).not.toBe({});
  });

  it('should return BLHeli name', async() => {
    const name = await blheliSource.getName();
    expect(name).toBe('BLHeli');
  });

  it('should return BLHeli pwm', async() => {
    const pwm = await blheliSource.getPwm();
    expect(pwm.length).toBe(0);
  });

  it('should return a valid URL', async() => {
    const url = await blheliSource.getFirmwareUrl({
      escKey: '#AFRO_12A#',
      mode: 23,
      url: 'https://example.com/{0}/{1}',
    });

    expect(url).toEqual('https://example.com/AFRO_12A/23');
  });
});

describe('BLHeliSilabs Source', () => {
  it('should return BLHeli_S versions', async() => {
    let versions = await blheliSilabsSource.getVersions();
    expect(versions).not.toBe({});
  });

  it('should return BLHeli_S ESCs', async() => {
    const escs = await blheliSilabsSource.getEscLayouts();
    expect(escs).not.toBe({});
  });

  it('should return BLHeli_S MCU signatures', async() => {
    const escs = await blheliSilabsSource.getMcus();
    expect(escs).not.toBe({});
  });

  it('should return BLHeli_S name', async() => {
    const name = await blheliSilabsSource.getName();
    expect(name).toBe('BLHeli');
  });

  it('should return BLHeli_S pwm', async() => {
    const pwm = await blheliSilabsSource.getPwm();
    expect(pwm.length).toBe(0);
  });
});

describe('BLHeli_S Source', () => {
  it('should return BLHeli_S versions', async() => {
    let versions = await blheliSSource.getVersions();
    expect(versions).not.toBe({});
  });

  it('should return BLHeli_S ESCs', async() => {
    const escs = await blheliSSource.getEscLayouts();
    expect(escs).not.toBe({});
  });

  it('should return BLHeli_S MCU signatures', async() => {
    const escs = await blheliSSource.getMcus();
    expect(escs).not.toBe({});
  });

  it('should return BLHeli_S name', async() => {
    const name = await blheliSSource.getName();
    expect(name).toBe('BLHeli_S');
  });

  it('should return BLHeli_S pwm', async() => {
    const pwm = await blheliSSource.getPwm();
    expect(pwm.length).toBe(0);
  });
});
