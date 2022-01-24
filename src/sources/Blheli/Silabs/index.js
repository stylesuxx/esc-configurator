import { BLHeliSource } from '..';
import eeprom from '../eeprom';
import settings from '../settings';
import escs from './escs.json';
import versions from './versions.json';

class BLHeliSilabsSource extends BLHeliSource {
  async getVersions() {
    return versions;
  }
}

const blheliSilabsSource = new BLHeliSilabsSource(
  'BLHeli',
  eeprom,
  settings,
  escs
);

export default blheliSilabsSource;
