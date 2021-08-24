const EEPROM_OFFSET = 0x1A00;
const PAGE_SIZE = 0x0200;
const LAYOUT_SIZE = 0xF0;
const TYPES = { EFM8: 'EFM8' };
const NAMES = ['Bluejay', 'Bluejay (BETA)', 'Bluejay (TEST)'];

const SETTINGS_DESCRIPTIONS = {};

// V0.9
SETTINGS_DESCRIPTIONS['200'] = {
  MULTI: {
    base: [{
      name: 'RPM_POWER_SLOPE',
      type: 'enum',
      options: [{
        value: '1',
        label: '0.5% (0.031)',
      }, {
        value: '7',
        label: '5%  (0.25)',
      }, {
        value: '8',
        label: '7%  (0.38)',
      }, {
        value: '9',
        label: '10%  (0.50)',
      }, {
        value: '10',
        label: '15%  (0.75)',
      }, {
        value: '11',
        label: '20%  (1.00)',
      }, {
        value: '12',
        label: '24%  (1.25)',
      }, {
        value: '13',
        label: '29%  (1.50)',
      }],
      label: 'Rampup Start Power',
    }, {
      name: 'STARTUP_POWER_MIN',
      type: 'number',
      label: 'escMinStartupPower',
      min: 1000,
      max: 1125,
      step: 5,
      displayFactor: 1000 / 2047,
      displayOffset: 1000,
      displayPrecision: 0,
    }, {
      name: 'TEMPERATURE_PROTECTION',
      type: 'enum',
      label: 'escTemperatureProtection',
      options: [{
        value: '0',
        label: 'Disabled',
      }, {
        value: '1',
        label: '80 C',
      }, {
        value: '2',
        label: '90 C',
      }, {
        value: '3',
        label: '100 C',
      }, {
        value: '4',
        label: '110 C',
      }, {
        value: '5',
        label: '120 C',
      }, {
        value: '6',
        label: '130 C',
      }, {
        value: '7',
        label: '140 C',
      }],
    }, {
      name: '_LOW_RPM_POWER_PROTECTION',
      type: 'bool',
      label: 'escLowRPMPowerProtection',
    }, {
      name: 'BRAKE_ON_STOP',
      type: 'bool',
      label: 'escBrakeOnStop',
    }, {
      name: 'DEMAG_COMPENSATION',
      type: 'enum',
      label: 'escDemagCompensation',
      options: [{
        value: '1',
        label: 'Off',
      }, {
        value: '2',
        label: 'Low',
      }, {
        value: '3',
        label: 'High',
      }],
    }, {
      name: 'COMMUTATION_TIMING',
      type: 'enum',
      label: 'escMotorTiming',
      options: [{
        value: '1',
        label: '0° (Low)',
      }, {
        value: '2',
        label: '7.5° (MediumLow)',
      }, {
        value: '3',
        label: '15° (Medium)',
      }, {
        value: '4',
        label: '22.5° (MediumHigh)',
      }, {
        value: '5',
        label: '30° (High)',
      }],
    }, {
      name: 'BEEP_STRENGTH',
      type: 'number',
      min: 0,
      max: 255,
      step: 1,
      label: 'escBeepStrength',
    }, {
      name: 'BEACON_STRENGTH',
      type: 'number',
      min: 0,
      max: 255,
      step: 1,
      label: 'escBeaconStrength',
    }, {
      name: 'BEACON_DELAY',
      type: 'enum',
      label: 'escBeaconDelay',
      options: [{
        value: '1',
        label: '1 minute',
      }, {
        value: '2',
        label: '2 minutes',
      }, {
        value: '3',
        label: '5 minutes',
      }, {
        value: '4',
        label: '10 minutes',
      }, {
        value: '5',
        label: 'Infinite',
      }],
    }, {
      name: 'STARTUP_BEEP',
      type: 'bool',
      label: 'escStartupBeep',
    }, {
      name: 'DITHERING',
      type: 'bool',
      label: 'escDithering',
    }],
  },
};


