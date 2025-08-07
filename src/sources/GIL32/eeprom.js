
const BOOT_LOADER_PINS = {
  PA2: 0x02,
  PB4:105,
};

const RESET_DELAY_MS = 5000;
const LAYOUT_SIZE = 0x16;

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
    offset: 65,
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
  MOTOR_THROTTLE_STARTUP: {
    offset: 0x13,
    size: 2,
  },
  TURTLEMODE_RAMPUP: {
    offset: 0x15,
    size: 1,
  },
};

const EEPROM = {
  LAYOUT,
  LAYOUT_SIZE,
  NAMES: [''],
  RESET_DELAY: RESET_DELAY_MS,
  BOOT_LOADER_OFFSET: BOOT_LOADER_VERSION_OFFSET,
  BOOT_LOADER_SIZE: BOOT_LOADER_VERSION_SIZE,
  BOOT_LOADER_PINS,
};

export default EEPROM;
