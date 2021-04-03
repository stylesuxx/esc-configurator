import {
  EEPROM,
  buildDisplayName,
} from '../';

test('visibleIf MOTOR_DIRECTION 3', () => {
  const keys = Object.keys(EEPROM.SETTINGS_DESCRIPTIONS);
  const settings = { MOTOR_DIRECTION: 3 };

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

test('individual visibleIf MOTOR_DIRECTION 3', () => {
  const keys = Object.keys(EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS);
  const settings = { MOTOR_DIRECTION: 3 };

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
      __PWM_FREQUENCY: 24,
      NAME: 'Bluejay',
    },
  };

  const name = buildDisplayName(flash, 'MAKE');
  expect(name).toEqual('MAKE - Bluejay, 1.100, 24kHz');
});

test('build display Name with missing revisions', () => {
  const flash = {
    settings: {
      __PWM_FREQUENCY: 24,
      NAME: 'Bluejay',
    },
  };

  const name = buildDisplayName(flash, 'MAKE');
  expect(name).toEqual('MAKE - Bluejay, Unsupported/Unrecognized, 24kHz');
});

test('build display Name without PWM', () => {
  const flash = {
    settings: {
      __PWM_FREQUENCY: 0xFF,
      NAME: 'Bluejay',
    },
  };

  const name = buildDisplayName(flash, 'MAKE');
  expect(name).toEqual('MAKE - Bluejay, Unsupported/Unrecognized');
});
