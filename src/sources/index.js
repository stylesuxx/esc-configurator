import {
  PLATFORMS,
  SILABS_TYPES,
  ARM_TYPES,
} from './Source';

import am32Source from './AM32';
import blheliSource from './Blheli';
import bluejaySource from './Bluejay';

const sources = [
  am32Source,
  bluejaySource,
  blheliSource,
];

export {
  PLATFORMS,
  SILABS_TYPES,
  ARM_TYPES,
  am32Source,
  blheliSource,
  bluejaySource,
};

export default sources;