// V0.10
SETTINGS_DESCRIPTIONS['201'] = {
  MULTI: {
    base: [{
      name: 'STARTUP_POWER_MIN',
      inherit: SETTINGS_DESCRIPTIONS['200'],
    }, {
      name: 'STARTUP_POWER_MAX',
      type: 'number',
      label: 'escMaxStartupPower',
      // Note: The real displayFactor is 1000 / 255 but 250 makes the slider nicer to work with minimal loss of accuracy
      min: 1004,
      max: 1300,
      step: 4,
      displayFactor: 1000 / 250,
      displayOffset: 1000,
      displayPrecision: 0,
    }, {
      name: 'TEMPERATURE_PROTECTION',
      inherit: SETTINGS_DESCRIPTIONS['200'],
    }, {
      name: 'COMMUTATION_TIMING',
      inherit: SETTINGS_DESCRIPTIONS['200'],
    }, {
      name: 'DEMAG_COMPENSATION',
      inherit: SETTINGS_DESCRIPTIONS['200'],
    }, {
      name: 'RPM_POWER_SLOPE',
      type: 'enum',
      options: [{
        value: '1',
        label: '1x (More protection)',
      }, {
        value: '2',
        label: '2x',
      }, {
        value: '3',
        label: '3x',
      }, {
        value: '4',
        label: '4x',
      }, {
        value: '5',
        label: '5x',
      }, {
        value: '6',
        label: '6x',
      }, {
        value: '7',
        label: '7x',
      }, {
        value: '8',
        label: '8x',
      }, {
        value: '9',
        label: '9x',
      }, {
        value: '10',
        label: '10x',
      }, {
        value: '11',
        label: '11x',
      }, {
        value: '12',
        label: '12x',
      }, {
        value: '13',
        label: '13x (Less protection)',
      }, {
        value: '0',
        label: 'Off',
      }],
      label: 'escRampupPower',
    }, {
      name: 'BEEP_STRENGTH',
      inherit: SETTINGS_DESCRIPTIONS['200'],
    }, {
      name: 'BEACON_STRENGTH',
      inherit: SETTINGS_DESCRIPTIONS['200'],
    }, {
      name: 'BEACON_DELAY',
      inherit: SETTINGS_DESCRIPTIONS['200'],
    }, {
      name: 'STARTUP_BEEP',
      inherit: SETTINGS_DESCRIPTIONS['200'],
    }, {
      name: 'DITHERING',
      inherit: SETTINGS_DESCRIPTIONS['200'],
    }, {
      name: 'BRAKE_ON_STOP',
      inherit: SETTINGS_DESCRIPTIONS['200'],
    }],
  },
};

// inherit settings descriptions and also retain ordering
function merge_inherited_descriptions (descs) {
  for (let i = 0; i < descs.MULTI.base.length; i++) {
    if (descs.MULTI.base[i].inherit) {
      descs.MULTI.base[i] = descs.MULTI.base[i].inherit.MULTI.base.find((s) => s.name === descs.MULTI.base[i].name);
    }
  }
}

merge_inherited_descriptions(SETTINGS_DESCRIPTIONS['201']);

// 201 with damping mode
SETTINGS_DESCRIPTIONS['202'] = {
  MULTI: {
    base: [
      ...SETTINGS_DESCRIPTIONS['201'].MULTI.base,
      {
        name: 'DAMPING_MODE',
        type: 'enum',
        label: 'escDampingMode',
        options: [{
          value: '0',
          label: 'Off',
        }, {
          value: '1',
          label: 'Not during startup',
        }, {
          value: '2',
          label: 'On',
        }],
      }], 
  },
};

SETTINGS_DESCRIPTIONS['203'] = {
  MULTI: {
    base: [
      ...SETTINGS_DESCRIPTIONS['201'].MULTI.base.filter((s) => s.name !== 'STARTUP_BEEP'),
    ], 
  }, 
};

const LAYOUT = {
  MAIN_REVISION: {
    offset: 0x00,
    size: 1,
  },
  SUB_REVISION: {
    offset: 0x01,
    size: 1,
  },
  LAYOUT_REVISION: {
    offset: 0x02,
    size: 1,
  },
  __P_GAIN: {
    offset: 0x03,
    size: 1,
  },
  STARTUP_POWER_MIN: {
    offset: 0x04,
    size: 1,
  }, // TODO: not final
  STARTUP_BEEP: {
    offset: 0x05,
    size: 1,
  },
  DITHERING: {
    offset: 0x06,
    size: 1,
  },
  STARTUP_POWER_MAX: {
    offset: 0x07,
    size: 1,
  },
  __MOTOR_IDLE: {
    offset: 0x08,
    size: 1,
  },
  RPM_POWER_SLOPE: {
    offset: 0x09,
    size: 1,
  },
  __PWM_FREQUENCY: {
    offset: 0x0A,
    size: 1,
  },
  MOTOR_DIRECTION: {
    offset: 0x0B,
    size: 1,
  },
  __INPUT_PWM_POLARITY: {
    offset: 0x0C,
    size: 1,
  },
  MODE: {
    offset: 0x0D,
    size: 2,
  },

  _PROGRAMMING_BY_TX: {
    offset: 0x0F,
    size: 1,
  },
  __REARM_AT_START: {
    offset: 0x10,
    size: 1,
  },
  __GOVERNOR_SETUP_TARGET: {
    offset: 0x11,
    size: 1,
  },
  __STARTUP_RPM: {
    offset: 0x12,
    size: 1,
  },
  __STARTUP_ACCELERATION: {
    offset: 0x13,
    size: 1,
  },
  __VOLT_COMP: {
    offset: 0x14,
    size: 1,
  },
  COMMUTATION_TIMING: {
    offset: 0x15,
    size: 1,
  },
  __DAMPING_FORCE: {
    offset: 0x16,
    size: 1,
  },
  __GOVERNOR_RANGE: {
    offset: 0x17,
    size: 1,
  },
  __STARTUP_METHOD: {
    offset: 0x18,
    size: 1,
  },
  _PPM_MIN_THROTTLE: {
    offset: 0x19,
    size: 1,
  },
  _PPM_MAX_THROTTLE: {
    offset: 0x1A,
    size: 1,
  },
  BEEP_STRENGTH: {
    offset: 0x1B,
    size: 1,
  },
  BEACON_STRENGTH: {
    offset: 0x1C,
    size: 1,
  },
  BEACON_DELAY: {
    offset: 0x1D,
    size: 1,
  },
  __THROTTLE_RATE: {
    offset: 0x1E,
    size: 1,
  },
  DEMAG_COMPENSATION: {
    offset: 0x1F,
    size: 1,
  },
  __BEC_VOLTAGE: {
    offset: 0x20,
    size: 1,
  },
  _PPM_CENTER_THROTTLE: {
    offset: 0x21,
    size: 1,
  },
  __SPOOLUP_TIME: {
    offset: 0x22,
    size: 1,
  },
  TEMPERATURE_PROTECTION: {
    offset: 0x23,
    size: 1,
  },
  _LOW_RPM_POWER_PROTECTION: {
    offset: 0x24,
    size: 1,
  },
  __PWM_INPUT: {
    offset: 0x25,
    size: 1,
  },
  __PWM_DITHER: {
    offset: 0x26,
    size: 1,
  },
  BRAKE_ON_STOP: {
    offset: 0x27,
    size: 1,
  },
  LED_CONTROL: {
    offset: 0x28,
    size: 1,
  },

  LAYOUT: {
    offset: 0x40,
    size: 16,
  },
  MCU: {
    offset: 0x50,
    size: 16,
  },
  NAME: {
    offset: 0x60,
    size: 16,
  },

  STARTUP_MELODY: {
    offset: 0x70,
    size: 128,
  },
};

