import Source from '../Source';

const OPEN_ESC_VERSIONS_LOCAL = './versions.json';
const OPEN_ESC_ESCS_LOCAL = './escs.json';

const OPEN_ESC_VERSIONS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/open_esc_versions.json';
const OPEN_ESC_ESCS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/open_esc_escs.json';

const pwmOptions = [];
const openEscConfig = new Source(
  'openEsc',
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
