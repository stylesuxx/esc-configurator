import {
  buildSettingsFile,
  checkLoadedSettings,
  downloadSettingsFile,
  getDescriptions,
  getLoadPlans,
  getLoadedSettings,
  getMismatchedSettings,
  getPreviewLines,
  getSettingChanges,
  getSettingsFileName,
  isAllowed,
  isSameEsc,
  isSameValue,
  isSupportedEsc,
  parseSettingsFile,
} from '../SettingsFile';

const bluejay = (index, settings = {}) => ({
  index,
  firmwareName: 'Bluejay',
  layoutRevision: '208',
  displayName: 'J-H-40 - Bluejay, 0.21',
  meta: {
    signature: 0xE8B2,
    available: true,
  },
  uid: [1, 2, 3],
  bootloader: { version: 1 },
  settings: {
    NAME: 'Bluejay',
    LAYOUT: '#J_H_40#',
    LAYOUT_REVISION: 208,
    MAIN_REVISION: 0,
    SUB_REVISION: 21,
    MCU: '#BLHELI$EFM8B21#',
    BEEP_STRENGTH: 40,
    BRAKE_ON_STOP: 0,
    TEMPERATURE_PROTECTION: 7,
    STARTUP_POWER_MAX: 5,
    MOTOR_DIRECTION: 1,
    LED_CONTROL: 0,
    ...settings,
  },
});

const blheliS = (index, settings = {}) => ({
  index,
  firmwareName: 'BLHeli_S',
  layoutRevision: '33',
  settings: {
    NAME: '',
    LAYOUT: '#A_H_30#',
    LAYOUT_REVISION: 33,
    MAIN_REVISION: 16,
    SUB_REVISION: 7,
    PPM_MIN_THROTTLE: 37,
    MOTOR_DIRECTION: 1,
    ...settings,
  },
});

const fileWith = (escs, count = escs.length) => buildSettingsFile(escs, count, new Date('2026-11-22T10:00:00Z'));

