import {
  EEPROM,
  buildDisplayName,
} from '../';

test('visibleIf VARIABLE_PWM_FREQUENCY 0', () => {
  const keys = Object.keys(EEPROM.SETTINGS_DESCRIPTIONS);
  const settings = { VARIABLE_PWM_FREQUENCY: 0 };

  const visibleIf = [];
  for(let i = 0; i < keys.length; i += 1) {
    const base = EEPROM.SETTINGS_DESCRIPTIONS[i].base;
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
    bootloaderRevision: 23,
  };

  const name = buildDisplayName(flash, 'MAKE');
  expect(name).toEqual('MAKE - AM32, 1.100, Bootloader v23');
});

test('build display Name with missing revisions', () => {
  const flash = {
    settings: {},
    bootloaderRevision: 23,
  };

  const name = buildDisplayName(flash, 'MAKE');
  expect(name).toEqual('MAKE - AM32, Unsupported/Unrecognized, Bootloader v23');
});
