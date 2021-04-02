const BLHELI_LAYOUT_SIZE = 0x70;
const BLHELI_SILABS_EEPROM_OFFSET = 0x1A00;
const BLHELI_SILABS_PAGE_SIZE = 0x0200;
/*
 *Const BLHELI_MIN_SUPPORTED_LAYOUT_REVISION = 0x13;
 *const BLHELI_S_MIN_LAYOUT_REVISION = 0x20;
 */

const BLHELI_TYPES = {
  BLHELI_S_SILABS: 'BLHeli_S SiLabs',
  SILABS: 'SiLabs',
  ATMEL: 'Atmel',
};

const BLHELI_MODES = {
  MAIN: 0xA55A,
  TAIL: 0x5AA5,
  MULTI: 0x55AA,
};

const BLHELI_SILABS = {
  EEPROM_OFFSET: 0x1A00,
  PAGE_SIZE: 0x0200,
  BOOTLOADER_ADDRESS: 0x1C00,
  BOOTLOADER_SIZE: 0x0200,
  FLASH_SIZE: 0x2000,
  ADDRESS_SPACE_SIZE: 0x1C00,
};

/*
const BLHELI_ATMEL = {
  BLB_SIZE: 0x0200,
  SK_SIZE: 0x0400,
  BLB_ADDRESS_8: 0x1E00,
  BLB_ADDRESS_16: 0x3E00,
  SK_ADDRESS_8: 0x1C00,
  SK_ADDRESS_16: 0x3C00,
  EEPROM_SIZE: 0x0200,
};
*/

const BLHELI_LAYOUT = {
  MAIN_REVISION: {
    offset: 0x00, size: 1,
  },
  SUB_REVISION: {
    offset: 0x01, size: 1,
  },
  LAYOUT_REVISION: {
    offset: 0x02, size: 1,
  },
  P_GAIN: {
    offset: 0x03, size: 1,
  },
  I_GAIN: {
    offset: 0x04, size: 1,
  },
  GOVERNOR_MODE: {
    offset: 0x05, size: 1,
  },
  LOW_VOLTAGE_LIMIT: {
    offset: 0x06, size: 1,
  },
  MOTOR_GAIN: {
    offset: 0x07, size: 1,
  },
  MOTOR_IDLE: {
    offset: 0x08, size: 1,
  },
  STARTUP_POWER: {
    offset: 0x09, size: 1,
  },
  PWM_FREQUENCY: {
    offset: 0x0A, size: 1,
  },
  MOTOR_DIRECTION: {
    offset: 0x0B, size: 1,
  },
  INPUT_PWM_POLARITY: {
    offset: 0x0C, size: 1,
  },
  MODE: {
    offset: 0x0D, size: 2,
  },
  PROGRAMMING_BY_TX: {
    offset: 0x0F, size: 1,
  },
  REARM_AT_START: {
    offset: 0x10, size: 1,
  },
  GOVERNOR_SETUP_TARGET: {
    offset: 0x11, size: 1,
  },
  STARTUP_RPM: {
    offset: 0x12, size: 1,
  },
  STARTUP_ACCELERATION: {
    offset: 0x13, size: 1,
  },
  VOLT_COMP: {
    offset: 0x14, size: 1,
  },
  COMMUTATION_TIMING: {
    offset: 0x15, size: 1,
  },
  DAMPING_FORCE: {
    offset: 0x16, size: 1,
  },
  GOVERNOR_RANGE: {
    offset: 0x17, size: 1,
  },
  STARTUP_METHOD: {
    offset: 0x18, size: 1,
  },
  PPM_MIN_THROTTLE: {
    offset: 0x19, size: 1,
  },
  PPM_MAX_THROTTLE: {
    offset: 0x1A, size: 1,
  },
  BEEP_STRENGTH: {
    offset: 0x1B, size: 1,
  },
  BEACON_STRENGTH: {
    offset: 0x1C, size: 1,
  },
  BEACON_DELAY: {
    offset: 0x1D, size: 1,
  },
  THROTTLE_RATE: {
    offset: 0x1E, size: 1,
  },
  DEMAG_COMPENSATION: {
    offset: 0x1F, size: 1,
  },
  BEC_VOLTAGE: {
    offset: 0x20, size: 1,
  },
  PPM_CENTER_THROTTLE: {
    offset: 0x21, size: 1,
  },
  SPOOLUP_TIME: {
    offset: 0x22, size: 1,
  },
  TEMPERATURE_PROTECTION: {
    offset: 0x23, size: 1,
  },
  LOW_RPM_POWER_PROTECTION: {
    offset: 0x24, size: 1,
  },
  PWM_INPUT: {
    offset: 0x25, size: 1,
  },
  PWM_DITHER: {
    offset: 0x26, size: 1,
  },
  BRAKE_ON_STOP: {
    offset: 0x27, size: 1,
  },
  LED_CONTROL: {
    offset: 0x28, size: 1,
  },

  LAYOUT: {
    offset: 0x40, size: 16,
  },
  MCU: {
    offset: 0x50, size: 16,
  },
  NAME: {
    offset: 0x60, size: 16,
  },
};

