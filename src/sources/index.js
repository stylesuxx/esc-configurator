import {
  PLATFORMS,
  SILABS_TYPES,
  ARM_TYPES,
} from './Source';

import blheliSource from './Blheli';
import bluejaySource from './Bluejay';
import am32Source from './AM32';

// TODO: Needs implementation
// import blheliMConfig from './BlheliM';

const sources = [
  bluejaySource,
  blheliSource,
  am32Source,
  // blheliMConfig,
];

export {
  PLATFORMS,
  SILABS_TYPES,
  ARM_TYPES,
  blheliSource,
  bluejaySource,
  am32Source,
};

export default sources;
