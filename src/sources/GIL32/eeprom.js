
const BOOT_LOADER_PINS = {
  PA2: 0x02,
  PB4:105,
};

const RESET_DELAY_MS = 5000;
const LAYOUT_SIZE = 24;

const BOOT_LOADER_VERSION_OFFSET = 0x00C0;
const BOOT_LOADER_VERSION_SIZE = 1;

const LAYOUT = {
    NAME: {
    offset: 0,
    size: 12,
  },
  VERSION: {
    offset: 12,
    size: 1,
  },
  SUB_VERSION: {
    offset: 13,
    size: 1,
  },
  LAYOUT_REVISION: {
    offset: 14,
    size: 1,
  },
  COMMUNICATION_PROTOCOL: {
    offset: 15,
    size: 1,
  },
  COMMUNICATION_DSHOT_BI: {
    offset: 16,
    size: 1,
  },
  MOTOR_COMMUTATION_DELAY: {
    offset: 17,
    size: 1,
  },
  MOTOR_STARTUP_THROTTLE: {
    offset: 18,
    size: 2,
  },

  TURTLEMODE_RAMPUP: {
    offset: 20,
    size: 1,
  },
  PADDING: {
    offset: 21,
    size: 3,
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
