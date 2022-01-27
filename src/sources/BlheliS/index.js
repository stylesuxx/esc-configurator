import { BLHeliSource } from '../Blheli';
import eeprom from '../Blheli/eeprom';
import settingsDescriptions from './settings';
import escs from './escs.json';
import versions from './versions.json';

class BLHeliSSource extends BLHeliSource {
  async getVersions() {
    return versions;
  }
}

const blheliSSource = new BLHeliSSource(
  'BLHeli_S',
  eeprom,
  settingsDescriptions,
  escs
);

export default blheliSSource;
