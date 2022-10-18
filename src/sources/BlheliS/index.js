import { BLHeliSource } from '../Blheli';
import eeprom from '../Blheli/eeprom';
import settingsDescriptions from './settings';
import escs from './escs.json';
import versions from './versions.json';
import Silabs from '../../utils/Hardware/Silabs';

class BLHeliSSource extends BLHeliSource {
  getMcus() {
    return Silabs.getMcus();
  }

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
