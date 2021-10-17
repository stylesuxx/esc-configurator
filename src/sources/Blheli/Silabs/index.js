import { BLHeliSource } from '..';
import eeprom from '../eeprom';
import settings from '../settings';
import escs from './escs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_versions.json';

class BLHeliSilabsSource extends BLHeliSource {
  async getVersions() {
    return (await this.getVersionsList()).Silabs;
  }
}

const blheliSilabsSource = new BLHeliSilabsSource(
  'BLHeli',
  VERSIONS_REMOTE,
  {
    ...eeprom,
    ...settings, 
  },
  escs
);

export default blheliSilabsSource;
