const BOOT_LOADER_PINS = {
  PA2: 0x02,
  PB4: 0x14,
};

const RESET_DELAY_MS = 1000;

const PAGE_SIZE = 0x0400;
const EEPROM_OFFSET = 0x7c00;
const LAYOUT_SIZE = 0x30;

const FLASH_VERSION_OFFSET = 0x10C0;
const FLASH_VERSION_SIZE = 14;

const BOOT_LOADER_VERSION_OFFSET = 0x00C0;
const BOOT_LOADER_VERSION_SIZE = 1;

const LAYOUT = {
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

const EEPROM = {
  EEPROM_OFFSET,
  LAYOUT,
  LAYOUT_SIZE,
  NAMES: [''],
  PAGE_SIZE,
  RESET_DELAY: RESET_DELAY_MS,
  VERSION_OFFSET: FLASH_VERSION_OFFSET,
  VERSION_SIZE: FLASH_VERSION_SIZE,
  BOOT_LOADER_OFFSET: BOOT_LOADER_VERSION_OFFSET,
  BOOT_LOADER_SIZE: BOOT_LOADER_VERSION_SIZE,
  BOOT_LOADER_PINS,
};

export default EEPROM;