// layout 33, 16.3, 16.4, 16.5
const BLHELI_S_SETTINGS_LAYOUT_33 = [
  {
    name: 'PROGRAMMING_BY_TX', type: 'bool', label: 'escProgrammingByTX'
  },
  {
    name: 'STARTUP_POWER', type: 'enum', options: [
      {
        value: '1', label: '0.031'
      }, {
        value: '2', label: '0.047'
      },
      {
        value: '3', label: '0.063'
      }, {
        value: '4', label: '0.094'
      },
      {
        value: '5', label: '0.125'
      }, {
        value: '6', label: '0.188'
      },
      {
        value: '7', label: '0.25'
      }, {
        value: '8', label: '0.38'
      },
      {
        value: '9', label: '0.50'
      }, {
        value: '10', label: '0.75'
      },
      {
        value: '11', label: '1.00'
      }, {
        value: '12', label: '1.25'
      },
      {
        value: '13', label: '1.50'
      }
    ],
    label: 'escStartupPower'
  },
  {
    name: 'TEMPERATURE_PROTECTION', type: 'enum', label: 'escTemperatureProtection',
    options: [
      {
        value: '0', label: 'Disabled'
      }, {
        value: '1', label: '80C'
      },
      {
        value: '2', label: '90 C'
      }, {
        value: '3', label: '100 C'
      },
      {
        value: '4', label: '110 C'
      }, {
        value: '5', label: '120 C'
      },
      {
        value: '6', label: '130 C'
      }, {
        value: '7', label: '140 C'
      }
    ]
  },
  {
    name: 'LOW_RPM_POWER_PROTECTION', type: 'bool', label: 'escLowRPMPowerProtection'
  },
  {
    name: 'BRAKE_ON_STOP', type: 'bool', label: 'escBrakeOnStop'
  },
  {
    name: 'DEMAG_COMPENSATION', type: 'enum', label: 'escDemagCompensation',
    options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: 'Low'
      },
      {
        value: '3', label: 'High'
      }
    ]
  },
  {
    name: 'COMMUTATION_TIMING', type: 'enum', label: 'escMotorTiming',
    options: [
      {
        value: '1', label: 'Low'
      }, {
        value: '2', label: 'MediumLow'
      },
      {
        value: '3', label: 'Medium'
      }, {
        value: '4', label: 'MediumHigh'
      },
      {
        value: '5', label: 'High'
      }
    ]
  },
  {
    name: 'BEEP_STRENGTH', type: 'number', min: 1, max: 255, step: 1, label: 'escBeepStrength'
  },
  {
    name: 'BEACON_STRENGTH', type: 'number', min: 1, max: 255, step: 1, label: 'escBeaconStrength'
  },
  {
    name: 'BEACON_DELAY', type: 'enum', label: 'escBeaconDelay',
    options: [
      {
        value: '1', label: '1 minute'
      }, {
        value: '2', label: '2 minutes'
      },
      {
        value: '3', label: '5 minutes'
      }, {
        value: '4', label: '10 minutes'
      },
      {
        value: '5', label: 'Infinite'
      }
    ]
  }
];

