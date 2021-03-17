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
  openEscConfig
} from './OpenEsc';

const sources = [
  bluejayConfig,
  // blheliMConfig,
  blheliConfig,
  openEscConfig,
];

export {
  PLATFORMS,
  SILABS_TYPES,
  ARM_TYPES,
};
export default sources;
