import EEPROM from './eeprom';
import Source, { PLATFORMS } from '../Source';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_versions.json';
const ESCS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_escs.json';

function buildDisplayName(flash, make) {
  const settings = flash.settings;
  let revision = 'Unsupported/Unrecognized';
  if(settings.MAIN_REVISION !== undefined && settings.SUB_REVISION !== undefined) {
    revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;
  }

  if (flash.actualMake) {
    make += ` (Probably mistagged: ${flash.actualMake})`;
  }

  return `${make} - BLHeli_S, ${revision}`;
}

const pwmOptions = [];
const blheliConfig = new Source(
  'BLHeli',
  PLATFORMS.SILABS,
  VERSIONS_REMOTE,
  ESCS_REMOTE,
  EEPROM,
  pwmOptions
);

export {
  buildDisplayName,
  EEPROM,
};

export default blheliConfig;
