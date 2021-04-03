import Source, { PLATFORMS } from '../Source';

import EEPROM from './eeprom';

import VERSIONS_LOCAL from './versions.json';
import ESCS_LOCAL from './escs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/AM32/versions.json';
const ESCS_REMOTE = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/AM32/escs.json';

function buildDisplayName(flash, make) {
  const settings = flash.settings;
  let revision = 'Unsupported/Unrecognized';
  if(settings.MAIN_REVISION !== undefined && settings.SUB_REVISION !== undefined) {
    revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;
  }

  if(make === 'NOT READY') {
    revision = 'FLASH FIRMWARE';
  }

  const bootloader = flash.bootloader.valid ? `, Bootloader v${flash.bootloader.version} (${flash.bootloader.pin})` : ', Bootloader unknown';

  return `${make} - AM32, ${revision}${bootloader}`;
}

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
  EEPROM,
};

export default am32Config;
