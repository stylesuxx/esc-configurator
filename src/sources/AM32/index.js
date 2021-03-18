import Source, {
  PLATFORMS,
} from '../Source';

import AM32_VERSIONS_LOCAL from './versions.json';
import AM32_ESCS_LOCAL from './escs.json';

const AM32_VERSIONS_REMOTE = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/AM32/versions.json';
const AM32_ESCS_REMOTE = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/AM32/escs.json';

const pwmOptions = [];
const AM32Config = new Source(
  'AM32',
  PLATFORMS.ARM,
  AM32_VERSIONS_REMOTE,
  AM32_ESCS_REMOTE,
  AM32_VERSIONS_LOCAL,
  AM32_ESCS_LOCAL,
  pwmOptions
);

export {
  AM32_VERSIONS_REMOTE,
  AM32_VERSIONS_LOCAL,
  AM32_ESCS_REMOTE,
  AM32_ESCS_LOCAL,
  AM32Config,
};
