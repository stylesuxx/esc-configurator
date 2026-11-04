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
  blheliAtmelSource,
  blheliSilabsSource,
  blheliSSource,
  bluejaySource,
];

/**
 * Expose base classes of all the sources in order to be able to properly check
 * types.
 */
const classes = {
  BLHeliSource,
  BLHeliAtmelSource,
  BLHeliSilabsSource,
  BLHeliSSource,
  BluejaySource,
};

export {
  blheliAtmelSource,
  blheliSilabsSource,
  blheliSSource,
  bluejaySource,
  classes,
};

export default sources;