// layout 32, 16.0, 16.1, 16.2
const BLHELI_S_SETTINGS_LAYOUT_32 = [
  {
    name: 'PROGRAMMING_BY_TX', type: 'bool', label: 'escProgrammingByTX'
  },
  {
    name: 'STARTUP_POWER', type: 'enum', options: [
      {
        value: '1', label: '0.031'
      }, {
        value: '2', label: '0.047'
      },
      {
        value: '3', label: '0.063'
      }, {
        value: '4', label: '0.094'
      },
      {
        value: '5', label: '0.125'
      }, {
        value: '6', label: '0.188'
      },
      {
        value: '7', label: '0.25'
      }, {
        value: '8', label: '0.38'
      },
      {
        value: '9', label: '0.50'
      }, {
        value: '10', label: '0.75'
      },
      {
        value: '11', label: '1.00'
      }, {
        value: '12', label: '1.25'
      },
      {
        value: '13', label: '1.50'
      }
    ],
    label: 'escStartupPower'
  },
  {
    name: 'TEMPERATURE_PROTECTION', type: 'bool', label: 'escTemperatureProtection'
  },
  {
    name: 'LOW_RPM_POWER_PROTECTION', type: 'bool', label: 'escLowRPMPowerProtection'
  },
  {
    name: 'BRAKE_ON_STOP', type: 'bool', label: 'escBrakeOnStop'
  },
  {
    name: 'DEMAG_COMPENSATION', type: 'enum', label: 'escDemagCompensation',
    options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: 'Low'
      },
      {
        value: '3', label: 'High'
      }
    ]
  },
  {
    name: 'COMMUTATION_TIMING', type: 'enum', label: 'escMotorTiming',
    options: [
      {
        value: '1', label: 'Low'
      }, {
        value: '2', label: 'MediumLow'
      },
      {
        value: '3', label: 'Medium'
      }, {
        value: '4', label: 'MediumHigh'
      },
      {
        value: '5', label: 'High'
      }
    ]
  },
  {
    name: 'BEEP_STRENGTH', type: 'number', min: 1, max: 255, step: 1, label: 'escBeepStrength'
  },
  {
    name: 'BEACON_STRENGTH', type: 'number', min: 1, max: 255, step: 1, label: 'escBeaconStrength'
  },
  {
    name: 'BEACON_DELAY', type: 'enum', label: 'escBeaconDelay',
    options: [
      {
        value: '1', label: '1 minute'
      }, {
        value: '2', label: '2 minutes'
      },
      {
        value: '3', label: '5 minutes'
      }, {
        value: '4', label: '10 minutes'
      },
      {
        value: '5', label: 'Infinite'
      }
    ]
  }
];