const INDIVIDUAL_SETTINGS = [{
  name: 'MOTOR_DIRECTION',
  type: 'enum',
  label: 'escMotorDirection',
  options: [{
    value: '1',
    label: 'Normal',
  }, {
    value: '2',
    label: 'Reversed',
  }, {
    value: '3',
    label: 'Bidirectional',
  }, {
    value: '4',
    label: 'Bidirectional Reversed',
  }],
}];

const INDIVIDUAL_SETTINGS_203 = [{
  name: 'MOTOR_DIRECTION',
  type: 'enum',
  label: 'escMotorDirection',
  options: [{
    value: '1',
    label: 'Normal',
  }, {
    value: '2',
    label: 'Reversed',
  }, {
    value: '3',
    label: 'Bidirectional',
  }, {
    value: '4',
    label: 'Bidirectional Reversed',
  }],
}, {
  name: 'STARTUP_MELODY',
  type: 'melody',
  label: 'startupMelody',
  value: [2, 58, 4, 32, 52, 66, 13, 0, 69, 45, 13, 0, 52, 66, 13, 0, 78, 39, 211, 0, 69, 45, 208, 25, 52, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  melodyLength: 128,
}];

const INDIVIDUAL_SETTINGS_DESCRIPTIONS = {
  '203': { base: INDIVIDUAL_SETTINGS_203 },
  '202': { base: INDIVIDUAL_SETTINGS },
  '201': { base: INDIVIDUAL_SETTINGS },
  '200': { base: INDIVIDUAL_SETTINGS },
};

var DEFAULTS = {};

DEFAULTS['200'] = { // v0.9
  RPM_POWER_SLOPE: 9, // Backward: STARTUP_POWER
  MOTOR_DIRECTION: 1,
  COMMUTATION_TIMING: 4,
  BEEP_STRENGTH: 40,
  BEACON_STRENGTH: 80,
  BEACON_DELAY: 4,
  DEMAG_COMPENSATION: 2,
  TEMPERATURE_PROTECTION: 7,
  _LOW_RPM_POWER_PROTECTION: 1, // Backward
  BRAKE_ON_STOP: 0,
  LED_CONTROL: 0,

  STARTUP_POWER_MIN: 51, // Backward: STARTUP_BOOST
  STARTUP_BEEP: 1,
  DITHERING: 1,
};

DEFAULTS['201'] = { // v0.10
  ...DEFAULTS['200'],
  STARTUP_POWER_MAX: 25,
};
delete DEFAULTS['201']._LOW_RPM_POWER_PROTECTION;

DEFAULTS['202'] = { // unreleased
  ...DEFAULTS['201'],
  DAMPING_MODE: 2,
};

DEFAULTS['203'] = { // v0.12
  ...DEFAULTS['201'],
  STARTUP_MELODY: [2, 58, 4, 32, 52, 66, 13, 0, 69, 45, 13, 0, 52, 66, 13, 0, 78, 39, 211, 0, 69, 45, 208, 25, 52, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};
delete DEFAULTS['203'].STARTUP_BEEP;


const EEPROM = {
  DEFAULTS,
  EEPROM_OFFSET,
  INDIVIDUAL_SETTINGS_DESCRIPTIONS,
  LAYOUT,
  LAYOUT_SIZE,
  NAMES,
  PAGE_SIZE,
  SETTINGS_DESCRIPTIONS,
  TYPES,
};

export default EEPROM;
