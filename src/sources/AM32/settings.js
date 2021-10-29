const SETTINGS_LAYOUT_0 = [
  {
    name: 'SINUSOIDAL_STARTUP',
    type: 'bool',
    label: 'escSinusoidalStartup',
  },
  {
    name: 'COMPLEMENTARY_PWM',
    type: 'bool',
    label: 'escComplementaryPwm',
  },
  {
    name: 'VARIABLE_PWM_FREQUENCY',
    type: 'bool',
    label: 'escVariablePwmFrequency',
  },
  {
    name: 'STUCK_ROTOR_PROTECTION',
    type: 'bool',
    label: 'escStuckRotorProtection',
  },
  {
    name: 'STALL_PROTECTION',
    type: 'bool',
    label: 'escStallProtection',
  },
  {
    name: 'TIMING_ADVANCE',
    type: 'number',
    min: 0,
    max: 22.5,
    step: 7.5,
    label: 'escTimingAdvance',
    displayFactor: 7.5,
  },
  {
    name: 'MOTOR_KV',
    type: 'number',
    min: 20,
    max: 10220,
    step: 40,
    label: 'escMotorKv',
    displayFactor: 40,
    displayOffset: 20,
  },
  {
    name: 'MOTOR_POLES',
    type: 'number',
    min: 2,
    max: 36,
    step: 1,
    label: 'escMotorPoles',
  },
  {
    name: 'STARTUP_POWER',
    type: 'number',
    min: 50,
    max: 150,
    step: 1,
    label: 'escStartupPower',
  },
  {
    name: 'PWM_FREQUENCY',
    type: 'number',
    min: 24,
    max: 48,
    step: 1,
    label: 'escPwmFrequency',
    visibleIf: (settings) => settings.VARIABLE_PWM_FREQUENCY === 0,
  },
  {
    name: 'BRAKE_ON_STOP',
    type: 'bool',
    label: 'escBrakeOnStop',
  },
];

const SETTINGS_LAYOUT_1 = [
  ...SETTINGS_LAYOUT_0,
  {
    name: 'BEEP_VOLUME',
    type: 'number',
    label: 'escBeepVolume',
    min: 0,
    max: 11,
    step: 1,
  },
  {
    name: 'INTERVAL_TELEMETRY',
    type: 'bool',
    label: 'escIntervalTelemetry',
  },
  {
    name: 'SERVO_LOW_THRESHOLD',
    type: 'number',
    label: 'escServoLowThreshold',
    min: 750,
    max: 1250,
    step: 1,
    displayFactor: 2,
    displayOffset: 750,
  },
  {
    name: 'SERVO_HIGH_THRESHOLD',
    type: 'number',
    label: 'escServoHighThreshold',
    min: 1750,
    max: 2250,
    step: 1,
    displayFactor: 2,
    displayOffset: 1750,
  },
  {
    name: 'SERVO_NEUTRAL',
    type: 'number',
    label: 'escServoNeutral',
    min: 1374,
    max: 1630,
    step: 1,
    displayFactor: 1,
    displayOffset: 1374,
  },
  {
    name: 'SERVO_DEAD_BAND',
    type: 'number',
    label: 'escServoDeadBand',
    min: 0,
    max: 100,
    step: 1,
  },
  {
    name: 'LOW_VOLTAGE_CUTOFF',
    type: 'bool',
    label: 'escLowVoltageCutoff',
  },
  {
    name: 'LOW_VOLTAGE_THRESHOLD',
    type: 'number',
    label: 'escLowVoltageThreshold',
    min: 250,
    max: 350,
    step: 1,
    displayFactor: 1,
    displayOffset: 250,
  },
  {
    name: 'RC_CAR_REVERSING',
    type: 'bool',
    label: 'escRcCarReversing',
  },
];

const SETTINGS_LAYOUT_2 = [
  ...SETTINGS_LAYOUT_1,
  {
    name: 'USE_HALL_SENSORS',
    type: 'bool',
    label: 'escHallSensors',
  },
  {
    name: 'SINE_MODE_RANGE',
    type: 'number',
    label: 'escSineModeRange',
    min: 5,
    max: 25,
    step: 1,
  },
  {
    name: 'BRAKE_STRENGTH',
    type: 'number',
    label: 'escBrakeStrength',
    min: 1,
    max: 10,
    step: 1,
  },
];

