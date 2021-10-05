import Source from '../Source';
import eeprom from './eeprom';
import escsAtmel from './escsAtmel.json';
import escsSilabs from './escsSilabs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_versions.json';

class BLHeliSource extends Source {
  buildDisplayName(flash, make) {
    const settings = flash.settings;
    let revision = 'Unsupported/Unrecognized';
    if(settings.MAIN_REVISION !== undefined && settings.SUB_REVISION !== undefined) {
      revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;
    }

    if (flash.actualMake) {
      make += ` (Probably mistagged: ${flash.actualMake})`;
    }

    return `${make} - ${this.name}, ${revision}`;
  }

  async getVersions() {
    return (await this.getVersionsList()).Atmel;
  }
}

class BLHeliSilabsSource extends BLHeliSource {
  async getVersions() {
    return (await this.getVersionsList()).Silabs;
  }
}

const blheliSource = new BLHeliSource(
  'BLHeli',
  VERSIONS_REMOTE,
  eeprom,
  escsAtmel
);

const blheliSilabsSource = new BLHeliSilabsSource(
  'BLHeli',
  VERSIONS_REMOTE,
  eeprom,
  escsSilabs
);

export {
  BLHeliSource,
  blheliSource,
  blheliSilabsSource,
};

export default blheliSource;
