import config from '../';

const SETTINGS = config.getSettings();

describe('BLHeli', () => {
  it('should handle conditional visibility with general settings', () => {
    const keys = Object.keys(SETTINGS.SETTINGS_DESCRIPTIONS);
    const settings = { GOVERNOR_MODE: 3 };

    const visibleIf = [];
    for(let i = 0; i < keys.length; i += 1) {
      const base = SETTINGS.SETTINGS_DESCRIPTIONS[keys[i]].base;
      for(let j = 0; j < base.length; j += 1) {
        const current = base[j];
        if(current.visibleIf) {
          visibleIf.push(current.visibleIf);
        }
      }

      for(let i = 0; i < visibleIf.length; i += 1) {
        expect(visibleIf[i](settings)).toBeTruthy();
      }
    }
  });

  it('should handle conditional visibility with custom settings', () => {
    const keys = Object.keys(SETTINGS.INDIVIDUAL_SETTINGS_DESCRIPTIONS);
    const settings = {
      GOVERNOR_MODE: 3,
      MOTOR_DIRECTION: 3,
    };

    const visibleIf = [];
    for(let i = 0; i < keys.length; i += 1) {
      const base = SETTINGS.INDIVIDUAL_SETTINGS_DESCRIPTIONS[keys[i]].base;
      for(let j = 0; j < base.length; j += 1) {
        const current = base[j];
        if(current.visibleIf) {
          visibleIf.push(current.visibleIf);
        }
      }

      for(let i = 0; i < visibleIf.length; i += 1) {
        expect(visibleIf[i](settings)).toBeTruthy();
      }
    }
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
