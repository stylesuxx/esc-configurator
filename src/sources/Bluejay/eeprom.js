const LAYOUT_SIZE = 0xFF;

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
  PWM_FREQUENCY: {
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
  BRAKING_STRENGTH: {
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
    offset: 0x27,
    size: 1,
  },
  LED_CONTROL: {
    offset: 0x28,
    size: 1,
  },
  POWER_RATING: {
    offset: 0x29,
    size: 1,
  },
  FORCE_EDT_ARM: {
    offset: 0x2A,
    size: 1,
  },
  THRESHOLD_48to24: {
    offset: 0x2B,
    size: 1,
  },

  LAYOUT: {
    offset: 0x40,
    size: 16,
  },
  MCU: {
    offset: 0x50,
    size: 16,
  },
  NAME: {
    offset: 0x60,
    size: 16,
  },

  STARTUP_MELODY: {
    offset: 0x70,
    size: 128,
  },
  STARTUP_MELODY_WAIT_MS: {
    offset: 0xF0,
    size: 2,
  },
};

const EEPROM = {
  LAYOUT,
  LAYOUT_SIZE,
};

export default EEPROM;
