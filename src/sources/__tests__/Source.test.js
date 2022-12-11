import Source from '../Source';
import GithubSource from '../GithubSource';

import {
  blheliAtmelSource as blheliSource,
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
    const invalidSource = new Source('invalid', 'invalid', 'invalid', 'invalid');

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

    const invalidSource = new Source('invalid', 'invalid', 'invalid', 'invalid');

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

    const invalidGithubSource = new GithubSource('invalid', 'invalid', 'invalid', 'invalid');

    const versions = await invalidGithubSource.getRemoteVersionsList();
    console.log(versions);

    expect(versions).toStrictEqual([]);
  });
});

describe('BLHeli Source', () => {
  it('should return versions', async() => {
    let versions = await blheliSource.getVersions();
    expect(versions).not.toBe({});
  });

  it('should return ESC layouts', async() => {
    const escs = await blheliSource.getEscLayouts();
    expect(escs).not.toBe({});
  });

  it('should return MCU signatures', async() => {
    const escs = await blheliSource.getMcus();
    expect(escs).not.toBe({});
  });

  it('should return names', async() => {
    const name = await blheliSource.getName();
    expect(name).toBe('BLHeli');
  });

  it('should not return pwm options', async() => {
    const pwm = await blheliSource.getPwm();
    expect(pwm.length).toBe(0);
  });

  it('should return valid revisions', async() => {
    const revisions = await blheliSSource.getRevisions();
    expect(revisions.length).not.toBe(0);
  });

  it('should return common settings', async() => {
    const revisions = await blheliSSource.getRevisions();
    const settings = await blheliSSource.getCommonSettings(revisions[0]);
    expect(settings.length).not.toBe(0);
  });

  it('should return individual settings', async() => {
    const revisions = await blheliSSource.getRevisions();
    const settings = await blheliSSource.getIndividualSettings(revisions[0]);
    expect(settings.length).not.toBe(0);
  });

  it('should return default settings', async() => {
    const revisions = await blheliSSource.getRevisions();
    const settings = await blheliSSource.getDefaultSettings(revisions[0]);
    expect(settings.length).not.toBe(0);
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
  it('should return versions', async() => {
    let versions = await blheliSilabsSource.getVersions();
    expect(versions).not.toBe({});
  });

  it('should return ESC layouts', async() => {
    const escs = await blheliSilabsSource.getEscLayouts();
    expect(escs).not.toBe({});
  });

  it('should return MCU signatures', async() => {
    const escs = await blheliSilabsSource.getMcus();
    expect(escs).not.toBe({});
  });

  it('should return names', async() => {
    const name = await blheliSilabsSource.getName();
    expect(name).toBe('BLHeli');
  });

  it('should not return pwm options', async() => {
    const pwm = await blheliSilabsSource.getPwm();
    expect(pwm.length).toBe(0);
  });

  it('should return valid revisions', async() => {
    const revisions = await blheliSSource.getRevisions();
    expect(revisions.length).not.toBe(0);
  });

  it('should return common settings', async() => {
    const revisions = await blheliSSource.getRevisions();
    const settings = await blheliSSource.getCommonSettings(revisions[0]);
    expect(settings.length).not.toBe(0);
  });

  it('should return individual settings', async() => {
    const revisions = await blheliSSource.getRevisions();
    const settings = await blheliSSource.getIndividualSettings(revisions[0]);
    expect(settings.length).not.toBe(0);
  });

  it('should return default settings', async() => {
    const revisions = await blheliSSource.getRevisions();
    const settings = await blheliSSource.getDefaultSettings(revisions[0]);
    expect(settings.length).not.toBe(0);
  });

  it('should recognice invalid names', async() => {
    let valid = await blheliSSource.isValidName("Bluejay");
    expect(valid).not.toBeTruthy();

    valid = await blheliSSource.isValidName("JESC");
    expect(valid).not.toBeTruthy();
  });

  it('should recognice valid names', async() => {
    const valid = await blheliSSource.isValidName("");
    expect(valid).toBeTruthy();
  });

  it('should recognice valid migration options', async() => {
    let valid = await blheliSSource.canMigrateTo("Bluejay");
    expect(valid).not.toBeTruthy();

    valid = await blheliSSource.canMigrateTo("JESC");
    expect(valid).not.toBeTruthy();
  });
});

describe('BLHeli_S Source', () => {
  it('should return versions', async() => {
    let versions = await blheliSSource.getVersions();
    expect(versions).not.toBe({});
  });

  it('should return ESC layouts', async() => {
    const escs = await blheliSSource.getEscLayouts();
    expect(escs).not.toBe({});
  });

  it('should return MCU signatures', async() => {
    const escs = await blheliSSource.getMcus();
    expect(escs).not.toBe({});
  });

  it('should return names', async() => {
    const name = await blheliSSource.getName();
    expect(name).toBe('BLHeli_S');
  });

  it('should return pwm options', async() => {
    const pwm = await blheliSSource.getPwm();
    expect(pwm.length).toBe(0);
  });

  it('should return valid revisions', async() => {
    const revisions = await blheliSSource.getRevisions();
    expect(revisions.length).not.toBe(0);
  });

  it('should return common settings', async() => {
    const revisions = await blheliSSource.getRevisions();
    const settings = await blheliSSource.getCommonSettings(revisions[0]);
    expect(settings.length).not.toBe(0);
  });

  it('should return individual settings', async() => {
    const revisions = await blheliSSource.getRevisions();
    const settings = await blheliSSource.getIndividualSettings(revisions[0]);
    expect(settings.length).not.toBe(0);
  });

  it('should return default settings', async() => {
    const revisions = await blheliSSource.getRevisions();
    const settings = await blheliSSource.getDefaultSettings(revisions[0]);
    expect(settings.length).not.toBe(0);
  });

  it('should return valid names', async() => {
    let names = await blheliSSource.getValidNames();
    expect(names.length).not.toBe(0);
  });

  it('should recognice invalid names', async() => {
    let valid = await blheliSSource.isValidName("Bluejay");
    expect(valid).not.toBeTruthy();

    valid = await blheliSSource.isValidName("JESC");
    expect(valid).not.toBeTruthy();
  });

  it('should recognice valid names', async() => {
    const valid = await blheliSSource.isValidName("");
    expect(valid).toBeTruthy();
  });

  it('should recognice valid migration options', async() => {
    let valid = await blheliSSource.canMigrateTo("Bluejay");
    expect(valid).not.toBeTruthy();

    valid = await blheliSSource.canMigrateTo("JESC");
    expect(valid).not.toBeTruthy();
  });

  it('should return layout size', async() => {
    const layoutSize = await blheliSSource.getLayoutSize();
    expect(layoutSize).toBe(112);
  });

  it('should return layout', async() => {
    const layout = await blheliSSource.getLayout();
    expect(layout && typeof layout === "object").toBeTruthy();
  });
});
