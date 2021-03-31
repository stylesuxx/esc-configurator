import Source, {
  PLATFORMS,
} from '../Source';

import EEPROM, {
  buildDisplayName,
} from './eeprom';

import VERSIONS_LOCAL from './versions.json';
import ESCS_LOCAL from './escs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/mathiasvr/bluejay-configurator/bluejay/js/bluejay_versions.json';
const ESCS_REMOTE = 'https://raw.githubusercontent.com/mathiasvr/bluejay-configurator/bluejay/js/bluejay_escs.json';

const pwmOptions = [24, 48, 96];
const bluejayConfig = new Source(
  'Bluejay',
  PLATFORMS.SILABS,
  VERSIONS_REMOTE,
  ESCS_REMOTE,
  EEPROM,
  VERSIONS_LOCAL,
  ESCS_LOCAL,
  pwmOptions
);

export {
  buildDisplayName,
  EEPROM,
};

export default bluejayConfig;
