const SETTINGS_LAYOUT_0 = [
    
  {
    name: 'MOTOR_COMMUTATION_DELAY',
    value: 1,
    type: 'enum',
    options: [
      {
        value: 0,
        label: '0 microseconds',
      },
      {
        value: 32,
        label: '0.5 microseconds',
      },
      {
        value: 64,
        label: '1.0 microsecond',
      },
      {
        value: 96,
        label: '1.5 microseconds',
      },
      {
        value: 128,
        label: '2.0 microseconds',
      },
      {
        value: 160,
        label: '2.5 microseconds',
      },
            {
        value: 192,
        label: '3.0 microseconds',
      },
    ],
    order: 0,
    label: 'gil32CommutationDelay',
    displayFactor: 1,
    displayOffset: 0,
     
},
{
    name: 'MOTOR_STARTUP_THROTTLE',
    value: 300,
    type: 'number',
    min: 100,
    max: 500,
    step: 20,
    label: 'gil32StartupThrottle',
    displayFactor: 1,
    displayOffset: 0,
    
  },
  {
    name: 'RAMPUP',
    value: 2048,
    type: 'number',
    min: 8,
    max: 2050,
    step: 10,
    label: 'gil32Rampup',
    displayFactor: 1,
    displayOffset: 0,
    
  },
  {
    name: 'TURTLEMODE_RAMPUP',
    value: 50,
    type: 'number',
    min: 10,
    max: 250,
    step: 10,
    
    label: 'gil32TurtleModeRampup',
    displayFactor: 1,
    displayOffset: 0,
   
  },
  {
    name: 'MOTOR_DIRECTION',
    type: 'bool',
    label: 'gil32MotorDirection',
   
  },
{
    name: 'CRASH_DETECTION',
    value: 0,
    type: 'number',
    min: 1,
    max: 100,
    step: 1,
    label: 'gil32CrashDetection',
    displayFactor: 1,
    displayOffset: 0,
    
  },

];

const COMMON = { '1': { base: SETTINGS_LAYOUT_0 } };

const INDIVIDUAL_SETTINGS_0 = [


  

];

const INDIVIDUAL = { '1': { base: INDIVIDUAL_SETTINGS_0 } };

const DEFAULT_SETTINGS_0 = {

  MOTOR_COMMUTATION_DELAY: 64,
  MOTOR_STARTUP_THROTTLE: 300,
  RAMPUP: 2048,
  TURTLEMODE_RAMPUP: 50,
  CRASH_DETECTION: 0,

 
};

const DEFAULTS = { '1': DEFAULT_SETTINGS_0 };

const settings = {
  DEFAULTS,
  INDIVIDUAL,
  COMMON,
};

export default settings;
