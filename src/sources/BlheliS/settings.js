// layout 33, 16.3, 16.4, 16.5
const SETTINGS_LAYOUT_33 = [
  {
    name: "PROGRAMMING_BY_TX",
    type: "bool",
    label: "escProgrammingByTX",
  },
  {
    name: "STARTUP_POWER",
    type: "enum",
    options: [
      {
        value: "1",
        label: "0.031",
      },
      {
        value: "2",
        label: "0.047",
      },
      {
        value: "3",
        label: "0.063",
      },
      {
        value: "4",
        label: "0.094",
      },
      {
        value: "5",
        label: "0.125",
      },
      {
        value: "6",
        label: "0.188",
      },
      {
        value: "7",
        label: "0.25",
      },
      {
        value: "8",
        label: "0.38",
      },
      {
        value: "9",
        label: "0.50",
      },
      {
        value: "10",
        label: "0.75",
      },
      {
        value: "11",
        label: "1.00",
      },
      {
        value: "12",
        label: "1.25",
      },
      {
        value: "13",
        label: "1.50",
      },
    ],
    label: "escStartupPower",
  },
  {
    name: "TEMPERATURE_PROTECTION",
    type: "enum",
    label: "escTemperatureProtection",
    options: [
      {
        value: "0",
        label: "Disabled",
      },
      {
        value: "1",
        label: "80C",
      },
      {
        value: "2",
        label: "90 C",
      },
      {
        value: "3",
        label: "100 C",
      },
      {
        value: "4",
        label: "110 C",
      },
      {
        value: "5",
        label: "120 C",
      },
      {
        value: "6",
        label: "130 C",
      },
      {
        value: "7",
        label: "140 C",
      },
    ],
  },
  {
    name: "LOW_RPM_POWER_PROTECTION",
    type: "bool",
    label: "escLowRPMPowerProtection",
  },
  {
    name: "BRAKE_ON_STOP",
    type: "bool",
    label: "escBrakeOnStop",
  },
  {
    name: "DEMAG_COMPENSATION",
    type: "enum",
    label: "escDemagCompensation",
    options: [
      {
        value: "1",
        label: "Off",
      },
      {
        value: "2",
        label: "Low",
      },
      {
        value: "3",
        label: "High",
      },
    ],
  },
  {
    name: "COMMUTATION_TIMING",
    type: "enum",
    label: "escMotorTiming",
    options: [
      {
        value: "1",
        label: "Low",
      },
      {
        value: "2",
        label: "MediumLow",
      },
      {
        value: "3",
        label: "Medium",
      },
      {
        value: "4",
        label: "MediumHigh",
      },
      {
        value: "5",
        label: "High",
      },
    ],
  },
  {
    name: "BEEP_STRENGTH",
    type: "number",
    min: 1,
    max: 255,
    step: 1,
    label: "escBeepStrength",
  },
  {
    name: "BEACON_STRENGTH",
    type: "number",
    min: 1,
    max: 255,
    step: 1,
    label: "escBeaconStrength",
  },
  {
    name: "BEACON_DELAY",
    type: "enum",
    label: "escBeaconDelay",
    options: [
      {
        value: "1",
        label: "1 minute",
      },
      {
        value: "2",
        label: "2 minutes",
      },
      {
        value: "3",
        label: "5 minutes",
      },
      {
        value: "4",
        label: "10 minutes",
      },
      {
        value: "5",
        label: "Infinite",
      },
    ],
  },
];

