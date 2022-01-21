const SETTINGS_DESCRIPTIONS = {};

// V0.9
SETTINGS_DESCRIPTIONS['200'] = {
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
};

// V0.10
SETTINGS_DESCRIPTIONS['201'] = {
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
};

// inherit settings descriptions and also retain ordering
function merge_inherited_descriptions (descs) {
  for (let i = 0; i < descs.base.length; i += 1) {
    if (descs.base[i].inherit) {
      descs.base[i] = descs.base[i].inherit.base.find((s) => s.name === descs.base[i].name);
    }
  }
}

merge_inherited_descriptions(SETTINGS_DESCRIPTIONS['201']);

// 201 with damping mode
SETTINGS_DESCRIPTIONS['202'] = {
  base: [
    ...SETTINGS_DESCRIPTIONS['201'].base,
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
    }],
};

SETTINGS_DESCRIPTIONS['203'] = {
  base: [
    ...SETTINGS_DESCRIPTIONS['201'].base.filter((s) => s.name !== 'STARTUP_BEEP'),
  ],
};

SETTINGS_DESCRIPTIONS['204'] = {
  base: [
    ...SETTINGS_DESCRIPTIONS['203'].base,
    {
      name: 'BRAKING_STRENGTH',
      type: 'number',
      min: 0,
      max: 255,
      step: 1,
      label: 'escBrakingStrength',
    },
  ],
};

SETTINGS_DESCRIPTIONS['205'] = {
  base: [
    ...SETTINGS_DESCRIPTIONS['204'].base,
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
    },
  ],
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
}];

const INDIVIDUAL_SETTINGS_DESCRIPTIONS = {
  '205': { base: INDIVIDUAL_SETTINGS_203 },
  '204': { base: INDIVIDUAL_SETTINGS_203 },
  '203': { base: INDIVIDUAL_SETTINGS_203 },
  '202': { base: INDIVIDUAL_SETTINGS },
  '201': { base: INDIVIDUAL_SETTINGS },
  '200': { base: INDIVIDUAL_SETTINGS },
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

DEFAULTS['205'] = {
  ...DEFAULTS['204'],
  STARTUP_BEEP: 1,
  STARTUP_MELODY_WAIT_MS: 0,
};

const settings = {
  DEFAULTS,
  INDIVIDUAL_SETTINGS_DESCRIPTIONS,
  SETTINGS_DESCRIPTIONS,
};

export default settings;
