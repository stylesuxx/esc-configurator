const SETTINGS_LAYOUT_0 = [
    {
    name: 'TURTLEMODE_RAMPUP',
    type: 'enum',
    value: 50,
    options: [
      {
        value: 50,
        label: '50',
      },
      {
        value: 100,
        label: '100',
      },
      {
        value: 150,
        label: '150',
      },
      {
        value: 200,
        label: '200',
      },

    ],
    order: 0,
    label: 'gil32TurtleModeRampup',
    displayFactor: 1,
    displayOffset: 0,
    group: 'Turtlemode',
  },
  {
    name: 'MOTOR_THROTTLE_STARTUP',
    type: 'number',
    min: 10,
    max: 500,
    step: 10,
    value: 300,
    label: 'gil32StartupThrottle',
    displayFactor: 1,
    displayOffset: 0,
    group: 'Startup',
  },

];

const COMMON = { '65': { base: SETTINGS_LAYOUT_0 } };

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

const INDIVIDUAL = { '65': { base: INDIVIDUAL_SETTINGS_0 } };

const DEFAULT_SETTINGS_0 = {
  MOTOR_DIRECTION: 0,
  BIDIRECTIONAL_MODE: 0,
  COMPLEMENTARY_PWM: 1,
 
};

const DEFAULTS = { '65': DEFAULT_SETTINGS_0 };

const settings = {
  DEFAULTS,
  INDIVIDUAL,
  COMMON,
};

export default settings;
