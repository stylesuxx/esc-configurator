const OPEN_ESC_TYPES = { ARM: 'Arm' };

const OPEN_ESC_RESET_DELAY_MS = 1000;

const OPEN_ESC_PAGE_SIZE = 0x0400;
const OPEN_ESC_EEPROM_OFFSET = 0x7c00;
const OPEN_ESC_LAYOUT_SIZE = 0x30;

const OPEN_ESC_LAYOUT = {
  BOOT_BYTE: {
    offset: 0x00,
    size: 1,
  },
  LAYOUT_REVISION: {
    offset: 0x01,
    size: 1,
  },
  BOOT_LOADER_REVISION: {
    offset: 0x02,
    size: 1,
  },
  MAIN_REVISION: {
    offset: 0x03,
    size: 1,
  },
  SUB_REVISION: {
    offset: 0x04,
    size: 1,
  },
  NAME: {
    offset: 0x05,
    size: 12,
  },
  MOTOR_DIRECTION: {
    offset: 0x11,
    size: 1,
  },
  BIDIRECTIONAL_MODE: {
    offset: 0x12,
    size: 1,
  },
  SINUSOIDAL_STARTUP: {
    offset: 0x13,
    size: 1,
  },
  COMPLEMENTARY_PWM: {
    offset: 0x14,
    size: 1,
  },
  VARIABLE_PWM_FREQUENCY: {
    offset: 0x15,
    size: 1,
  },
  STUCK_ROTOR_PROTECTION: {
    offset: 0x16,
    size: 1,
  },
  TIMING_ADVANCE: {
    offset: 0x17,
    size: 1,
  },
  PWM_FREQUENCY: {
    offset: 0x18,
    size: 1,
  },
  STARTUP_POWER: {
    offset: 0x19,
    size: 1,
  },
  MOTOR_KV: {
    offset: 0x1a,
    size: 1,
  },
  MOTOR_POLES: {
    offset: 0x1b,
    size: 1,
  },
  BRAKE_ON_STOP: {
    offset: 0x1c,
    size: 1,
  },
  STALL_PROTECTION: {
    offset: 0x1d,
    size: 1,
  },
  BEEP_VOLUME: {
    offset: 0x1e,
    size: 1,
  },
  INTERVAL_TELEMETRY:{
    offset: 0x1f,
    size: 1,
  },
  SERVO_LOW_THRESHOLD: {
    offset: 0x20,
    size: 1,
  },
  SERVO_HIGH_THRESHOLD: {
    offset: 0x21,
    size: 1,
  },
  SERVO_NEUTRAL: {
    offset: 0x22,
    size: 1,
  },
  SERVO_DEAD_BAND: {
    offset: 0x23,
    size: 1,
  },
  LOW_VOLTAGE_CUTOFF: {
    offset: 0x24,
    size: 1,
  },
  LOW_VOLTAGE_THRESHOLD: {
    offset: 0x25,
    size: 1,
  },
  RC_CAR_REVERSING: {
    offset: 0x26,
    size: 1,
  },
};