// layout 21, 14.5, 14.6, 14.7
const BLHELI_MULTI_SETTINGS_LAYOUT_21 = [
  {
    name: 'PROGRAMMING_BY_TX', type: 'bool', label: 'escProgrammingByTX'
  },
  {
    name: 'GOVERNOR_MODE', type: 'enum', label: 'escClosedLoopMode',
    options: [
      {
        value: '1', label: 'HiRange'
      }, {
        value: '2', label: 'MidRange'
      },
      {
        value: '3', label: 'LoRange'
      }, {
        value: '4', label: 'Off'
      }
    ]
  },
  {
    name: 'P_GAIN', type: 'enum', options: [
      {
        value: '1', label: '0.13'
      }, {
        value: '2', label: '0.17'
      },
      {
        value: '3', label: '0.25'
      }, {
        value: '4', label: '0.38'
      },
      {
        value: '5', label: '0.50'
      }, {
        value: '6', label: '0.75'
      },
      {
        value: '7', label: '1.00'
      }, {
        value: '8', label: '1.50'
      },
      {
        value: '9', label: '2.00'
      }, {
        value: '10', label: '3.00'
      },
      {
        value: '11', label: '4.00'
      }, {
        value: '12', label: '6.00'
      },
      {
        value: '13', label: '8.00'
      }
    ],
    visibleIf: (settings) => settings.GOVERNOR_MODE !== 4,
    label: 'escClosedLoopPGain'
  },
  {
    name: 'I_GAIN', type: 'enum', options: [
      {
        value: '1', label: '0.13'
      }, {
        value: '2', label: '0.17'
      },
      {
        value: '3', label: '0.25'
      }, {
        value: '4', label: '0.38'
      },
      {
        value: '5', label: '0.50'
      }, {
        value: '6', label: '0.75'
      },
      {
        value: '7', label: '1.00'
      }, {
        value: '8', label: '1.50'
      },
      {
        value: '9', label: '2.00'
      }, {
        value: '10', label: '3.00'
      },
      {
        value: '11', label: '4.00'
      }, {
        value: '12', label: '6.00'
      },
      {
        value: '13', label: '8.00'
      }
    ],
    visibleIf: (settings) => settings.GOVERNOR_MODE !== 4,
    label: 'escClosedLoopIGain'
  },
  {
    name: 'MOTOR_GAIN', type: 'enum', options: [
      {
        value: '1', label: '0.75'
      }, {
        value: '2', label: '0.88'
      },
      {
        value: '3', label: '1.00'
      }, {
        value: '4', label: '1.12'
      },
      {
        value: '5', label: '1.25'
      }
    ],
    label: 'escMotorGain'
  },
  {
    name: 'STARTUP_POWER', type: 'enum', options: [
      {
        value: '1', label: '0.031'
      }, {
        value: '2', label: '0.047'
      },
      {
        value: '3', label: '0.063'
      }, {
        value: '4', label: '0.094'
      },
      {
        value: '5', label: '0.125'
      }, {
        value: '6', label: '0.188'
      },
      {
        value: '7', label: '0.25'
      }, {
        value: '8', label: '0.38'
      },
      {
        value: '9', label: '0.50'
      }, {
        value: '10', label: '0.75'
      },
      {
        value: '11', label: '1.00'
      }, {
        value: '12', label: '1.25'
      },
      {
        value: '13', label: '1.50'
      }
    ],
    label: 'escStartupPower'
  },
  {
    name: 'TEMPERATURE_PROTECTION', type: 'bool', label: 'escTemperatureProtection'
  },
  {
    name: 'PWM_DITHER', type: 'enum', label: 'escPWMOutputDither',
    options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: '3'
      },
      {
        value: '3', label: '7'
      }, {
        value: '4', label: '15'
      },
      {
        value: '5', label: '31'
      }
    ]
  },
  {
    name: 'LOW_RPM_POWER_PROTECTION', type: 'bool', label: 'escLowRPMPowerProtection'
  },
  {
    name: 'BRAKE_ON_STOP', type: 'bool', label: 'escBrakeOnStop'
  },
  {
    name: 'DEMAG_COMPENSATION', type: 'enum', label: 'escDemagCompensation',
    options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: 'Low'
      },
      {
        value: '3', label: 'High'
      }
    ]
  },
  {
    name: 'PWM_FREQUENCY', type: 'enum', label: 'escPWMFrequencyDamped',
    options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: 'Low'
      },
      {
        value: '3', label: 'DampedLight'
      }
    ]
  },
  {
    name: 'PWM_INPUT', type: 'bool', label: 'escEnablePWMInput'
  },
  {
    name: 'COMMUTATION_TIMING', type: 'enum', label: 'escMotorTiming',
    options: [
      {
        value: '1', label: 'Low'
      }, {
        value: '2', label: 'MediumLow'
      },
      {
        value: '3', label: 'Medium'
      }, {
        value: '4', label: 'MediumHigh'
      },
      {
        value: '5', label: 'High'
      }
    ]
  },
  {
    name: 'INPUT_PWM_POLARITY', type: 'enum', label: 'escInputPolarity',
    options: [
      {
        value: '1', label: 'Positive'
      }, {
        value: '2', label: 'Negative'
      }
    ]
  },
  {
    name: 'BEEP_STRENGTH', type: 'number', min: 1, max: 255, step: 1, label: 'escBeepStrength'
  },
  {
    name: 'BEACON_STRENGTH', type: 'number', min: 1, max: 255, step: 1, label: 'escBeaconStrength'
  },
  {
    name: 'BEACON_DELAY', type: 'enum', label: 'escBeaconDelay',
    options: [
      {
        value: '1', label: '1 minute'
      }, {
        value: '2', label: '2 minutes'
      },
      {
        value: '3', label: '5 minutes'
      }, {
        value: '4', label: '10 minutes'
      },
      {
        value: '5', label: 'Infinite'
      }
    ]
  }
];

