import {
  AM32_SETTINGS_DESCRIPTIONS,
} from '../eeprom';

test('visibleIf VARIABLE_PWM_FREQUENCY 0', () => {
  const keys = Object.keys(AM32_SETTINGS_DESCRIPTIONS);
  const settings = { VARIABLE_PWM_FREQUENCY: 0 };

  const visibleIf = [];
  for(let i = 0; i < keys.length; i += 1) {
    const base = AM32_SETTINGS_DESCRIPTIONS[i].base;
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
