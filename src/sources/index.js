import AM32Source, { source as am32Source } from './AM32';
import BLHeliSource from './Blheli';
import BLHeliSilabsSource, { source as blheliSilabsSource } from './Blheli/Silabs';
import BLHeliAtmelSource, { source as blheliAtmelSource } from './Blheli/Atmel';
import BLHeliSSource, { source as blheliSSource } from './BlheliS';
import BluejaySource, { source as bluejaySource } from './Bluejay';

/**
 * This sources will be used when initally fetching firmware options during
 * application startup.
 */
const sources = [
  am32Source,
  blheliSSource,
  bluejaySource,
];

/**
 * Expose base classes of all the sources in order to be able to properly check
 * types.
 */
const classes = {
  AM32Source,
  BLHeliSource,
  BLHeliAtmelSource,
  BLHeliSilabsSource,
  BLHeliSSource,
  BluejaySource,
};

export {
  am32Source,
  blheliAtmelSource,
  blheliSilabsSource,
  blheliSSource,
  bluejaySource,
  classes,
};

export default sources;