// layout 20, 14.0, 14.1, 14.2, 14.3, 14.4
const BLHELI_MULTI_SETTINGS_LAYOUT_20 = [
  {
    name: 'PROGRAMMING_BY_TX', type: 'bool', label: 'escProgrammingByTX'
  },
  {
    name: 'GOVERNOR_MODE', type: 'enum', label: 'escClosedLoopMode',
    options: [
      {
        value: '1', label: 'HiRange'
      }, {
        value: '2', label: 'MidRange'
      },
      {
        value: '3', label: 'LoRange'
      }, {
        value: '4', label: 'Off'
      }
    ]
  },
  {
    name: 'P_GAIN', type: 'enum', options: [
      {
        value: '1', label: '0.13'
      }, {
        value: '2', label: '0.17'
      },
      {
        value: '3', label: '0.25'
      }, {
        value: '4', label: '0.38'
      },
      {
        value: '5', label: '0.50'
      }, {
        value: '6', label: '0.75'
      },
      {
        value: '7', label: '1.00'
      }, {
        value: '8', label: '1.50'
      },
      {
        value: '9', label: '2.00'
      }, {
        value: '10', label: '3.00'
      },
      {
        value: '11', label: '4.00'
      }, {
        value: '12', label: '6.00'
      },
      {
        value: '13', label: '8.00'
      }
    ],
    visibleIf: (settings) => settings.GOVERNOR_MODE !== 4,
    label: 'escClosedLoopPGain'
  },
  {
    name: 'I_GAIN', type: 'enum', options: [
      {
        value: '1', label: '0.13'
      }, {
        value: '2', label: '0.17'
      },
      {
        value: '3', label: '0.25'
      }, {
        value: '4', label: '0.38'
      },
      {
        value: '5', label: '0.50'
      }, {
        value: '6', label: '0.75'
      },
      {
        value: '7', label: '1.00'
      }, {
        value: '8', label: '1.50'
      },
      {
        value: '9', label: '2.00'
      }, {
        value: '10', label: '3.00'
      },
      {
        value: '11', label: '4.00'
      }, {
        value: '12', label: '6.00'
      },
      {
        value: '13', label: '8.00'
      }
    ],
    visibleIf: (settings) => settings.GOVERNOR_MODE !== 4,
    label: 'escClosedLoopIGain'
  },
  {
    name: 'MOTOR_GAIN', type: 'enum', options: [
      {
        value: '1', label: '0.75'
      }, {
        value: '2', label: '0.88'
      },
      {
        value: '3', label: '1.00'
      }, {
        value: '4', label: '1.12'
      },
      {
        value: '5', label: '1.25'
      }
    ],
    label: 'escMotorGain'
  },
  {
    name: 'STARTUP_POWER', type: 'enum', options: [
      {
        value: '1', label: '0.031'
      }, {
        value: '2', label: '0.047'
      },
      {
        value: '3', label: '0.063'
      }, {
        value: '4', label: '0.094'
      },
      {
        value: '5', label: '0.125'
      }, {
        value: '6', label: '0.188'
      },
      {
        value: '7', label: '0.25'
      }, {
        value: '8', label: '0.38'
      },
      {
        value: '9', label: '0.50'
      }, {
        value: '10', label: '0.75'
      },
      {
        value: '11', label: '1.00'
      }, {
        value: '12', label: '1.25'
      },
      {
        value: '13', label: '1.50'
      }
    ],
    label: 'escStartupPower'
  },
  {
    name: 'TEMPERATURE_PROTECTION', type: 'bool', label: 'escTemperatureProtection'
  },
  {
    name: 'PWM_DITHER', type: 'enum', label: 'escPWMOutputDither',
    options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: '7'
      },
      {
        value: '3', label: '15'
      }, {
        value: '4', label: '31'
      },
      {
        value: '5', label: '63'
      }
    ]
  },
  {
    name: 'LOW_RPM_POWER_PROTECTION', type: 'bool', label: 'escLowRPMPowerProtection'
  },
  {
    name: 'DEMAG_COMPENSATION', type: 'enum', label: 'escDemagCompensation',
    options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: 'Low'
      },
      {
        value: '3', label: 'High'
      }
    ]
  },
  {
    name: 'PWM_FREQUENCY', type: 'enum', label: 'escPWMFrequencyDamped',
    options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: 'Low'
      },
      {
        value: '3', label: 'DampedLight'
      }
    ]
  },
  {
    name: 'PWM_INPUT', type: 'bool', label: 'escEnablePWMInput'
  },
  {
    name: 'COMMUTATION_TIMING', type: 'enum', label: 'escMotorTiming',
    options: [
      {
        value: '1', label: 'Low'
      }, {
        value: '2', label: 'MediumLow'
      },
      {
        value: '3', label: 'Medium'
      }, {
        value: '4', label: 'MediumHigh'
      },
      {
        value: '5', label: 'High'
      }
    ]
  },
  {
    name: 'INPUT_PWM_POLARITY', type: 'enum', label: 'escInputPolarity',
    options: [
      {
        value: '1', label: 'Positive'
      }, {
        value: '2', label: 'Negative'
      }
    ]
  },
  {
    name: 'BEEP_STRENGTH', type: 'number', min: 1, max: 255, step: 1, label: 'escBeepStrength'
  },
  {
    name: 'BEACON_STRENGTH', type: 'number', min: 1, max: 255, step: 1, label: 'escBeaconStrength'
  },
  {
    name: 'BEACON_DELAY', type: 'enum', label: 'escBeaconDelay',
    options: [
      {
        value: '1', label: '1 minute'
      }, {
        value: '2', label: '2 minutes'
      },
      {
        value: '3', label: '5 minutes'
      }, {
        value: '4', label: '10 minutes'
      },
      {
        value: '5', label: 'Infinite'
      }
    ]
  }
];

