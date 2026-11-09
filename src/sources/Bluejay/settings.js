const COMMON = {};

// V0.9
COMMON['200'] = {
  base: [
    {
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
    },
    {
      name: 'STARTUP_POWER_MIN',
      type: 'number',
      label: 'escMinStartupPower',
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
      group: 'bluejaySafety',
      order: 10,
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
      group: 'bluejayBrake',
      order: 0,
    },
    {
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
    },
    {
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
    },
    {
      name: 'BEEP_STRENGTH',
      type: 'number',
      min: 0,
      max: 255,
      step: 1,
      label: 'escBeepStrength',
      group: 'bluejayBeacon',
      order: 0,
    },
    {
      name: 'BEACON_STRENGTH',
      type: 'number',
      min: 0,
      max: 255,
      step: 1,
      label: 'escBeaconStrength',
      group: 'bluejayBeacon',
      order: 10,
    },
    {
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
      group: 'bluejayBeacon',
      order: 20,
    },
    {
      name: 'STARTUP_BEEP',
      type: 'bool',
      label: 'escStartupBeep',
      group: 'bluejayBeacon',
      order: 30,
    },
    {
      name: 'DITHERING',
      type: 'bool',
      label: 'escDithering',
      group: 'bluejayExperimental',
      order: 0,
    },
  ],
};

// V0.10
COMMON['201'] = {
  base: [{
    name: 'STARTUP_POWER_MIN',
    inherit: COMMON['200'],
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
    inherit: COMMON['200'],
  }, {
    name: 'COMMUTATION_TIMING',
    inherit: COMMON['200'],
  }, {
    name: 'DEMAG_COMPENSATION',
    inherit: COMMON['200'],
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
    inherit: COMMON['200'],
  }, {
    name: 'BEACON_STRENGTH',
    inherit: COMMON['200'],
  }, {
    name: 'BEACON_DELAY',
    inherit: COMMON['200'],
  }, {
    name: 'STARTUP_BEEP',
    inherit: COMMON['200'],
  }, {
    name: 'DITHERING',
    inherit: COMMON['200'],
  }, {
    name: 'BRAKE_ON_STOP',
    inherit: COMMON['200'],
  }],
};

// inherit settings descriptions and also retain ordering
function merge_inherited_descriptions (descs) {
  for (let i = 0; i < descs.base.length; i += 1) {
    if (descs.base[i].inherit) {
      descs.base[i] = descs.base[i].inherit.base.find((s) => s.name === descs.base[i].name);
    }
  }
}

merge_inherited_descriptions(COMMON['201']);

// 201 with damping mode
COMMON['202'] = {
  base: [
    ...COMMON['201'].base,
    {
      name: 'BRAKING_STRENGTH',
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
      group: 'bluejayBrake',
      order: 10,
    }],
};

COMMON['203'] = {
  base: [
    ...COMMON['201'].base.filter((s) => s.name !== 'STARTUP_BEEP'),
  ],
};

COMMON['204'] = {
  base: [
    ...COMMON['203'].base,
    {
      name: 'BRAKING_STRENGTH',
      type: 'number',
      min: 0,
      max: 255,
      step: 1,
      label: 'escBrakingStrength',
      group: 'bluejayBrake',
      order: 10,
    },
  ],
};

COMMON['205'] = {
  base: [
    ...COMMON['204'].base,
    {
      name: 'STARTUP_BEEP',
      type: 'enum',
      label: 'escStartupBeep',
      options: [{
        value: '0',
        label: 'Off',
      }, {
        value: '1',
        label: 'Normal',
      }, {
        value: '2',
        label: 'Custom',
      }],
    }, {
      name: 'PWM_FREQUENCY',
      type: 'enum',
      label: 'escPwmFrequency',
      options: [{
        value: '24',
        label: '24',
      }, {
        value: '48',
        label: '48',
      }, {
        value: '96',
        label: '96',
      }],
    },
  ],
};

COMMON['206'] = {
  base: [
    ...COMMON['204'].base,
    {
      name: 'POWER_RATING',
      type: 'enum',
      label: 'escPowerRating',
      options: [{
        value: '1',
        label: '1S Only',
      }, {
        value: '2',
        label: '1-2S+',
      }],
      group: 'bluejaySafety',
      order: 0,
    },
  ],
};

COMMON['207'] = {
  base: [
    ...COMMON['206'].base,
    {
      name: 'FORCE_EDT_ARM',
      type: 'bool',
      label: 'escForceEdtArm',
      group: 'bluejaySafety',
      order: 20,
    },
  ],
};

// Dithering deprecated
COMMON['208'] = { base: COMMON['207'].base.filter((item) => item.name !== 'DITHERING') };

