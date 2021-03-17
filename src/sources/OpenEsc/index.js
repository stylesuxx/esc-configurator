import Source from '../Source';

import OPEN_ESC_VERSIONS_LOCAL from './versions.json';
import OPEN_ESC_ESCS_LOCAL from './escs.json';

const OPEN_ESC_VERSIONS_REMOTE = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/OpenEsc/versions.json';
const OPEN_ESC_ESCS_REMOTE = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/OpenEsc/escs.json';

const pwmOptions = [];
const openEscConfig = new Source(
  'OpenEsc',
  OPEN_ESC_VERSIONS_REMOTE,
  OPEN_ESC_ESCS_REMOTE,
  OPEN_ESC_VERSIONS_LOCAL,
  OPEN_ESC_ESCS_LOCAL,
  pwmOptions
);

export {
  OPEN_ESC_VERSIONS_REMOTE,
  OPEN_ESC_VERSIONS_LOCAL,
  OPEN_ESC_ESCS_REMOTE,
  OPEN_ESC_ESCS_LOCAL,
  openEscConfig,
};
