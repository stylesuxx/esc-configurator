import GithubSource from '../GithubSource';
import eeprom from './eeprom';
import settings from './settings';
import escs from './escs.json';

const GITHUB_REPO = 'AlkaMotors/AM32-MultiRotor-ESC-firmware';

class AM32Source extends GithubSource {
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

  async getVersions() {
    return this.getRemoteVersionsList(GITHUB_REPO);
  }

  getFirmwareUrl({
    escKey, version, url,
  }) {
    const name = this.escs.layouts[escKey].name.replace(/[\s-]/g, '_').toUpperCase();

    return `${url}${name}_${version}.hex`;
  }
}

const source = new AM32Source(
  'AM32',
  {
    ...eeprom,
    ...settings,
  },
  escs
);

export default source;
