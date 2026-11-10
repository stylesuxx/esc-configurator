import { source } from '../';
const SETTINGS_DESCRIPTIONS = source.getSettingsDescriptions();

describe('AM32', () => {
  it('should handle conditional visibility', () => {
    const keys = Object.keys(SETTINGS_DESCRIPTIONS.COMMON);
    const settings = { VARIABLE_PWM_FREQUENCY: 0 };

    let truthy = 0;
    let falsy = 0;
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
        const result = visibleIf[i](settings);
        if (result) {
          truthy += 1;
        } else {
          falsy += 1;
        }
      }
    }

    expect(truthy).toEqual(6);
    expect(falsy).toEqual(6);
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

  it('should return valid URL for version 2.08', () => {
    const firmwareConfig = {
      escKey: 'IFlight_50A',
      version: '2.08',
      url: 'https://github.com/am32-firmware/AM32/releases/download/v2.08/',
      esc: { meta: {} },
    };

    const url = source.getFirmwareUrl(firmwareConfig);
    expect(url).toEqual('https://github.com/am32-firmware/AM32/releases/download/v2.08/AM32_IFLIGHT_F051_2.08.hex');
  });

  it('should return valid URL for version included in patterns', () => {
    const firmwareConfig = {
      escKey: 'IFlight_50A',
      version: 'v2.08',
      url: 'https://github.com/am32-firmware/AM32/releases/download/v2.08/',
      esc: { meta: {} },
    };

    const url = source.getFirmwareUrl(firmwareConfig);
    expect(url).toEqual('https://github.com/am32-firmware/AM32/releases/download/v2.08/AM32_IFLIGHT_F051_2.08.hex');
  });

  it('should return valid URL for version with name detected', () => {
    const firmwareConfig = {
      escKey: 'DOES_NOT_EXIST',
      version: 'v2.08',
      url: 'https://github.com/am32-firmware/AM32/releases/download/v2.08/',
      esc: { meta: { am32: { fileName: 'DETECTED_FILENAME' } } },
    };

    const url = source.getFirmwareUrl(firmwareConfig, 'DETECTED');
    expect(url).toEqual('https://github.com/am32-firmware/AM32/releases/download/v2.08/AM32_DETECTED_FILENAME_2.08.hex');
  });

  it('should return a list of valid names', () => {
    const names = source.getValidNames();
    expect(names.length).toEqual(30);
  });
});
