import Source, {
  PLATFORMS,
} from '../Source';

import EEPROM, {
  buildDisplayName
} from './eeprom';

import VERSIONS_LOCAL from './versions.json';
import ESCS_LOCAL from './escs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/AM32/versions.json';
const ESCS_REMOTE = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/AM32/escs.json';

const pwmOptions = [];
const am32Config = new Source(
  'AM32',
  PLATFORMS.ARM,
  VERSIONS_REMOTE,
  ESCS_REMOTE,
  EEPROM,
  VERSIONS_LOCAL,
  ESCS_LOCAL,
  pwmOptions
);

export {
  buildDisplayName,
  EEPROM
};

export default am32Config;
