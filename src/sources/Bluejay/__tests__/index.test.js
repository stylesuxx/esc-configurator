import config from '../';

const eeprom = config.getEeprom();

describe('Bluejay', () => {
  it('should handle conditional visibility with general settings', () => {
    const keys = Object.keys(eeprom.SETTINGS_DESCRIPTIONS);
    const settings = { MOTOR_DIRECTION: 3 };

    const visibleIf = [];
    for(let i = 0; i < keys.length; i += 1) {
      const base = eeprom.SETTINGS_DESCRIPTIONS[keys[i]].MULTI.base;
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
    const keys = Object.keys(eeprom.INDIVIDUAL_SETTINGS_DESCRIPTIONS);
    const settings = { MOTOR_DIRECTION: 3 };

    const visibleIf = [];
    for(let i = 0; i < keys.length; i += 1) {
      const base = eeprom.INDIVIDUAL_SETTINGS_DESCRIPTIONS[keys[i]].base;
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
        __PWM_FREQUENCY: 24,
        NAME: 'Bluejay',
      },
    };

    const name = config.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - Bluejay, 1.100, 24kHz');
  });

  it('should return display Name with missing revisions', () => {
    const flash = {
      settings: {
        __PWM_FREQUENCY: 24,
        NAME: 'Bluejay',
      },
    };

    const name = config.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - Bluejay, Unsupported/Unrecognized, 24kHz');
  });

  it('should return display name without PWM', () => {
    const flash = {
      settings: {
        __PWM_FREQUENCY: 0xFF,
        NAME: 'Bluejay',
      },
    };

    const name = config.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - Bluejay, Unsupported/Unrecognized');
  });
});
