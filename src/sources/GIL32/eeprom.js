
const BOOT_LOADER_PINS = {
  PA2: 0x02,
  PB4:105,
};

const RESET_DELAY_MS = 5000;
const LAYOUT_SIZE = 103;

const BOOT_LOADER_VERSION_OFFSET = 0x00C0;
const BOOT_LOADER_VERSION_SIZE = 1;

const LAYOUT = {
    NAME: {
    offset: 0,
    size: 12,
  },
  DESCRIPTION: {
    offset: 12,
    size: 64,
  },
  VERSION: {
    offset: 76,
    size: 1,
  },
  SUB_VERSION: {
    offset: 77,
    size: 1,
  },
  LAYOUT_REVISION: {
    offset: 78,
    size: 1,
  },
 
  MOTOR_COMMUTATION_DELAY: {
    offset: 79,
    size: 1,
  },
  MOTOR_STARTUP_THROTTLE: {
    offset: 80,
    size: 2,
  },

  TURTLEMODE_RAMPUP: {
    offset: 82,
    size: 1,
  },
  RAMPUP: {
    offset: 83,
    size: 2,
  },
  MOTOR_DIRECTION: {
    offset: 85,
    size: 1,
  },
  
  MOTOR_DIRECTION2: {
    offset: 86,
    size: 1,
  },
  CRASH_DETECTION: {
    offset: 87,
    size: 1,
  },
  FIRMWARE_DEADTIME: {
    offset: 88,
    size: 2,
  },
  PADDING: {
    offset: 90,
    size: 13,
  },  
};

const EEPROM = {
  LAYOUT,
  LAYOUT_SIZE,
  NAMES: [''],
  DESCRIPTION: [''],
  RESET_DELAY: RESET_DELAY_MS,
  BOOT_LOADER_OFFSET: BOOT_LOADER_VERSION_OFFSET,
  BOOT_LOADER_SIZE: BOOT_LOADER_VERSION_SIZE,
  BOOT_LOADER_PINS,
};

export default EEPROM;