// layout 19, 13.2
const BLHELI_MULTI_SETTINGS_LAYOUT_19 = [
  {
    name: 'PROGRAMMING_BY_TX', type: 'bool', label: 'escProgrammingByTX'
  },
  {
    name: 'GOVERNOR_MODE', type: 'enum', label: 'escClosedLoopMode',
    options: [
      {
        value: '1', label: 'HiRange'
      }, {
        value: '2', label: 'MidRange'
      },
      {
        value: '3', label: 'LoRange'
      }, {
        value: '4', label: 'Off'
      }
    ]
  },
  {
    name: 'P_GAIN', type: 'enum', options: [
      {
        value: '1', label: '0.13'
      }, {
        value: '2', label: '0.17'
      },
      {
        value: '3', label: '0.25'
      }, {
        value: '4', label: '0.38'
      },
      {
        value: '5', label: '0.50'
      }, {
        value: '6', label: '0.75'
      },
      {
        value: '7', label: '1.00'
      }, {
        value: '8', label: '1.50'
      },
      {
        value: '9', label: '2.00'
      }, {
        value: '10', label: '3.00'
      },
      {
        value: '11', label: '4.00'
      }, {
        value: '12', label: '6.00'
      },
      {
        value: '13', label: '8.00'
      }
    ],
    visibleIf: (settings) => settings.GOVERNOR_MODE !== 4,
    label: 'escClosedLoopPGain'
  },
  {
    name: 'I_GAIN', type: 'enum', options: [
      {
        value: '1', label: '0.13'
      }, {
        value: '2', label: '0.17'
      },
      {
        value: '3', label: '0.25'
      }, {
        value: '4', label: '0.38'
      },
      {
        value: '5', label: '0.50'
      }, {
        value: '6', label: '0.75'
      },
      {
        value: '7', label: '1.00'
      }, {
        value: '8', label: '1.50'
      },
      {
        value: '9', label: '2.00'
      }, {
        value: '10', label: '3.00'
      },
      {
        value: '11', label: '4.00'
      }, {
        value: '12', label: '6.00'
      },
      {
        value: '13', label: '8.00'
      }
    ],
    visibleIf: (settings) => settings.GOVERNOR_MODE !== 4,
    label: 'escClosedLoopIGain'
  },
  {
    name: 'LOW_VOLTAGE_LIMIT', type: 'enum', options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: '3.0V/c'
      },
      {
        value: '3', label: '3.1V/c'
      }, {
        value: '4', label: '3.2V/c'
      },
      {
        value: '5', label: '3.3V/c'
      }, {
        value: '6', label: '3.4V/c'
      }
    ],
    label: 'escLowVoltageLimit'
  },
  {
    name: 'MOTOR_GAIN', type: 'enum', options: [
      {
        value: '1', label: '0.75'
      }, {
        value: '2', label: '0.88'
      },
      {
        value: '3', label: '1.00'
      }, {
        value: '4', label: '1.12'
      },
      {
        value: '5', label: '1.25'
      }
    ],
    label: 'escMotorGain'
  },
  {
    name: 'STARTUP_POWER', type: 'enum', options: [
      {
        value: '1', label: '0.031'
      }, {
        value: '2', label: '0.047'
      },
      {
        value: '3', label: '0.063'
      }, {
        value: '4', label: '0.094'
      },
      {
        value: '5', label: '0.125'
      }, {
        value: '6', label: '0.188'
      },
      {
        value: '7', label: '0.25'
      }, {
        value: '8', label: '0.38'
      },
      {
        value: '9', label: '0.50'
      }, {
        value: '10', label: '0.75'
      },
      {
        value: '11', label: '1.00'
      }, {
        value: '12', label: '1.25'
      },
      {
        value: '13', label: '1.50'
      }
    ],
    label: 'escStartupPower'
  },
  {
    name: 'TEMPERATURE_PROTECTION', type: 'bool', label: 'escTemperatureProtection'
  },
  {
    name: 'DEMAG_COMPENSATION', type: 'enum', label: 'escDemagCompensation',
    options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: 'Low'
      },
      {
        value: '3', label: 'High'
      }
    ]
  },
  {
    name: 'PWM_FREQUENCY', type: 'enum', label: 'escPWMFrequencyDamped',
    options: [
      {
        value: '1', label: 'Off'
      }, {
        value: '2', label: 'Low'
      },
      {
        value: '3', label: 'DampedLight'
      }
    ]
  },
  {
    name: 'COMMUTATION_TIMING', type: 'enum', label: 'escMotorTiming',
    options: [
      {
        value: '1', label: 'Low'
      }, {
        value: '2', label: 'MediumLow'
      },
      {
        value: '3', label: 'Medium'
      }, {
        value: '4', label: 'MediumHigh'
      },
      {
        value: '5', label: 'High'
      }
    ]
  },
  {
    name: 'BEEP_STRENGTH', type: 'number', min: 1, max: 255, step: 1, label: 'escBeepStrength'
  },
  {
    name: 'BEACON_STRENGTH', type: 'number', min: 1, max: 255, step: 1, label: 'escBeaconStrength'
  },
  {
    name: 'BEACON_DELAY', type: 'enum', label: 'escBeaconDelay',
    options: [
      {
        value: '1', label: '1 minute'
      }, {
        value: '2', label: '2 minutes'
      },
      {
        value: '3', label: '5 minutes'
      }, {
        value: '4', label: '10 minutes'
      },
      {
        value: '5', label: 'Infinite'
      }
    ]
  }
];


