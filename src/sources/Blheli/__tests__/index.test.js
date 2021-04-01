import {
  EEPROM,
  buildDisplayName
} from '../';

test('general settings visibleIf GOVERNOR_MODE 3', () => {
  const keys = Object.keys(EEPROM.SETTINGS_DESCRIPTIONS);
  const settings = { GOVERNOR_MODE: 3 };

  const visibleIf = [];
  for(let i = 0; i < keys.length; i += 1) {
    const base = EEPROM.SETTINGS_DESCRIPTIONS[keys[i]].MULTI.base;
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

test('individual settings visibleIf GOVERNOR_MODE 3, MOTOR_DIRECTION 3', () => {
  const keys = Object.keys(EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS);
  const settings = {
    GOVERNOR_MODE: 3,
    MOTOR_DIRECTION: 3,
  };

  const visibleIf = [];
  for(let i = 0; i < keys.length; i += 1) {
    const base = EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS[keys[i]].base;
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

test('build display Name', () => {
  const flash = {
    settings: {
      MAIN_REVISION: 1,
      SUB_REVISION: 100,
    },
  };

  const name = buildDisplayName(flash, 'MAKE');
  expect(name).toEqual('MAKE - BlHeli_S, 1.100');
});

test('build display Name with missing revisions', () => {
  const flash = { settings: {} };

  const name = buildDisplayName(flash, 'MAKE');
  expect(name).toEqual('MAKE - BlHeli_S, Unsupported/Unrecognized');
});
