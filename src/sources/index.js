import {
  PLATFORMS,
  SILABS_TYPES,
  ARM_TYPES,
} from './Source';

import am32Source from './AM32';

import {
  blheliSource,
  blheliSilabsSource, 
  blheliSSource,
} from './Blheli';

import bluejaySource from './Bluejay';

const sources = [
  am32Source,
  blheliSSource,
  bluejaySource,
];

export {
  PLATFORMS,
  SILABS_TYPES,
  ARM_TYPES,
  am32Source,
  blheliSource,
  blheliSilabsSource,
  blheliSSource,
  bluejaySource,
};

export default sources;
