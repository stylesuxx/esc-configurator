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

  getEscLayouts() {
    return escsAtmel.layouts;
  }

  getMcuSignatures() {
    return escsAtmel.mucs;
  }

  async getVersions() {
    return (await this.getVersionsList()).Atmel;
  }
}

class BLHeliSilabsSource extends BLHeliSource {
  getEscLayouts() {
    return escsSilabs.layouts;
  }

  getMcuSignatures() {
    return escsSilabs.mcus;
  }

  async getVersions() {
    return (await this.getVersionsList()).Silabs;
  }
}

const blheliSource = new BLHeliSource(
  'BLHeli',
  VERSIONS_REMOTE,
  eeprom
);

const blheliSilabsSource = new BLHeliSilabsSource(
  'BLHeli',
  VERSIONS_REMOTE,
  eeprom
);

export {
  BLHeliSource,
  blheliSource,
  blheliSilabsSource,
};

export default blheliSource;
