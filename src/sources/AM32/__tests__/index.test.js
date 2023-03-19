import { source } from '../';
const SETTINGS_DESCRIPTIONS = source.getSettingsDescriptions();

describe('AM32', () => {
  it('should handle conditional visibility', () => {
    const keys = Object.keys(SETTINGS_DESCRIPTIONS.COMMON);
    const settings = { VARIABLE_PWM_FREQUENCY: 0 };

    const visibleIf = [];
    for(let i = 0; i < keys.length; i += 1) {
      const revision = keys[i];
      const commonSettings = source.getCommonSettings(revision);
      const base = commonSettings.base;
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

    const name = source.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - AM32, 1.100, Bootloader v8 (PB2)');
  });

  it('should return a mcu type', () => {
    const flash = {
      settings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 100,
      },
      meta: {
        am32: {
          mcuType: 'F051',
          fileName: 'DIATONE_F051',
        },
      },
      bootloader: {
        valid: true,
        pin: 'PB2',
        version: 8,
      },
    };

    const name = source.buildDisplayName(flash, 'MAKE');
    expect(name).toEqual('MAKE - AM32, 1.100, Bootloader v8 (PB2), MCU: F051');
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

    const name = source.buildDisplayName(flash, 'MAKE');
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

    const name = source.buildDisplayName(flash, 'MAKE');
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

    const name = source.buildDisplayName(flash, 'NOT READY');
    expect(name).toEqual('NOT READY - AM32, FLASH FIRMWARE, Bootloader v8 (PB2)');
  });

  it('should return valid URL for version 1.94', () => {
    const firmwareConfig = {
      escKey: 'IFlight_50A',
      version: '1.94',
      url: 'https://github.com/AlkaMotors/AM32-MultiRotor-ESC-firmware/releases/download/v1.94/',
    };

    const url = source.getFirmwareUrl(firmwareConfig);
    expect(url).toEqual('https://github.com/AlkaMotors/AM32-MultiRotor-ESC-firmware/releases/download/v1.94/AM32_IFLIGHT_F051_1.94.hex');
  });
});
