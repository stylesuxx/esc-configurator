import config from '../';

const SETTINGS = config.getSettings();

describe('AM32', () => {
  it('should handle conditional visibility', () => {
    const keys = Object.keys(SETTINGS.COMMON);
    const settings = { VARIABLE_PWM_FREQUENCY: 0 };

    const visibleIf = [];
    for(let i = 0; i < keys.length; i += 1) {
      const base = SETTINGS.COMMON[i].base;
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
      bootloader: {
        valid: true,
        pin: 'PB2',
        version: 8,
      },
    };

    const name = config.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - AM32, 1.100, Bootloader v8 (PB2)');
  });

  it('should return display name when revision is missing', () => {
    const flash = {
      settings: {},
      bootloader: {
        valid: true,
        pin: 'PB2',
        version: 8,
      },
    };

    const name = config.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - AM32, Unsupported/Unrecognized, Bootloader v8 (PB2)');
  });

  it('should return display name with invalid bootloader', () => {
    const flash = {
      settings: {},
      bootloader: {
        valid: false,
        pin: 'PB2',
        version: 8,
      },
    };

    const name = config.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - AM32, Unsupported/Unrecognized, Bootloader unknown');
  });

  it('should return display name when no firmware is flashed', () => {
    const flash = {
      settings: {},
      bootloader: {
        valid: true,
        pin: 'PB2',
        version: 8,
      },
    };

    const name = config.buildDisplayName(flash, 'NOT READY');
    expect(name).toEqual('NOT READY - AM32, FLASH FIRMWARE, Bootloader v8 (PB2)');
  });
});
