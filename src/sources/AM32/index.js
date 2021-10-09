import Source from '../Source';
import eeprom from './eeprom';
import settings from './settings';
import escs from './escs.json';
import versions from './versions.json';

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

  async getVersions() {
    this.setLocalVersions(versions.Arm);
    return versions.Arm;
  }

  getFirmwareUrl({
    escKey, version, url,
  }) {
    const format = (str2Format, ...args) =>
      str2Format.replace(/(\{\d+\})/g, (a) => args[+(a.substr(1, a.length - 2)) || 0]);

    const name = this.escs.layouts[escKey].fileName;

    const formattedUrl = format(
      url,
      name
    );

    return formattedUrl;
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