const BLHELI_SETTINGS_DESCRIPTIONS = {
  // BLHeli_S
  '33': {
    MULTI: { base: BLHELI_S_SETTINGS_LAYOUT_33 },
    // There is no MAIN nor MULTI mode in BLHeli_S, added for completeness
    MAIN: { base: [] },
    TAIL: { base: [] }
  },
  '32': {
    MULTI: { base: BLHELI_S_SETTINGS_LAYOUT_32 },
    // There is no MAIN nor MULTI mode in BLHeli_S, added for completeness
    MAIN: { base: [] },
    TAIL: { base: [] }
  },

  // BLHeli
  '21': {
    MULTI: {
      base: BLHELI_MULTI_SETTINGS_LAYOUT_21,
      overrides: {
        '14.5': [
          {
            name: 'PWM_DITHER', type: 'enum', label: 'escPWMOutputDither',
            options: [
              {
                value: '1', label: 'Off'
              }, {
                value: '2', label: '7'
              },
              {
                value: '3', label: '15'
              }, {
                value: '4', label: '31'
              },
              {
                value: '5', label: '63'
              }
            ]
          }
        ],
      }
    },
    MAIN: { base: [] },
    TAIL: { base: [] }
  },

  '20': {
    MULTI: {
      base: BLHELI_MULTI_SETTINGS_LAYOUT_20,
      overrides: {
        '14.0': [
          {
            name: 'PWM_DITHER', type: 'enum', label: 'escPWMOutputDither',
            options: [
              {
                value: '1', label: '1'
              }, {
                value: '2', label: '3'
              },
              {
                value: '3', label: '7'
              }, {
                value: '4', label: '15'
              },
              {
                value: '5', label: '31'
              }
            ]
          }
        ]
      }
    },
    MAIN: { base: [] },
    TAIL: { base: [] }
  },

  '19': {
    MULTI: { base: BLHELI_MULTI_SETTINGS_LAYOUT_19 },
    MAIN: { base: [] },
    TAIL: { base: [] }
  }
};


// @todo add validation for min/max throttle
const BLHELI_S_INDIVIDUAL_SETTINGS = [
  {
    name: 'MOTOR_DIRECTION', type: 'enum', label: 'escMotorDirection',
    options: [
      {
        value: '1', label: 'Normal'
      }, {
        value: '2', label: 'Reversed'
      },
      {
        value: '3', label: 'Bidirectional'
      }, {
        value: '4', label: 'Bidirectional Reversed'
      }
    ]
  },
  {
    name: 'PPM_MIN_THROTTLE', type: 'number', min: 1000, max: 1500, step: 4, label: 'escPPMMinThrottle',
    offset: 1000, factor: 4, suffix: ' μs'
  },
  {
    name: 'PPM_MAX_THROTTLE', type: 'number', min: 1504, max: 2020, step: 4, label: 'escPPMMaxThrottle',
    offset: 1000, factor: 4, suffix: ' μs'
  },
  {
    name: 'PPM_CENTER_THROTTLE', type: 'number', min: 1000, max: 2020, step: 4, label: 'escPPMCenterThrottle',
    offset: 1000, factor: 4, suffix: ' μs',
    visibleIf: (settings) => [ 3, 4 ].includes(settings.MOTOR_DIRECTION)
  }
];

