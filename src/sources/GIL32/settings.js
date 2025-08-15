const SETTINGS_LAYOUT_0 = [
    
{
    name: 'COMMUNICATION_PROTOCOL',
    type: 'enum',
    value: 1,
    options: [
      {
        value: 1,
        label: 'select one',
      },
      {
        value: 2,
        label: 'DSho300',
      },
      {
        value: 3,
        label: 'DShot600',
      },
    ],
    order: 0,
    label: 'gil32CommsProtocol',
    displayFactor: 1,
    displayOffset: 0,
    group: 'COMMS',
  },
  
  {
    name: 'COMMUNICATION_DSHOT_BI',
    value: true,
    type: 'bool',
    label: 'gil32DShotBi',
    group: 'COMMS',
  },

  
  {
    name: 'MOTOR_COMMUTATION_DELAY',
    value: 1,
    type: 'enum',
    options: [
      {
        value: 1,
        label: '0.5us',
      },
      {
        value: 2,
        label: '1.0us',
      },
      {
        value: 3,
        label: '1.5us',
      },
      {
        value: 4,
        label: '2.0us',
      },
      {
        value: 5,
        label: '2.5us',
      },
            {
        value: 6,
        label: '3.0us',
      },
    ],
    order: 0,
    label: 'gil32CommutationDelay',
    displayFactor: 1,
    displayOffset: 0,
    group: 'General',
  },
{
    name: 'MOTOR_STARTUP_THROTTLE',
    value: 300,
    type: 'number',
    min: 10,
    max: 500,
    step: 10,
    value: 300,
    label: 'gil32StartupThrottle',
    displayFactor: 1,
    displayOffset: 0,
    group: 'General',
  },
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
  

];

const COMMON = { '1': { base: SETTINGS_LAYOUT_0 } };

const INDIVIDUAL_SETTINGS_0 = [

  // {
  //   name: 'COMMUNICATION_DSHOT_BI',
  //   type: 'bool',
  //   label: 'gil32DShotBi',

  // },
  // {
  //   name: 'MOTOR_COMMUTATION_DELAY',
  //   type: 'number',
  //   label: 'gil32CommutationDelay',

  // },

  // {
  //   name: 'MOTOR_DIRECTION',
  //   type: 'bool',
  //   label: 'escDirectionReversed',
  // },

];

const INDIVIDUAL = { '1': { base: INDIVIDUAL_SETTINGS_0 } };

const DEFAULT_SETTINGS_0 = {
  COMMUNICATION_PROTOCOL: 2,
  COMMUNICATION_DSHOT_BI: true,
  MOTOR_COMMUTATION_DELAY: 4,
  MOTOR_STARTUP_THROTTLE: 100,
  TURTLEMODE_RAMPUP: 50,

 
};

const DEFAULTS = { '1': DEFAULT_SETTINGS_0 };

const settings = {
  DEFAULTS,
  INDIVIDUAL,
  COMMON,
};

export default settings;
