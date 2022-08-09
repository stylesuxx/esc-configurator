import source from '../';

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

      expect(visibleIf.length).toEqual(0);
    }
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

  it('should show LED settings with supported layout', () => {
    const keys = Object.keys(SETTINGS_DESCRIPTIONS.INDIVIDUAL);
    const settings = {
      GOVERNOR_MODE: 3,
      MOTOR_DIRECTION: 3,
      LAYOUT: '#E-H-90#',
    };

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
      url: 'https://github.com/mathiasvr/bluejay/releases/download/test-melody-pwm/',
    };
    const url = source.getFirmwareUrl(params);

    expect(url).toEqual('https://github.com/mathiasvr/bluejay/releases/download/test-melody-pwm/S_H_50_test-melody-pwm.hex');
  });
});