const BLHELI_INDIVIDUAL_SETTINGS = [
  {
    name: 'MOTOR_DIRECTION', type: 'enum', label: 'escMotorDirection',
    options: [
      {
        value: '1', label: 'Normal'
      }, {
        value: '2', label: 'Reversed'
      },
      {
        value: '3', label: 'Bidirectional'
      }
    ]
  },
  {
    name: 'PPM_MIN_THROTTLE', type: 'number', min: 1000, max: 1500, step: 4, label: 'escPPMMinThrottle',
    offset: 1000, factor: 4, suffix: ' μs'
  },
  {
    name: 'PPM_MAX_THROTTLE', type: 'number', min: 1504, max: 2020, step: 4, label: 'escPPMMaxThrottle',
    offset: 1000, factor: 4, suffix: ' μs'
  },
  {
    name: 'PPM_CENTER_THROTTLE', type: 'number', min: 1000, max: 2020, step: 4, label: 'escPPMCenterThrottle',
    offset: 1000, factor: 4, suffix: ' μs',
    visibleIf: (settings) => settings.MOTOR_DIRECTION === 3
  }
];

const BLHELI_INDIVIDUAL_SETTINGS_DESCRIPTIONS = {
  // BLHeli_S
  '33': { base: BLHELI_S_INDIVIDUAL_SETTINGS },
  '32': { base: BLHELI_S_INDIVIDUAL_SETTINGS },

  // BLHeli
  '21': { base: BLHELI_INDIVIDUAL_SETTINGS },
  '20': { base: BLHELI_INDIVIDUAL_SETTINGS },
  '19': { base: BLHELI_INDIVIDUAL_SETTINGS }
};

var BLHELI_S_DEFAULTS = {
  '33': {
    STARTUP_POWER: 9,
    MOTOR_DIRECTION: 1,
    PROGRAMMING_BY_TX: 1,
    COMMUTATION_TIMING: 3,
    PPM_MIN_THROTTLE: 37,
    PPM_MAX_THROTTLE: 208,
    BEEP_STRENGTH: 40,
    BEACON_STRENGTH: 80,
    BEACON_DELAY: 4,
    DEMAG_COMPENSATION: 2,
    PPM_CENTER_THROTTLE: 122,
    TEMPERATURE_PROTECTION: 7,
    LOW_RPM_POWER_PROTECTION: 1,
    BRAKE_ON_STOP: 0,
    LED_CONTROL: 0
  },
  '32': {
    STARTUP_POWER: 9,
    MOTOR_DIRECTION: 1,
    PROGRAMMING_BY_TX: 1,
    COMMUTATION_TIMING: 3,
    PPM_MIN_THROTTLE: 37,
    PPM_MAX_THROTTLE: 208,
    BEEP_STRENGTH: 40,
    BEACON_STRENGTH: 80,
    BEACON_DELAY: 4,
    DEMAG_COMPENSATION: 2,
    PPM_CENTER_THROTTLE: 122,
    TEMPERATURE_PROTECTION: 1,
    LOW_RPM_POWER_PROTECTION: 1,
    BRAKE_ON_STOP: 0,
    LED_CONTROL: 0
  }
};

const EEPROM = {
  DEFAULTS: BLHELI_S_DEFAULTS,
  EEPROM_OFFSET: BLHELI_SILABS_EEPROM_OFFSET,
  INDIVIDUAL_SETTINGS_DESCRIPTIONS: BLHELI_INDIVIDUAL_SETTINGS_DESCRIPTIONS,
  LAYOUT: BLHELI_LAYOUT,
  LAYOUT_SIZE: BLHELI_LAYOUT_SIZE,
  MODES: BLHELI_MODES,
  NAMES: [''],
  PAGE_SIZE: BLHELI_SILABS_PAGE_SIZE,
  SETTINGS_DESCRIPTIONS: BLHELI_SETTINGS_DESCRIPTIONS,
  SILABS: BLHELI_SILABS,
  TYPES: BLHELI_TYPES,
};

export default EEPROM;
