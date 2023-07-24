import { source } from '../';

const SETTINGS_DESCRIPTIONS = source.getSettingsDescriptions();

describe('Bluejay', () => {
  it('should handle conditional visibility with general settings', () => {
    const keys = Object.keys(SETTINGS_DESCRIPTIONS.COMMON);

    const visibleIf = [];
    for(let i = 0; i < keys.length; i += 1) {
      const base = SETTINGS_DESCRIPTIONS.COMMON[keys[i]].base;
      for(let j = 0; j < base.length; j += 1) {
        const current = base[j];
        if(current.visibleIf) {
          visibleIf.push(current.visibleIf);
        }
      }
    }

    expect(visibleIf.length).toEqual(0);
  });

  it('should handle conditional visibility with custom settings', () => {
    const keys = Object.keys(SETTINGS_DESCRIPTIONS.INDIVIDUAL);
    const settings = { MOTOR_DIRECTION: 3 };

    let ledFunction = null;
    for(let i = 0; i < keys.length; i += 1) {
      const base = SETTINGS_DESCRIPTIONS.INDIVIDUAL[keys[i]].base;
      for(let j = 0; j < base.length; j += 1) {
        const current = base[j];
        if(current.visibleIf) {
          if(current.name === 'LED_CONTROL') {
            ledFunction = current.visibleIf;
          }
        }
      }
    }

    expect(ledFunction(settings)).not.toBeTruthy();
  });

  it('should handle conditional visibility for LED settings', () => {
    const key = 202;
    const settings = {
      MOTOR_DIRECTION: 3,
      LAYOUT: [0, 'E'],
    };

    let ledFunction = null;
    const base = SETTINGS_DESCRIPTIONS.INDIVIDUAL[key].base;
    for(let j = 0; j < base.length; j += 1) {
      const current = base[j];
      if(current.visibleIf) {
        if(current.name === 'LED_CONTROL') {
          ledFunction = current.visibleIf;
        }
      }
    }

    expect(ledFunction(settings)).toBeTruthy();
  });

  it('should return display name', () => {
    const flash = {
      settings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 100,
        PWM_FREQUENCY: 24,
        NAME: 'Bluejay',
      },
    };

    const name = source.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - Bluejay, 1.100, 24kHz');
  });

  it('should return display Name with missing revisions', () => {
    const flash = {
      settings: {
        PWM_FREQUENCY: 24,
        NAME: 'Bluejay',
      },
    };

    const name = source.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - Bluejay, Unsupported/Unrecognized, 24kHz');
  });

  it('should return display name without PWM', () => {
    const flash = {
      settings: {
        PWM_FREQUENCY: 0xFF,
        NAME: 'Bluejay',
      },
    };

    const name = source.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - Bluejay, Unsupported/Unrecognized');
  });

  it('should return a firmware URL for PWM less files', () => {
    const params = {
      escKey: '#S_H_50#',
      version: 'test-melody-pwm',
      url: 'https://github.com/bird-sanctuary/bluejay/releases/download/test-melody-pwm/',
    };
    const url = source.getFirmwareUrl(params);

    expect(url).toEqual('https://github.com/bird-sanctuary/bluejay/releases/download/test-melody-pwm/S_H_50_test-melody-pwm.hex');
  });

  it('should recognice invalid names', async() => {
    let valid = await source.isValidName("Blheli_S");
    expect(valid).not.toBeTruthy();

    valid = await source.isValidName("JESC");
    expect(valid).not.toBeTruthy();
  });

  it('should recognice valid names', async() => {
    let valid = await source.isValidName("Bluejay");
    expect(valid).toBeTruthy();

    valid = await source.isValidName("Bluejay (BETA)");
    expect(valid).toBeTruthy();

    valid = await source.isValidName("Bluejay (TEST)");
    expect(valid).toBeTruthy();

    valid = await source.isValidName("Bluejay (RC-1)");
    expect(valid).toBeTruthy();

    valid = await source.isValidName("Bluejay (RC-199)");
    expect(valid).toBeTruthy();
  });

  it('should recognice invalid migration options', async() => {
    let valid = await source.canMigrateTo("Blheli_S");
    expect(valid).not.toBeTruthy();

    valid = await source.canMigrateTo("JESC");
    expect(valid).not.toBeTruthy();
  });

  it('should recognice valid migration options', async() => {
    let valid = await source.canMigrateTo("Bluejay");
    expect(valid).toBeTruthy();

    valid = await source.canMigrateTo("Bluejay (BETA)");
    expect(valid).toBeTruthy();

    valid = await source.canMigrateTo("Bluejay (TEST)");
    expect(valid).toBeTruthy();

    valid = await source.canMigrateTo("Bluejay (RC-1)");
    expect(valid).toBeTruthy();

    valid = await source.canMigrateTo("Bluejay (RC-199)");
    expect(valid).toBeTruthy();
  });

  it('should return display name with dynamic PWM', () => {
    const flash = {
      settings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 100,
        PWM_FREQUENCY: 192,
        NAME: 'Bluejay',
      },
    };

    const name = source.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - Bluejay, 1.100, Dynamic PWM');
  });

  it('should return a list of PWM for versions < v0.21.0', () => {
    const frequencies = source.getPwm('v0.10.0');
    expect(frequencies.length).toEqual(3);
  });

  it('should return an empty list for versions >= v0.21.0', () => {
    const frequencies = source.getPwm('v0.21.0');
    expect(frequencies.length).toEqual(0);
  });

  /*
  it('should enable low PWM threshold setting', () => {
    const settings = {
      GOVERNOR_MODE: 3,
      MOTOR_DIRECTION: 3,
      PWM_FREQUENCY: 192,
    };

    let conditionalFunction = null;

    const revision = 208;
    const commonSettings = source.getCommonSettings(revision);
    const base = commonSettings.base;
    for(let j = 0; j < base.length; j += 1) {
      const current = base[j];
      if(current.visibleIf) {
        if(current.name === 'PWM_THRESHOLD_LOW') {
          conditionalFunction = current.visibleIf;
        }
      }
    }

    expect(conditionalFunction(settings)).toBeTruthy();
  });

  it('should enable high PWM threshold setting', () => {
    const settings = {
      GOVERNOR_MODE: 3,
      MOTOR_DIRECTION: 3,
      PWM_FREQUENCY: 192,
    };

    let conditionalFunction = null;

    const revision = 208;
    const commonSettings = source.getCommonSettings(revision);
    const base = commonSettings.base;
    for(let j = 0; j < base.length; j += 1) {
      const current = base[j];
      if(current.visibleIf) {
        if(current.name === 'PWM_THRESHOLD_HIGH') {
          conditionalFunction = current.visibleIf;
        }
      }
    }

    expect(conditionalFunction(settings)).toBeTruthy();
  });

  it('should sanitize low PWM threshold setting if too high', () => {
    const settings = {
      GOVERNOR_MODE: 3,
      MOTOR_DIRECTION: 3,
      PWM_FREQUENCY: 192,
      PWM_THRESHOLD_HIGH: 128,
    };

    let sanitizeFunction = null;

    const revision = 208;
    const commonSettings = source.getCommonSettings(revision);
    const base = commonSettings.base;
    for(let j = 0; j < base.length; j += 1) {
      const current = base[j];
      if(current.visibleIf) {
        if(current.name === 'PWM_THRESHOLD_LOW') {
          sanitizeFunction = current.sanitize;
        }
      }
    }

    expect(sanitizeFunction(255, settings)).toEqual(128);
  });

  it('should not sanitize low PWM threshold setting if lower', () => {
    const settings = {
      GOVERNOR_MODE: 3,
      MOTOR_DIRECTION: 3,
      PWM_FREQUENCY: 192,
      PWM_THRESHOLD_HIGH: 128,
    };

    const lowValue = 96;

    let sanitizeFunction = null;

    const revision = 208;
    const commonSettings = source.getCommonSettings(revision);
    const base = commonSettings.base;
    for(let j = 0; j < base.length; j += 1) {
      const current = base[j];
      if(current.visibleIf) {
        if(current.name === 'PWM_THRESHOLD_LOW') {
          sanitizeFunction = current.sanitize;
        }
      }
    }

    expect(sanitizeFunction(lowValue, settings)).toEqual(lowValue);
  });
  */
});
