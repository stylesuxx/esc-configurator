import Source from '../Source';

import BLUEJAY_VERSIONS_LOCAL from './versions.json';
import BLUEJAY_ESCS_LOCAL from './escs.json';

const BLUEJAY_VERSIONS_REMOTE = 'https://raw.githubusercontent.com/mathiasvr/blheli-configurator/bluejay/js/bluejay_versions.json';
const BLUEJAY_ESCS_REMOTE = 'https://raw.githubusercontent.com/mathiasvr/blheli-configurator/bluejay/js/bluejay_escs.json';

const bluejayConfig = new Source(
  'bluejay',
  BLUEJAY_VERSIONS_REMOTE,
  BLUEJAY_ESCS_REMOTE,
  BLUEJAY_VERSIONS_LOCAL,
  BLUEJAY_ESCS_LOCAL
);

export {
  BLUEJAY_VERSIONS_REMOTE,
  BLUEJAY_VERSIONS_LOCAL,
  BLUEJAY_ESCS_REMOTE,
  BLUEJAY_ESCS_LOCAL,
  bluejayConfig,
};
