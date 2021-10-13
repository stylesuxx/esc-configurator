import { BLHeliSource } from '..';
import eeprom from '../eeprom';
import settings from '../settings';
import escs from './escs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_versions.json';

class BLHeliAtmelSource extends BLHeliSource {
  async getVersions() {
    return (await this.getVersionsList()).Atmel;
  }
}

const blheliSource = new BLHeliAtmelSource(
  'BLHeli',
  VERSIONS_REMOTE,
  {
    ...eeprom,
    ...settings, 
  },
  escs
);

export default blheliSource;
