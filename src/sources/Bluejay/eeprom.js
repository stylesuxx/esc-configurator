const EEPROM_OFFSET = 0x1A00;
const PAGE_SIZE = 0x0200;
const LAYOUT_SIZE = 0xF0;
const TYPES = { EFM8: 'EFM8' };
const NAMES = ['Bluejay', 'Bluejay (BETA)'];

const SETTINGS_DESCRIPTIONS = {
  //  With Bluejay startup tunes
  '203': {
    MULTI: {
      base: [
        {
          name: 'STARTUP_POWER_MIN', type: 'number', label: '_Minimum Startup Power (Boost)',
          min: 1000, max: 1125, step: 5, displayFactor: 1000 / 2047, displayOffset: 1000, displayPrecision: 0
        },
        {
          name: 'STARTUP_POWER_MAX', type: 'number', label: '_Maximum Startup Power (Protection)',
          // Note: The real displayFactor is 1000 / 255 but 250 makes the slider nicer to work with minimal loss of accuracy
          min: 1004, max: 1300, step: 4, displayFactor: 1000 / 250, displayOffset: 1000, displayPrecision: 0
        },
        {
          name: 'TEMPERATURE_PROTECTION', type: 'enum', label: 'escTemperatureProtection',
          options: [
            {
              value: '0', label: 'Disabled'
            }, {
              value: '1', label: '80 C'
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
          name: 'COMMUTATION_TIMING', type: 'enum', label: 'escMotorTiming',
          options: [
            {
              value: '1', label: '0° (Low)'
            }, {
              value: '2', label: '7.5° (MediumLow)'
            },
            {
              value: '3', label: '15° (Medium)'
            }, {
              value: '4', label: '22.5° (MediumHigh)'
            },
            {
              value: '5', label: '30° (High)'
            }
          ]
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
          name: 'RPM_POWER_SLOPE', type: 'enum', options: [
            {
              value:  '1', label: '1x (More protection)'
            },
            {
              value:  '2', label: '2x'
            }, {
              value: '3', label: '3x'
            },
            {
              value:  '4', label: '4x'
            }, {
              value: '5', label: '5x'
            },
            {
              value:  '6', label: '6x'
            },
            {
              value:  '7', label: '7x'
            }, {
              value: '8', label:  '8x'
            },
            {
              value:  '9', label: '9x'
            }, {
              value: '10', label: '10x'
            },
            {
              value: '11', label: '11x'
            }, {
              value: '12', label: '12x'
            },
            {
              value: '13', label: '13x (Less protection)'
            }, {
              value: '0', label: 'Off'
            }
          ],
          label: '_RPM Power Protection (Rampup)'
        },
        {
          name: 'BEEP_STRENGTH', type: 'number', min: 0, max: 255, step: 1, label: 'escBeepStrength'
        },
        {
          name: 'BEACON_STRENGTH', type: 'number', min: 0, max: 255, step: 1, label: 'escBeaconStrength'
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
            },
          ],
        },
        {
          name: 'STARTUP_BEEP', type: 'bool', label: 'escStartupBeep'
        },
        {
          name: 'DITHERING', type: 'bool', label: 'escDithering'
        },
        {
          name: 'BRAKE_ON_STOP', type: 'bool', label: 'escBrakeOnStop'
        }
      ],
    },
  },

  //  only adds damping mode
  '202': {
    MULTI: {
      base: [
        {
          name: 'STARTUP_POWER_MIN', type: 'number', label: '_Minimum Startup Power (Boost)',
          min: 1000, max: 1125, step: 5, displayFactor: 1000 / 2047, displayOffset: 1000, displayPrecision: 0
        },
        {
          name: 'STARTUP_POWER_MAX', type: 'number', label: '_Maximum Startup Power (Protection)',
          // Note: The real displayFactor is 1000 / 255 but 250 makes the slider nicer to work with minimal loss of accuracy
          min: 1004, max: 1300, step: 4, displayFactor: 1000 / 250, displayOffset: 1000, displayPrecision: 0
        },
        {
          name: 'TEMPERATURE_PROTECTION', type: 'enum', label: 'escTemperatureProtection',
          options: [
            {
              value: '0', label: 'Disabled'
            }, {
              value: '1', label: '80 C'
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
            },
          ],
        },
        {
          name: 'COMMUTATION_TIMING', type: 'enum', label: 'escMotorTiming',
          options: [
            {
              value: '1', label: '0° (Low)'
            }, {
              value: '2', label: '7.5° (MediumLow)'
            },
            {
              value: '3', label: '15° (Medium)'
            }, {
              value: '4', label: '22.5° (MediumHigh)'
            },
            {
              value: '5', label: '30° (High)'
            },
          ],
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
            },
          ],
        },
        {
          name: 'RPM_POWER_SLOPE', type: 'enum', options: [
            {
              value:  '1', label: '1x (More protection)'
            },
            {
              value:  '2', label: '2x'
            }, {
              value: '3', label: '3x'
            },
            {
              value:  '4', label: '4x'
            }, {
              value: '5', label: '5x'
            },
            {
              value:  '6', label: '6x'
            },
            {
              value:  '7', label: '7x'
            }, {
              value: '8', label:  '8x'
            },
            {
              value:  '9', label: '9x'
            }, {
              value: '10', label: '10x'
            },
            {
              value: '11', label: '11x'
            }, {
              value: '12', label: '12x'
            },
            {
              value: '13', label: '13x (Less protection)'
            }, {
              value: '0', label: 'Off'
            }
          ],
          label: '_RPM Power Protection (Rampup)'
        },
        {
          name: 'BEEP_STRENGTH', type: 'number', min: 0, max: 255, step: 1, label: 'escBeepStrength'
        },
        {
          name: 'BEACON_STRENGTH', type: 'number', min: 0, max: 255, step: 1, label: 'escBeaconStrength'
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
            },
          ],
        },
        {
          name: 'STARTUP_BEEP', type: 'bool', label: 'escStartupBeep'
        },
        {
          name: 'DITHERING', type: 'bool', label: 'escDithering'
        },
        {
          name: 'BRAKE_ON_STOP', type: 'bool', label: 'escBrakeOnStop'
        },
        {
          name: 'DAMPING_MODE', type: 'enum', label: '_Damping mode (Complementary PWM)',
          options: [
            {
              value: '0', label: 'Off'
            },
            {
              value: '1', label: 'Not during startup'
            },
            {
              value: '2', label: 'On'
            },
          ],
        },
      ],
    },
  },
  // V0.10
  '201': {
    MULTI: {
      base: [
        {
          name: 'STARTUP_POWER_MIN',
          type: 'number',
          label: '_Minimum Startup Power (Boost)',
          min: 1000,
          max: 1125,
          step: 5,
          displayFactor: 1000 / 2047,
          displayOffset: 1000,
          displayPrecision: 0,
        },
        {
          name: 'STARTUP_POWER_MAX',
          type: 'number',
          label: '_Maximum Startup Power (Protection)',

          /*
           * Note: The real displayFactor is 1000 / 255 but 250
           * makes the slider nicer to work with minimal loss of accuracy
           */
          min: 1004,
          max: 1300,
          step: 4,
          displayFactor: 1000 / 250,
          displayOffset: 1000,
          displayPrecision: 0,
        },
        {
          name: 'TEMPERATURE_PROTECTION',
          type: 'enum',
          label: 'escTemperatureProtection',
          options: [
            {
              value: '0', label: 'Disabled',
            },
            {
              value: '1', label: '80 C',
            },
            {
              value: '2', label: '90 C',
            },
            {
              value: '3', label: '100 C',
            },
            {
              value: '4', label: '110 C',
            },
            {
              value: '5', label: '120 C',
            },
            {
              value: '6', label: '130 C',
            },
            {
              value: '7', label: '140 C',
            },
          ],
        },
        {
          name: 'COMMUTATION_TIMING',
          type: 'enum',
          label: 'escMotorTiming',
          options: [
            {
              value: '1', label: '0° (Low)',
            },
            {
              value: '2', label: '7.5° (MediumLow)',
            },
            {
              value: '3', label: '15° (Medium)',
            },
            {
              value: '4', label: '22.5° (MediumHigh)',
            },
            {
              value: '5',label: '30° (High)',
            },
          ],
        },
        {
          name: 'DEMAG_COMPENSATION',
          type: 'enum',
          label: 'escDemagCompensation',
          options: [
            {
              value: '1', label: 'Off',
            },
            {
              value: '2', label: 'Low',
            },
            {
              value: '3', label: 'High',
            },
          ],
        },
        {
          name: 'RPM_POWER_SLOPE',
          type: 'enum',
          options: [
            {
              value: '1', label: '1x (More protection)',
            },
            {
              value: '2', label: '2x',
            },
            {
              value: '3', label: '3x',
            },
            {
              value: '4', label: '4x',
            },
            {
              value: '5', label: '5x',
            },
            {
              value: '6', label: '6x',
            },
            {
              value: '7', label: '7x',
            },
            {
              value: '8', label: '8x',
            },
            {
              value: '9', label: '9x',
            },
            {
              value: '10', label: '10x',
            },
            {
              value: '11', label: '11x',
            },
            {
              value: '12', label: '12x',
            },
            {
              value: '13', label: '13x (Less protection)',
            },
            {
              value: '0', label: 'Off',
            },
          ],
          label: '_RPM Power Protection (Rampup)',
        },
        {
          name: 'BEEP_STRENGTH',
          type: 'number',
          min: 0,
          max: 255,
          step: 1,
          label: 'escBeepStrength',
        },
        {
          name: 'BEACON_STRENGTH',
          type: 'number',
          min: 0,
          max: 255,
          step: 1,
          label: 'escBeaconStrength',
        },
        {
          name: 'BEACON_DELAY',
          type: 'enum',
          label: 'escBeaconDelay',
          options: [
            {
              value: '1', label: '1 minute',
            },
            {
              value: '2', label: '2 minutes',
            },
            {
              value: '3', label: '5 minutes',
            },
            {
              value: '4', label: '10 minutes',
            },
            {
              value: '5', label: 'Infinite',
            },
          ],
        },
        {
          name: 'STARTUP_BEEP',
          type: 'bool',
          label: 'escStartupBeep',
        },
        {
          name: 'DITHERING',
          type: 'bool',
          label: 'escDithering',
        },
        {
          name: 'BRAKE_ON_STOP',
          type: 'bool',
          label: 'escBrakeOnStop',
        },
      ],
    },
  },

  // V0.9
  '200': {
    MULTI: {
      base:
      [
        {
          name: 'RPM_POWER_SLOPE',
          type: 'enum',
          options: [
            {
              value: '1', label: '0.5% (0.031)',
            },

            /*
             *{ value:  '2', label: '0.8% (0.047)' },
             *{ value:  '3', label: '1.2% (0.063)' },
             *{ value:  '4', label: '1.6% (0.094)' },
             *{ value:  '5', label: '2.5% (0.125)' },
             *{ value:  '6', label: '3.5% (0.188)' },
             */
            {
              value: '7', label: '5%  (0.25)',
            },
            {
              value: '8', label: '7%  (0.38)',
            },
            {
              value: '9', label: '10%  (0.50)',
            },
            {
              value: '10', label: '15%  (0.75)',
            },
            {
              value: '11', label: '20%  (1.00)',
            },
            {
              value: '12', label: '24%  (1.25)',
            },
            {
              value: '13', label: '29%  (1.50)',
            },
          ],
          label: '_Rampup Start Power',
        },
        {
          name: 'STARTUP_POWER_MIN',
          type: 'number',
          label: '_Minimum Startup Power (Boost)',
          min: 1000,
          max: 1125,
          step: 5,
          displayFactor: 1000 / 2047,
          displayOffset: 1000,
          displayPrecision: 0,
        },
        {
          name: 'TEMPERATURE_PROTECTION',
          type: 'enum',
          label: 'escTemperatureProtection',
          options: [
            {
              value: '0',
              label: 'Disabled',
            },
            {
              value: '1',
              label: '80 C',
            },
            {
              value: '2',
              label: '90 C',
            },
            {
              value: '3',
              label: '100 C',
            },
            {
              value: '4',
              label: '110 C',
            },
            {
              value: '5',
              label: '120 C',
            },
            {
              value: '6',
              label: '130 C',
            },
            {
              value: '7',
              label: '140 C',
            },
          ],
        },
        {
          name: '_LOW_RPM_POWER_PROTECTION',
          type: 'bool',
          label: 'escLowRPMPowerProtection',
        },
        {
          name: 'BRAKE_ON_STOP',
          type: 'bool',
          label: 'escBrakeOnStop',
        },
        {
          name: 'DEMAG_COMPENSATION',
          type: 'enum',
          label: 'escDemagCompensation',
          options: [
            {
              value: '1',
              label: 'Off',
            },
            {
              value: '2',
              label: 'Low',
            },
            {
              value: '3',
              label: 'High',
            },
          ],
        },
        {
          name: 'COMMUTATION_TIMING',
          type: 'enum',
          label: 'escMotorTiming',
          options: [
            {
              value: '1',
              label: '0° (Low)',
            },
            {
              value: '2',
              label: '7.5° (MediumLow)',
            },
            {
              value: '3',
              label: '15° (Medium)',
            },
            {
              value: '4',
              label: '22.5° (MediumHigh)',
            },
            {
              value: '5',
              label: '30° (High)',
            },
          ],
        },
        {
          name: 'BEEP_STRENGTH',
          type: 'number',
          min: 0,
          max: 255,
          step: 1,
          label: 'escBeepStrength',
        },
        {
          name: 'BEACON_STRENGTH',
          type: 'number',
          min: 0,
          max: 255,
          step: 1,
          label: 'escBeaconStrength',
        },
        {
          name: 'BEACON_DELAY',
          type: 'enum',
          label: 'escBeaconDelay',
          options: [
            {
              value: '1',
              label: '1 minute',
            },
            {
              value: '2',
              label: '2 minutes',
            },
            {
              value: '3',
              label: '5 minutes',
            },
            {
              value: '4',
              label: '10 minutes',
            },
            {
              value: '5',
              label: 'Infinite',
            },
          ],
        },
        {
          name: 'STARTUP_BEEP',
          type: 'bool',
          label: 'escStartupBeep',
        },
        {
          name: 'DITHERING',
          type: 'bool',
          label: 'escDithering',
        },
      ],
    },
  },

  // BLHeli_S
  '33': {
    MULTI: {
      base: [
        {
          name: '_PROGRAMMING_BY_TX',
          type: 'bool',
          label: 'escProgrammingByTX',
        },
        {
          name: 'RPM_POWER_SLOPE',
          type: 'enum',
          options: [
            {
              value: '1',
              label: '0.031',
            },
            {
              value: '2',
              label: '0.047',
            },
            {
              value: '3',
              label: '0.063',
            },
            {
              value: '4',
              label: '0.094',
            },
            {
              value: '5',
              label: '0.125',
            },
            {
              value: '6',
              label: '0.188',
            },
            {
              value: '7',
              label: '0.25',
            },
            {
              value: '8',
              label: '0.38',
            },
            {
              value: '9',
              label: '0.50',
            },
            {
              value: '10',
              label: '0.75',
            },
            {
              value: '11',
              label: '1.00',
            },
            {
              value: '12',
              label: '1.25',
            },
            {
              value: '13',
              label: '1.50',
            },
          ],
          label: 'escStartupPower',
        },
        {
          name: 'TEMPERATURE_PROTECTION',
          type: 'enum',
          label: 'escTemperatureProtection',
          options: [
            {
              value: '0',
              label: 'Disabled',
            },
            {
              value: '1',
              label: '80C',
            },
            {
              value: '2',
              label: '90 C',
            },
            {
              value: '3',
              label: '100 C',
            },
            {
              value: '4',
              label: '110 C',
            },
            {
              value: '5',
              label: '120 C',
            },
            {
              value: '6',
              label: '130 C',
            },
            {
              value: '7',
              label: '140 C',
            },
          ],
        },
        {
          name: '_LOW_RPM_POWER_PROTECTION',
          type: 'bool',
          label: 'escLowRPMPowerProtection',
        },
        {
          name: 'BRAKE_ON_STOP',
          type: 'bool',
          label: 'escBrakeOnStop',
        },
        {
          name: 'DEMAG_COMPENSATION',
          type: 'enum',
          label: 'escDemagCompensation',
          options: [
            {
              value: '1',
              label: 'Off',
            },
            {
              value: '2',
              label: 'Low',
            },
            {
              value: '3',
              label: 'High',
            },
          ],
        },
        {
          name: 'COMMUTATION_TIMING',
          type: 'enum',
          label: 'escMotorTiming',
          options: [
            {
              value: '1',
              label: 'Low',
            },
            {
              value: '2',
              label: 'MediumLow',
            },
            {
              value: '3',
              label: 'Medium',
            },
            {
              value: '4',
              label: 'MediumHigh',
            },
            {
              value: '5',
              label: 'High',
            },
          ],
        },
        {
          name: 'BEEP_STRENGTH',
          type: 'number',
          min: 1,
          max: 255,
          step: 1,
          label: 'escBeepStrength',
        },
        {
          name: 'BEACON_STRENGTH',
          type: 'number',
          min: 1,
          max: 255,
          step: 1,
          label: 'escBeaconStrength',
        },
        {
          name: 'BEACON_DELAY',
          type: 'enum',
          label: 'escBeaconDelay',
          options: [
            {
              value: '1',
              label: '1 minute',
            },
            {
              value: '2',
              label: '2 minutes',
            },
            {
              value: '3',
              label: '5 minutes',
            },
            {
              value: '4',
              label: '10 minutes',
            },
            {
              value: '5',
              label: 'Infinite',
            },
          ],
        },
      ],
    },

    // There is no MAIN nor MULTI mode in BLHeli_S, added for completeness
    MAIN: { base: [] },
    TAIL: { base: [] },
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

  STARTUP_MELODY: {
    offset: 0x70, size: 128,
  },
};