COMMON['209'] = {
  base: [
    ...COMMON['208'].base,
    {
      name: 'PWM_FREQUENCY',
      type: 'enum',
      label: 'escPwmFrequencyBluejay',
      options: [{
        value: 24,
        label: '24kHz',
      },
      {
        value: 48,
        label: '48kHz',
      },
      {
        value: 96,
        label: '96kHz',
      },
      {
        value: 0,
        label: 'Dynamic',
      }],
    },
    {
      name: 'THRESHOLD_96to48',
      type: 'number',
      min: 0,
      max: 255,
      step: 1,
      label: '96to48Threshold',
      visibleIf: (settings) => ('PWM_FREQUENCY' in settings) && (parseInt(settings.PWM_FREQUENCY, 10) === 0),
      sanitize: (settings) => {
        if(settings.THRESHOLD_96to48 > settings.THRESHOLD_48to24) {
          return { THRESHOLD_96to48: settings.THRESHOLD_48to24 };
        }

        return {};
      },
    },
    {
      name: 'THRESHOLD_48to24',
      type: 'number',
      min: 0,
      max: 255,
      step: 1,
      label: '48to24Threshold',
      visibleIf: (settings) => ('PWM_FREQUENCY' in settings) && (parseInt(settings.PWM_FREQUENCY, 10) === 0),
    },
  ],
};

const INDIVIDUAL_SETTINGS_200 = [{
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
    label: 'Forward/Reverse (3D mode)',
  }, {
    value: '4',
    label: 'Forward/Reverse (3D mode) Reversed',
  }],
}, {
  name: 'LED_CONTROL',
  type: 'enum',
  label: 'escLedControl',
  visibleIf: (settings) => ('LAYOUT' in settings) && ['E', 'J', 'M', 'Q', 'U'].includes(settings.LAYOUT[1]),
  options: [{
    value: 0x00,
    label: 'Off',
  }, {
    value: 0x03,
    label: 'Blue',
  }, {
    value: 0x0C,
    label: 'Green',
  }, {
    value: 0x30,
    label: 'Red',
  }, {
    value: 0x0F,
    label: 'Cyan',
  }, {
    value: 0x33,
    label: 'Magenta',
  }, {
    value: 0x3C,
    label: 'Yellow',
  }, {
    value: 0x3F,
    label: 'White',
  }],
}];

const INDIVIDUAL_SETTINGS_203 = [
  ...INDIVIDUAL_SETTINGS_200,
  {
    name: 'STARTUP_MELODY',
    type: 'melody',
  },
];

const INDIVIDUAL_SETTINGS_208 = [
  ...INDIVIDUAL_SETTINGS_203,
  {
    name: 'STARTUP_MELODY_WAIT_MS',
    type: 'dummy',
  },
];

const INDIVIDUAL = {
  '209': { base: INDIVIDUAL_SETTINGS_208 },
  '208': { base: INDIVIDUAL_SETTINGS_203 },
  '207': { base: INDIVIDUAL_SETTINGS_203 },
  '206': { base: INDIVIDUAL_SETTINGS_203 },
  '205': { base: INDIVIDUAL_SETTINGS_203 },
  '204': { base: INDIVIDUAL_SETTINGS_203 },
  '203': { base: INDIVIDUAL_SETTINGS_203 },
  '202': { base: INDIVIDUAL_SETTINGS_200 },
  '201': { base: INDIVIDUAL_SETTINGS_200 },
  '200': { base: INDIVIDUAL_SETTINGS_200 },
};

const DEFAULTS = {};

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
  BRAKING_STRENGTH: 2, // Backward: DAMPING_MODE
};

DEFAULTS['203'] = { // v0.12
  ...DEFAULTS['201'],
  STARTUP_MELODY: [2, 58, 4, 32, 52, 66, 13, 0, 69, 45, 13, 0, 52, 66, 13, 0, 78, 39, 211, 0, 69, 45, 208, 25, 52, 25, 0],
};
delete DEFAULTS['203'].STARTUP_BEEP;

DEFAULTS['204'] = { // v0.15
  ...DEFAULTS['203'],
  BRAKING_STRENGTH: 255,
};

DEFAULTS['205'] = { // unreleased
  ...DEFAULTS['204'],
  STARTUP_BEEP: 1,
  STARTUP_MELODY_WAIT_MS: 0,
  PWM_FREQUENCY: 24,
};

DEFAULTS['206'] = { // v0.19
  ...DEFAULTS['204'],
  POWER_RATING: 2,
};

DEFAULTS['207'] = { // v0.20
  ...DEFAULTS['206'],
  TEMPERATURE_PROTECTION: 0,
  FORCE_EDT_ARM: 0,
  DITHERING: 0,
};

DEFAULTS['208'] = { // v0.21
  ...DEFAULTS['207'],
  STARTUP_POWER_MIN: 21,
  STARTUP_POWER_MAX: 5,
};
delete DEFAULTS['208'].DITHERING;

DEFAULTS['209'] = { // v0.22
  ...DEFAULTS['208'],
  PWM_FREQUENCY: 24,
  STARTUP_MELODY_WAIT_MS: 0,
  THRESHOLD_96to48: 85,
  THRESHOLD_48to24: 170,
};

const settings = {
  DEFAULTS,
  INDIVIDUAL,
  COMMON,
};

export default settings;
