import { BLHeliSource } from '../Blheli';
import eeprom from '../Blheli/eeprom';
import settings from './settings';
import escs from './escs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_versions.json';

class BLHeliSSource extends BLHeliSource {
  async getVersions() {
    return (await this.getVersionsList())['BLHeli_S SiLabs'];
  }
}

const blheliSSource = new BLHeliSSource(
  'BLHeli_S',
  VERSIONS_REMOTE,
  {
    ...eeprom,
    ...settings, 
  },
  escs
);

export default blheliSSource;
