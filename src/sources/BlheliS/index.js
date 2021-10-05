import { BLHeliSource } from '../Blheli';
import eeprom from '../Blheli/eeprom';
import escs from './escs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_versions.json';

class BLHeliSSource extends BLHeliSource {
  getEscLayouts() {
    return escs.layouts;
  }

  getMcuSignatures() {
    return escs.mcus;
  }

  async getVersions() {
    return (await this.getVersionsList())['BLHeli_S SiLabs'];
  }
}

const blheliSSource = new BLHeliSSource(
  'BLHeli_S',
  VERSIONS_REMOTE,
  eeprom
);

export {
  blheliSSource, 
};

export default blheliSSource;
