import config from '../';

const SETTINGS_DESCRIPTIONS = config.getSettingsDescriptions();

describe('BLHeli', () => {
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
    const settings = {
      GOVERNOR_MODE: 3,
      MOTOR_DIRECTION: 3,
    };

    let ppmFunction = null;
    let ledFunction = null;
    for(let i = 0; i < keys.length; i += 1) {
      const base = SETTINGS_DESCRIPTIONS.INDIVIDUAL[keys[i]].base;
      for(let j = 0; j < base.length; j += 1) {
        const current = base[j];
        if(current.visibleIf) {
          if(current.name === 'PPM_CENTER_THROTTLE') {
            ppmFunction = current.visibleIf;
          }

          if(current.name === 'LED_CONTROL') {
            ledFunction = current.visibleIf;
          }
        }
      }
    }

    expect(ppmFunction(settings)).toBeTruthy();
    expect(ledFunction(settings)).not.toBeTruthy();
  });

  it('should return display name', () => {
    const flash = {
      settings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 100,
      },
    };

    const name = config.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - BLHeli_S, 1.100');
  });

  it('should return mistagged display name', () => {
    const wrongTag = 'wrong tag';
    const flash = {
      settings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 100,
      },
      actualMake: wrongTag,
    };

    const name = config.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual(`MAKE (Probably mistagged: ${wrongTag}) - BLHeli_S, 1.100`);
  });

  it('should return display name when revision is missing', () => {
    const flash = { settings: {} };

    const name = config.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - BLHeli_S, Unsupported/Unrecognized');
  });
});