const INDIVIDUAL_SETTINGS = [
  {
    name: 'MOTOR_DIRECTION',
    type: 'enum',
    label: 'escMotorDirection',
    options: [
      {
        value: '1', label: 'Normal',
      },
      {
        value: '2', label: 'Reversed',
      },
      {
        value: '3', label: 'Bidirectional',
      },
      {
        value: '4', label: 'Bidirectional Reversed',
      },
    ],
  },
];

const INDIVIDUAL_SETTINGS_203 = [
  {
    name: 'MOTOR_DIRECTION',
    type: 'enum',
    label: 'escMotorDirection',
    options: [
      {
        value: '1', label: 'Normal',
      },
      {
        value: '2', label: 'Reversed',
      },
      {
        value: '3', label: 'Bidirectional',
      },
      {
        value: '4', label: 'Bidirectional Reversed',
      },
    ],
  },
  {
    name: 'STARTUP_MELODY',
    type: 'melody',
    label: 'startupMelody',
    value: [53, 66, 5, 0, 77, 45, 5, 0, 53, 66, 5, 0, 92, 38, 200, 0, 77, 45, 140,  25, 140, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    melodyLength: 128
  },
];

const BLHELI_S_INDIVIDUAL_SETTINGS_BACKWARD = [
  {
    name: 'MOTOR_DIRECTION', type: 'enum', label: 'escMotorDirection',
    options: [
      {
        value: '1', label: 'Normal',
      },
      {
        value: '2', label: 'Reversed',
      },
      {
        value: '3', label: 'Bidirectional',
      },
      {
        value: '4', label: 'Bidirectional Reversed',
      },
    ],
  },
  {
    name: '_PPM_MIN_THROTTLE',
    type: 'number',
    min: 1000,
    max: 1500,
    step: 4,
    label: 'escPPMMinThrottle',
    offset: 1000,
    factor: 4,
    suffix: ' μs',
  },
  {
    name: '_PPM_MAX_THROTTLE',
    type: 'number',
    min: 1504,
    max: 2020,
    step: 4,
    label: 'escPPMMaxThrottle',
    offset: 1000,
    factor: 4,
    suffix: ' μs',
  },
  {
    name: '_PPM_CENTER_THROTTLE',
    type: 'number',
    min: 1000,
    max: 2020,
    step: 4,
    label: 'escPPMCenterThrottle',
    offset: 1000,
    factor: 4,
    suffix: ' μs',
    visibleIf: (settings) => [3, 4].includes(settings.MOTOR_DIRECTION),
  },
];

const INDIVIDUAL_SETTINGS_DESCRIPTIONS = {
  '203': { base: INDIVIDUAL_SETTINGS_203 },
  '202': { base: INDIVIDUAL_SETTINGS },
  '201': { base: INDIVIDUAL_SETTINGS },
  '200': { base: INDIVIDUAL_SETTINGS },
  '33': { base: BLHELI_S_INDIVIDUAL_SETTINGS_BACKWARD },
};

var DEFAULTS = {
  '203': { // only adds damping mode
    RPM_POWER_SLOPE: 9,
    MOTOR_DIRECTION: 1,
    COMMUTATION_TIMING: 4,
    BEEP_STRENGTH: 40,
    BEACON_STRENGTH: 80,
    BEACON_DELAY: 4,
    DEMAG_COMPENSATION: 2,
    TEMPERATURE_PROTECTION: 7,
    BRAKE_ON_STOP: 0,
    LED_CONTROL: 0,

    STARTUP_POWER_MIN: 51,
    STARTUP_BEEP: 1,
    DITHERING: 1,

    STARTUP_POWER_MAX: 25,
    DAMPING_MODE: 2,
    STARTUP_MELODY: [53, 66, 5, 0, 77, 45, 5, 0, 53, 66, 5, 0, 92, 38, 200, 0, 77, 45, 140,  25, 140, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  '202': { // only adds damping mode
    RPM_POWER_SLOPE: 9,
    MOTOR_DIRECTION: 1,
    COMMUTATION_TIMING: 4,
    BEEP_STRENGTH: 40,
    BEACON_STRENGTH: 80,
    BEACON_DELAY: 4,
    DEMAG_COMPENSATION: 2,
    TEMPERATURE_PROTECTION: 7,
    BRAKE_ON_STOP: 0,
    LED_CONTROL: 0,

    STARTUP_POWER_MIN: 51,
    STARTUP_BEEP: 1,
    DITHERING: 1,

    STARTUP_POWER_MAX: 25,
    DAMPING_MODE: 2,
  },
  '201': { // v0.10
    RPM_POWER_SLOPE: 9,
    MOTOR_DIRECTION: 1,
    COMMUTATION_TIMING: 4,
    BEEP_STRENGTH: 40,
    BEACON_STRENGTH: 80,
    BEACON_DELAY: 4,
    DEMAG_COMPENSATION: 2,
    TEMPERATURE_PROTECTION: 7,
    BRAKE_ON_STOP: 0,
    LED_CONTROL: 0,

    STARTUP_POWER_MIN: 51,
    STARTUP_BEEP: 1,
    DITHERING: 1,

    STARTUP_POWER_MAX: 25,
  },
  '200': { // v0.9
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
  },
  // BLHeli_S
  '33': {
    RPM_POWER_SLOPE: 9, // Backward: STARTUP_POWER
    MOTOR_DIRECTION: 1,
    _PROGRAMMING_BY_TX: 1, // Backward
    COMMUTATION_TIMING: 3,
    _PPM_MIN_THROTTLE: 37, // Backward
    _PPM_MAX_THROTTLE: 208, // Backward
    BEEP_STRENGTH: 40,
    BEACON_STRENGTH: 80,
    BEACON_DELAY: 4,
    DEMAG_COMPENSATION: 2,
    _PPM_CENTER_THROTTLE: 122, // Backward
    TEMPERATURE_PROTECTION: 7,
    _LOW_RPM_POWER_PROTECTION: 1, // Backward
    BRAKE_ON_STOP: 0,
    LED_CONTROL: 0,
  },
};

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
