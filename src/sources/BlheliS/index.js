import { BLHeliSource } from '../Blheli';
import eeprom from '../Blheli/eeprom';
import settings from './settings';
import escs from './escs.json';
import versions from './versions.json';

class BLHeliSSource extends BLHeliSource {
  async getVersions() {
    return versions;
  }
}

const blheliSSource = new BLHeliSSource(
  'BLHeli_S',
  {
    ...eeprom,
    ...settings,
  },
  escs
);

export default blheliSSource;