const SETTINGS_DESCRIPTIONS = {
  '0': { base: SETTINGS_LAYOUT_0 },
  '1': { base: SETTINGS_LAYOUT_1 },
  '2': { base: SETTINGS_LAYOUT_2 },
};

const INDIVIDUAL_SETTINGS_0 = [
  {
    name: 'MOTOR_DIRECTION',
    type: 'bool',
    label: 'escDirectionReversed',
  },
  {
    name: 'BIDIRECTIONAL_MODE',
    type: 'bool',
    label: 'escBidirectionalMode',
  },
];

const INDIVIDUAL_SETTINGS_1 = [
  ...INDIVIDUAL_SETTINGS_0,
  {
    name: 'STARTUP_MELODY',
    type: 'melody',
    label: 'startupMelody',
    value: [2, 58, 4, 32, 52, 66, 13, 0, 69, 45, 13, 0, 52, 66, 13, 0, 78, 39, 211, 0, 69, 45, 208, 25, 52, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    melodyLength: 128,
  },
];

const INDIVIDUAL_SETTINGS_2 = [
  ...INDIVIDUAL_SETTINGS_1,
  {
    name: 'STARTUP_MELODY',
    type: 'melody',
    label: 'startupMelody',
    value: [2, 58, 4, 32, 52, 66, 13, 0, 69, 45, 13, 0, 52, 66, 13, 0, 78, 39, 211, 0, 69, 45, 208, 25, 52, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    melodyLength: 128,
  },
];

const INDIVIDUAL_SETTINGS_DESCRIPTIONS = {
  '0': { base: INDIVIDUAL_SETTINGS_0 },
  '1': { base: INDIVIDUAL_SETTINGS_1 },
  '2': { base: INDIVIDUAL_SETTINGS_2 },
};

const DEFAULT_SETTINGS_0 = {
  MOTOR_DIRECTION: 0,
  BIDIRECTIONAL_MODE: 0,
  SINUSOIDAL_STARTUP: 0,
  COMPLEMENTARY_PWM: 1,
  VARIABLE_PWM_FREQUENCY: 1,
  STUCK_ROTOR_PROTECTION: 1,
  TIMING_ADVANCE: 2,
  PWM_FREQUENCY: 24,
  STARTUP_POWER: 100,
  MOTOR_KV: 55,
  MOTOR_POLES: 14,
  BRAKE_ON_STOP: 1,
  STALL_PROTECTION: 0,
};

const DEFAULT_SETTINGS_1 = {
  ...DEFAULT_SETTINGS_0,
  BEEP_VOLUME: 5,
  INTERVAL_TELEMETRY: 0,
  SERVO_LOW_THRESHOLD: 128,
  SERVO_HIGH_THRESHOLD: 128,
  SERVO_NEUTRAL: 128,
  SERVO_DEAD_BAND: 50,
  LOW_VOLTAGE_CUTOFF: 0,
  LOW_VOLTAGE_THRESHOLD: 50,
  RC_CAR_REVERSING: 0,
  STARTUP_MELODY: [2, 58, 4, 32, 52, 66, 13, 0, 69, 45, 13, 0, 52, 66, 13, 0, 78, 39, 211, 0, 69, 45, 208, 25, 52, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

const DEFAULT_SETTINGS_2 = {
  ...DEFAULT_SETTINGS_1,
  USE_HALL_SENSORS: 0,
  SINE_MODE_RANGE: 8,
  BRAKE_STRENGTH: 10,
};

const DEFAULTS = {
  '0': DEFAULT_SETTINGS_0,
  '1': DEFAULT_SETTINGS_1,
  '2': DEFAULT_SETTINGS_2,
};

const settings = {
  DEFAULTS,
  INDIVIDUAL_SETTINGS_DESCRIPTIONS,
  SETTINGS_DESCRIPTIONS,
};

export default settings;
