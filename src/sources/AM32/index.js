import GithubSource from '../GithubSource';
import eeprom from './eeprom';
import settingsDescriptions from './settings';
import escs from './escs.json';
import blacklist from './blacklist.json';
import patterns from './patterns.json';
import Arm from '../../utils/Hardware/Arm';

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

  getFirmwareUrl({
    escKey, version, url,
  }) {
    const name = this.escs.layouts[escKey].fileName;

    version = version.replace(/^v/, '');

    let pattern = `${url}${name}_${version}.hex`;
    if (version in patterns) {
      const replaced = patterns[version]
        .replace('${name}', name)
        .replace('${version}', version);

      pattern = `${url}${replaced}`;
    }

    return pattern;
  }

  getMcus() {
    return Arm.getMcus();
  }

  async getVersions() {
    return this.getRemoteVersionsList(GITHUB_REPO, blacklist);
  }
}

const source = new AM32Source(
  'AM32',
  eeprom,
  settingsDescriptions,
  escs
);

export default source;
