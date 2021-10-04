import Source from '../Source';
import eeprom from './eeprom';
import * as escsjson from './escs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/stylesuxx/esc-configurator/master/src/sources/AM32/versions.json';

class AM32Source extends Source {
  buildDisplayName(flash, make) {
    const settings = flash.settings;
    let revision = 'Unsupported/Unrecognized';
    if(settings.MAIN_REVISION !== undefined && settings.SUB_REVISION !== undefined) {
      revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;
    }

    if(make === 'NOT READY') {
      revision = 'FLASH FIRMWARE';
    }

    const bootloader = flash.bootloader.valid ? `, Bootloader v${flash.bootloader.version} (${flash.bootloader.pin})` : ', Bootloader unknown';

    return `${make} - ${this.name}, ${revision}${bootloader}`;
  }

  getEscLayouts() {
    return escsjson.layouts.Arm;
  }

  getMcuSignatures() {
    return escsjson.signatures.Arm;
  }

  async getVersions() {
    return (await this.getVersionsList()).Arm;
  }
}

const source = new AM32Source(
  'AM32',
  VERSIONS_REMOTE,
  eeprom
);

export default source;
