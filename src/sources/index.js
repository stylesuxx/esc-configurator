import {
  PLATFORMS,
  SILABS_TYPES,
  ARM_TYPES,
} from './Source';

import {
  blheliConfig
} from './Blheli';

/*
import {
  blheliMConfig
} from './BlheliM';
*/

import {
  bluejayConfig
} from './Bluejay';

import {
  AM32Config
} from './AM32';

const sources = [
  bluejayConfig,
  // blheliMConfig,
  blheliConfig,
  AM32Config,
];

export {
  PLATFORMS,
  SILABS_TYPES,
  ARM_TYPES,
};
export default sources;