const OPEN_ESC_SETTINGS_LAYOUT_0 = [
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

const OPEN_ESC_SETTINGS_LAYOUT_1 = [
  {
    name: 'SINUSOIDAL_STARTUP', type: 'bool', label: 'escSinusoidalStartup'
  },
  {
    name: 'COMPLEMENTARY_PWM', type: 'bool', label: 'escComplementaryPwm'
  },
  {
    name: 'VARIABLE_PWM_FREQUENCY', type: 'bool', label: 'escVariablePwmFrequency'
  },
  {
    name: 'STUCK_ROTOR_PROTECTION', type: 'bool', label: 'escStuckRotorProtection'
  },
  {
    name: 'STALL_PROTECTION', type: 'bool', label: 'escStallProtection'
  },
  {
    name: 'TIMING_ADVANCE', type: 'number', min: 0, max: 22.5, step: 7.5, label: 'escTimingAdvance', displayFactor: 7.5
  },
  {
    name: 'MOTOR_KV', type: 'number', min: 20, max: 10220, step: 40, label: 'escMotorKv', displayFactor: 40, displayOffset: 20
  },
  {
    name: 'MOTOR_POLES', type: 'number', min: 2, max: 36, step: 1, label: 'escMotorPoles'
  },
  {
    name: 'STARTUP_POWER', type: 'number', min: 50, max: 150, step: 1, label: 'escStartupPower'
  },
  {
    name: 'PWM_FREQUENCY', type: 'number', min: 24, max: 48, step: 1, label: 'escPwmFrequency',
    visibleIf: (settings) => settings.VARIABLE_PWM_FREQUENCY === 0
  },
  {
    name: 'BRAKE_ON_STOP', type: 'bool', label: 'escBrakeOnStop'
  },
  {
    name: 'BEEP_VOLUME', type: 'number', min: 0, max: 11, step: 1, label: 'escBeepVolume'
  },
  {
    name: 'INTERVAL_TELEMETRY', type: 'bool', label: 'escIntervalTelemetry'
  },
  {
    name: 'SERVO_LOW_THRESHOLD', type: 'number', min: 750, max: 1250, step: 1, label: 'escServoLowThreshold', displayFactor: 2, displayOffset: 750
  },
  {
    name: 'SERVO_HIGH_THRESHOLD',type: 'number', min: 1750, max: 2250, step: 1, label: 'escServoHighThreshold', displayFactor: 2, displayOffset: 1750
  },
  {
    name: 'SERVO_NEUTRAL', type: 'number', min: 1374, max: 1630, step: 1, label: 'escServoNeutral' , displayFactor: 1, displayOffset: 1374
  },
  {
    name: 'SERVO_DEAD_BAND', type: 'number', min: 0, max: 100, step: 1, label: 'escServoDeadBand'
  },
  {
    name: 'LOW_VOLTAGE_CUTOFF', type: 'bool', label: 'escLowVoltageCutoff'
  },
  {
    name: 'LOW_VOLTAGE_THRESHOLD', type: 'number', min: 250, max: 350, step: 1, label: 'escLowVoltageThreshold' ,displayFactor: 1,  displayOffset: 250
  },
  {
    name: 'RC_CAR_REVERSING', type: 'bool', label: 'escRcCarReversing'
  },
];

const OPEN_ESC_SETTINGS_DESCRIPTIONS = {
  '0': { base: OPEN_ESC_SETTINGS_LAYOUT_0 },
  '1': { base: OPEN_ESC_SETTINGS_LAYOUT_1 },
};

const OPEN_ESC_INDIVIDUAL_SETTINGS = [
  {
    name: 'MOTOR_DIRECTION', type: 'bool', label: 'escDirectionReversed',
  },
  {
    name: 'BIDIRECTIONAL_MODE', type: 'bool', label: 'escBidirectionalMode',
  },
];

const OPEN_ESC_INDIVIDUAL_SETTINGS_DESCRIPTIONS = {
  '0': { base: OPEN_ESC_INDIVIDUAL_SETTINGS },
  '1': { base: OPEN_ESC_INDIVIDUAL_SETTINGS }
};

var OPEN_ESC_DEFAULTS = {
  '0': {
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
  },
  '1': {
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
    BEEP_VOLUME: 5,
    INTERVAL_TELEMETRY: 0,
    SERVO_LOW_THRESHOLD: 128,
    SERVO_HIGH_THRESHOLD: 128,
    SERVO_NEUTRAL: 128,
    SERVO_DEAD_BAND: 50,
    LOW_VOLTAGE_CUTOFF: 0,
    LOW_VOLTAGE_THRESHOLD: 50,
    RC_CAR_REVERSING: 0,
  }
};

export {
  OPEN_ESC_TYPES,
  OPEN_ESC_LAYOUT,
  OPEN_ESC_DEFAULTS,
  OPEN_ESC_PAGE_SIZE,
  OPEN_ESC_LAYOUT_SIZE,
  OPEN_ESC_EEPROM_OFFSET,
  OPEN_ESC_RESET_DELAY_MS,
  OPEN_ESC_SETTINGS_DESCRIPTIONS,
  OPEN_ESC_INDIVIDUAL_SETTINGS_DESCRIPTIONS,
};
