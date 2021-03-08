import Source from '../Source';

import BLHELI_VERSIONS_LOCAL from './versions.json';
import BLHELI_ESCS_LOCAL from './escs.json';

const BLHELI_VERSIONS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_versions.json';
const BLHELI_ESCS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_escs.json';

const blheliConfig = new Source(
  'blheli',
  BLHELI_VERSIONS_REMOTE,
  BLHELI_ESCS_REMOTE,
  BLHELI_VERSIONS_LOCAL,
  BLHELI_ESCS_LOCAL
);

export {
  BLHELI_VERSIONS_REMOTE,
  BLHELI_VERSIONS_LOCAL,
  BLHELI_ESCS_REMOTE,
  BLHELI_ESCS_LOCAL,
  blheliConfig,
};