describe('SettingsFile', () => {
  it('should save only the settings of BLHeli_S and Bluejay ESCs', () => {
    const am32 = {
      index: 2,
      firmwareName: 'AM32',
      layoutRevision: '2',
      settings: { NAME: 'AM32' },
    };
    const failed = bluejay(3, { NAME: '**FLASH*FAILED**' });
    const file = fileWith([bluejay(0), blheliS(1), am32, failed], 4);

    expect(file.format).toEqual('esc-configurator-settings');
    expect(file.version).toEqual(1);
    expect(file.date).toEqual('2026-11-22T10:00:00.000Z');
    expect(file.count).toEqual(4);
    expect(file.escs.map((esc) => esc.index)).toEqual([0, 1]);
    expect(file.escs[0].settings).toEqual(bluejay(0).settings);
  });

  it('should never save hardware identifiers', () => {
    const file = fileWith([bluejay(0)]);

    expect(Object.keys(file.escs[0]).sort()).toEqual(['firmwareName', 'index', 'layoutRevision', 'settings']);
    expect(JSON.stringify(file)).not.toMatch(/uid|signature|bootloader/i);
  });

  it('should tell supported ESCs apart', () => {
    expect(isSupportedEsc(bluejay(0))).toBeTruthy();
    expect(isSupportedEsc(blheliS(0))).toBeTruthy();
    expect(isSupportedEsc({
      ...bluejay(0),
      firmwareName: 'BLHeli_M',
    })).toBeFalsy();
    expect(isSupportedEsc(bluejay(0, { NAME: '**FLASH*FAILED**' }))).toBeFalsy();
    expect(isSupportedEsc({ firmwareName: 'Bluejay' })).toBeFalsy();
  });

  it('should name the file with date and time', () => {
    expect(getSettingsFileName(new Date(2026, 10, 2, 9, 5, 3))).toEqual('esc-settings_2026-11-02_09-05-03.json');
  });

  it('should download the file', () => {
    const createObjectURL = URL.createObjectURL;
    URL.createObjectURL = jest.fn(() => 'blob:settings');
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => null);

    expect(downloadSettingsFile(fileWith([bluejay(0)]), 'esc-settings.json')).toBeTruthy();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();

    click.mockRestore();
    URL.createObjectURL = createObjectURL;
  });

  it('should report a download the browser can not do', () => {
    const createObjectURL = URL.createObjectURL;
    URL.createObjectURL = undefined;
    const debug = jest.spyOn(console, 'debug').mockImplementation(() => null);

    expect(downloadSettingsFile(fileWith([bluejay(0)]), 'esc-settings.json')).toBeFalsy();

    debug.mockRestore();
    URL.createObjectURL = createObjectURL;
  });

  it('should parse its own files only', () => {
    const file = fileWith([bluejay(0), bluejay(1)]);
    const text = (changes) => JSON.stringify({
      ...file,
      ...changes,
    });
    const entry = (changes) => text({
      escs: [{
        ...file.escs[0],
        ...changes,
      }],
    });

    expect(parseSettingsFile(text({}))).toEqual(file);

    expect(() => parseSettingsFile('not json')).toThrow();
    expect(() => parseSettingsFile('[]')).toThrow();
    expect(() => parseSettingsFile(text({ format: 'other' }))).toThrow();
    expect(() => parseSettingsFile(text({ version: 2 }))).toThrow();
    expect(() => parseSettingsFile(text({ count: '2' }))).toThrow();
    expect(() => parseSettingsFile(text({ date: 1 }))).toThrow();
    expect(() => parseSettingsFile(text({ escs: {} }))).toThrow();
    expect(() => parseSettingsFile(text({ escs: [null] }))).toThrow();
    expect(() => parseSettingsFile(entry({ index: '0' }))).toThrow();
    expect(() => parseSettingsFile(entry({ index: -1 }))).toThrow();
    expect(() => parseSettingsFile(entry({ firmwareName: 1 }))).toThrow();
    expect(() => parseSettingsFile(entry({ layoutRevision: 208 }))).toThrow();
    expect(() => parseSettingsFile(entry({ settings: [] }))).toThrow();
    expect(() => parseSettingsFile(entry({ settings: null }))).toThrow();
  });

  it('should only match the same firmware, version and layout', () => {
    const saved = fileWith([bluejay(0)]).escs[0];

    expect(isSameEsc(bluejay(0), saved)).toBeTruthy();
    expect(isSameEsc(bluejay(0, { MAIN_REVISION: 1 }), saved)).toBeFalsy();
    expect(isSameEsc(bluejay(0, { SUB_REVISION: 20 }), saved)).toBeFalsy();
    expect(isSameEsc(bluejay(0, { LAYOUT: '#J_H_50#' }), saved)).toBeFalsy();
    expect(isSameEsc({
      ...bluejay(0),
      layoutRevision: '207',
    }, saved)).toBeFalsy();
    expect(isSameEsc({
      ...bluejay(0),
      firmwareName: 'BLHeli_S',
    }, saved)).toBeFalsy();
  });

  it('should describe common and individual settings with the overrides of the version', () => {
    const descriptions = getDescriptions(bluejay(0));
    expect(descriptions.BEEP_STRENGTH.type).toEqual('number');
    expect(descriptions.MOTOR_DIRECTION.type).toEqual('enum');

    const blheli = {
      firmwareName: 'BLHeli',
      layoutRevision: '21',
      settings: {
        MAIN_REVISION: 14,
        SUB_REVISION: 5,
      },
    };
    expect(getDescriptions(blheli).PWM_DITHER.options[0].label).toEqual('Off');

    expect(getDescriptions({
      ...blheli,
      firmwareName: 'Unknown',
    })).toEqual({});
  });

  it('should keep values within the bounds of the settings screen', () => {
    expect(isAllowed({ type: 'bool' }, 1)).toBeTruthy();
    expect(isAllowed({ type: 'bool' }, 2)).toBeFalsy();

    const options = [{ value: '1' }, { value: 7 }];
    expect(isAllowed({
      type: 'enum',
      options,
    }, 1)).toBeTruthy();
    expect(isAllowed({
      type: 'enum',
      options,
    }, '7')).toBeTruthy();
    expect(isAllowed({
      type: 'enum',
      options,
    }, 3)).toBeFalsy();

    const throttle = {
      type: 'number',
      min: 1000,
      max: 1500,
      offset: 1000,
      factor: 4,
    };
    expect(isAllowed(throttle, 0)).toBeTruthy();
    expect(isAllowed(throttle, 125)).toBeTruthy();
    expect(isAllowed(throttle, 126)).toBeFalsy();
    expect(isAllowed(throttle, -1)).toBeFalsy();
    expect(isAllowed(throttle, 1.5)).toBeFalsy();

    const power = {
      type: 'number',
      min: 1004,
      max: 1300,
      displayOffset: 1000,
      displayFactor: 4,
    };
    expect(isAllowed(power, 1)).toBeTruthy();
    expect(isAllowed(power, 75)).toBeTruthy();
    expect(isAllowed(power, 0)).toBeFalsy();
    expect(isAllowed(power, 76)).toBeFalsy();

    expect(isAllowed({ type: 'melody' }, [1])).toBeFalsy();
  });

  it('should compare values as the settings screen gives them', () => {
    expect(isSameValue('1', 1)).toBeTruthy();
    expect(isSameValue(2, 1)).toBeFalsy();
    expect(isSameValue([1, 2], [1, 2])).toBeTruthy();
    expect(isSameValue([1, 2], [1, 3])).toBeFalsy();
  });

  it('should load only described settings within bounds, never the direction nor the identity', () => {
    const saved = fileWith([bluejay(0, {
      BEEP_STRENGTH: 80,
      TEMPERATURE_PROTECTION: 99,
      STARTUP_POWER_MAX: 200,
      MOTOR_DIRECTION: 2,
      NAME: 'Other',
      STARTUP_MELODY: [1, 2, 3],
      UNKNOWN: 1,
    })]).escs[0];

    const {
      settings,
      rejected,
    } = getLoadedSettings(bluejay(0), saved);

    expect(settings.BEEP_STRENGTH).toEqual(80);
    expect(settings.BRAKE_ON_STOP).toEqual(0);
    expect(settings).not.toHaveProperty('MOTOR_DIRECTION');
    expect(settings).not.toHaveProperty('NAME');
    expect(settings).not.toHaveProperty('LAYOUT');
    expect(settings).not.toHaveProperty('MAIN_REVISION');
    expect(settings).not.toHaveProperty('STARTUP_MELODY');
    expect(settings).not.toHaveProperty('UNKNOWN');
    expect(settings).not.toHaveProperty('TEMPERATURE_PROTECTION');
    expect(rejected.sort()).toEqual(['STARTUP_MELODY', 'STARTUP_POWER_MAX', 'TEMPERATURE_PROTECTION']);
  });

  it('should load the melody wait, but no other dummy description', () => {
    const esc = {
      ...bluejay(0, {
        SUB_REVISION: 22,
        STARTUP_MELODY_WAIT_MS: 0,
      }),
      layoutRevision: '209',
    };
    const saved = {
      ...esc,
      settings: {
        ...esc.settings,
        STARTUP_MELODY_WAIT_MS: 100,
      },
    };

    const {
      settings,
      rejected,
    } = getLoadedSettings(esc, saved);
    expect(getDescriptions(esc).STARTUP_MELODY_WAIT_MS.type).toEqual('dummy');
    expect(settings.STARTUP_MELODY_WAIT_MS).toEqual(100);
    expect(rejected).toEqual([]);

    [0xFFFF, 0x10000].forEach((wait) => {
      expect(getLoadedSettings(esc, {
        ...saved,
        settings: {
          ...saved.settings,
          STARTUP_MELODY_WAIT_MS: wait,
        },
      }).rejected).toEqual(['STARTUP_MELODY_WAIT_MS']);
    });
  });

  it('should load a melody of the same length with bytes only', () => {
    const esc = bluejay(0, { STARTUP_MELODY: [0, 0, 0, 0] });
    const load = (melody) => getLoadedSettings(esc, {
      ...esc,
      settings: {
        ...esc.settings,
        STARTUP_MELODY: melody,
      },
    });

    expect(load([1, 2, 3, 255]).settings.STARTUP_MELODY).toEqual([1, 2, 3, 255]);
    expect(load([1, 2, 3]).rejected).toEqual(['STARTUP_MELODY']);
    expect(load([1, 2, 3, 256]).rejected).toEqual(['STARTUP_MELODY']);
    expect(load([1, 2, 3, 'a']).rejected).toEqual(['STARTUP_MELODY']);
    expect(load('1234').rejected).toEqual(['STARTUP_MELODY']);
  });

  it('should list a melody change with its type', () => {
    const esc = bluejay(0, { STARTUP_MELODY: [0, 0] });

    expect(getSettingChanges(esc, { STARTUP_MELODY: [1, 2] })).toEqual([{
      name: 'STARTUP_MELODY',
      type: 'melody',
      label: undefined,
      before: [0, 0],
      after: [1, 2],
    }]);
    expect(getSettingChanges(esc, { STARTUP_MELODY: [0, 0] })).toEqual([]);
  });

  it('should bound the individual BLHeli_S throttle with its factor and offset', () => {
    const saved = fileWith([blheliS(0, { PPM_MIN_THROTTLE: 200 })]).escs[0];
    expect(getLoadedSettings(blheliS(0), saved).rejected).toEqual(['PPM_MIN_THROTTLE']);

    const valid = fileWith([blheliS(0, { PPM_MIN_THROTTLE: 50 })]).escs[0];
    expect(getLoadedSettings(blheliS(0), valid).settings.PPM_MIN_THROTTLE).toEqual(50);
  });

  it('should list the changes with the labels of the settings screen', () => {
    const changes = getSettingChanges(bluejay(0), {
      BEEP_STRENGTH: 80,
      BRAKE_ON_STOP: 0,
      TEMPERATURE_PROTECTION: '1',
    });

    expect(changes).toEqual([{
      name: 'BEEP_STRENGTH',
      type: 'number',
      label: 'escBeepStrength',
      before: 40,
      after: 80,
    }, {
      name: 'TEMPERATURE_PROTECTION',
      type: 'enum',
      label: 'escTemperatureProtection',
      before: '140 C',
      after: '80 C',
    }]);
  });

  it('should list the settings read back differently', () => {
    expect(getMismatchedSettings({
      BEEP_STRENGTH: 80,
      TEMPERATURE_PROTECTION: '1',
    }, {
      BEEP_STRENGTH: 40,
      TEMPERATURE_PROTECTION: 1,
    })).toEqual(['BEEP_STRENGTH']);
  });
  it('should plan only the ESCs that match and log the others', () => {
    const individual = [
      bluejay(0),
      bluejay(1),
      {
        ...bluejay(2),
        firmwareName: 'AM32',
      },
      bluejay(3),
    ];
    const file = fileWith([
      bluejay(0, { BEEP_STRENGTH: 80 }),
      bluejay(1, {
        SUB_REVISION: 20,
        BEEP_STRENGTH: 80,
      }),
      bluejay(3, { STARTUP_POWER_MAX: 200 }),
    ], 4);

    const {
      messages,
      plans,
    } = getLoadPlans(individual, file);

    expect(plans.map((plan) => plan.esc.index)).toEqual([0]);
    expect(plans[0].settings.BEEP_STRENGTH).toEqual(80);
    expect(messages).toEqual([
      {
        key: 'settingsLoadSkippedVersion',
        params: { index: 2 },
      },
      {
        key: 'settingsLoadSkippedFirmware',
        params: { index: 3 },
      },
      {
        key: 'settingsLoadOutOfBounds',
        params: {
          index: 4,
          names: 'STARTUP_POWER_MAX',
        },
      },
    ]);
  });

  it('should log a saved ESC missing at its position', () => {
    const { messages } = getLoadPlans([bluejay(0), bluejay(1)], fileWith([bluejay(0)], 2));

    expect(messages).toEqual([{
      key: 'settingsLoadSkippedMissing',
      params: { index: 2 },
    }]);
  });

  it('should write one preview line per change', () => {
    const esc = bluejay(0, { STARTUP_MELODY: [0, 0] });
    const plans = [{
      esc,
      changes: getSettingChanges(esc, {
        BEEP_STRENGTH: 80,
        STARTUP_MELODY: [1, 2],
      }),
    }];
    const t = jest.fn((key, params) => `${key} ${JSON.stringify(params)}`);

    const lines = getPreviewLines(plans, t);

    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('settingsLoadPreviewLine');
    expect(lines[0]).toContain('"before":40');
    expect(lines[0]).toContain('"after":80');
    expect(lines[1]).toEqual('settingsLoadPreviewMelody {"index":1}');
  });

  it('should log each ESC as verified or with the settings read back differently', () => {
    const plans = [{
      esc: bluejay(0),
      settings: { BEEP_STRENGTH: 80 },
    }, {
      esc: bluejay(1),
      settings: { BEEP_STRENGTH: 90 },
    }];

    expect(checkLoadedSettings(plans, [
      bluejay(0, { BEEP_STRENGTH: 80 }),
      bluejay(1, { BEEP_STRENGTH: 40 }),
    ])).toEqual([
      {
        key: 'settingsLoadVerified',
        params: { index: 1 },
      },
      {
        key: 'settingsLoadMismatch',
        params: {
          index: 2,
          names: 'BEEP_STRENGTH',
        },
      },
    ]);
  });
});