// layout 32, 16.0, 16.1, 16.2
const SETTINGS_LAYOUT_32 = [
  {
    name: "PROGRAMMING_BY_TX",
    type: "bool",
    label: "escProgrammingByTX",
  },
  {
    name: "STARTUP_POWER",
    type: "enum",
    options: [
      {
        value: "1",
        label: "0.031",
      },
      {
        value: "2",
        label: "0.047",
      },
      {
        value: "3",
        label: "0.063",
      },
      {
        value: "4",
        label: "0.094",
      },
      {
        value: "5",
        label: "0.125",
      },
      {
        value: "6",
        label: "0.188",
      },
      {
        value: "7",
        label: "0.25",
      },
      {
        value: "8",
        label: "0.38",
      },
      {
        value: "9",
        label: "0.50",
      },
      {
        value: "10",
        label: "0.75",
      },
      {
        value: "11",
        label: "1.00",
      },
      {
        value: "12",
        label: "1.25",
      },
      {
        value: "13",
        label: "1.50",
      },
    ],
    label: "escStartupPower",
  },
  {
    name: "TEMPERATURE_PROTECTION",
    type: "bool",
    label: "escTemperatureProtection",
  },
  {
    name: "LOW_RPM_POWER_PROTECTION",
    type: "bool",
    label: "escLowRPMPowerProtection",
  },
  {
    name: "BRAKE_ON_STOP",
    type: "bool",
    label: "escBrakeOnStop",
  },
  {
    name: "DEMAG_COMPENSATION",
    type: "enum",
    label: "escDemagCompensation",
    options: [
      {
        value: "1",
        label: "Off",
      },
      {
        value: "2",
        label: "Low",
      },
      {
        value: "3",
        label: "High",
      },
    ],
  },
  {
    name: "COMMUTATION_TIMING",
    type: "enum",
    label: "escMotorTiming",
    options: [
      {
        value: "1",
        label: "Low",
      },
      {
        value: "2",
        label: "MediumLow",
      },
      {
        value: "3",
        label: "Medium",
      },
      {
        value: "4",
        label: "MediumHigh",
      },
      {
        value: "5",
        label: "High",
      },
    ],
  },
  {
    name: "BEEP_STRENGTH",
    type: "number",
    min: 1,
    max: 255,
    step: 1,
    label: "escBeepStrength",
  },
  {
    name: "BEACON_STRENGTH",
    type: "number",
    min: 1,
    max: 255,
    step: 1,
    label: "escBeaconStrength",
  },
  {
    name: "BEACON_DELAY",
    type: "enum",
    label: "escBeaconDelay",
    options: [
      {
        value: "1",
        label: "1 minute",
      },
      {
        value: "2",
        label: "2 minutes",
      },
      {
        value: "3",
        label: "5 minutes",
      },
      {
        value: "4",
        label: "10 minutes",
      },
      {
        value: "5",
        label: "Infinite",
      },
    ],
  },
];

const SETTINGS_DESCRIPTIONS = {
  33: {
    MULTI: { base: SETTINGS_LAYOUT_33 },
    // There is no MAIN nor MULTI mode in BLHeli_S, added for completeness
    MAIN: { base: [] },
    TAIL: { base: [] },
  },
  32: {
    MULTI: { base: SETTINGS_LAYOUT_32 },
    // There is no MAIN nor MULTI mode in BLHeli_S, added for completeness
    MAIN: { base: [] },
    TAIL: { base: [] },
  },
};

// @todo add validation for min/max throttle
const INDIVIDUAL_SETTINGS = [
  {
    name: "MOTOR_DIRECTION",
    type: "enum",
    label: "escMotorDirection",
    options: [
      {
        value: "1",
        label: "Normal",
      },
      {
        value: "2",
        label: "Reversed",
      },
      {
        value: "3",
        label: "Bidirectional",
      },
      {
        value: "4",
        label: "Bidirectional Reversed",
      },
    ],
  },
  {
    name: "PPM_MIN_THROTTLE",
    type: "number",
    min: 1000,
    max: 1500,
    step: 4,
    label: "escPPMMinThrottle",
    offset: 1000,
    factor: 4,
    suffix: " μs",
  },
  {
    name: "PPM_MAX_THROTTLE",
    type: "number",
    min: 1504,
    max: 2020,
    step: 4,
    label: "escPPMMaxThrottle",
    offset: 1000,
    factor: 4,
    suffix: " μs",
  },
  {
    name: "PPM_CENTER_THROTTLE",
    type: "number",
    min: 1000,
    max: 2020,
    step: 4,
    label: "escPPMCenterThrottle",
    offset: 1000,
    factor: 4,
    suffix: " μs",
    visibleIf: (settings) => [3, 4].includes(settings.MOTOR_DIRECTION),
  },
];

const INDIVIDUAL_SETTINGS_DESCRIPTIONS = {
  33: { base: INDIVIDUAL_SETTINGS },
  32: { base: INDIVIDUAL_SETTINGS },
};

const DEFAULTS = {
  33: {
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
    LED_CONTROL: 0,
  },
  32: {
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
    LED_CONTROL: 0,
  },
};

const settings = {
  DEFAULTS,
  INDIVIDUAL_SETTINGS_DESCRIPTIONS,
  SETTINGS_DESCRIPTIONS,
};

export default settings;
