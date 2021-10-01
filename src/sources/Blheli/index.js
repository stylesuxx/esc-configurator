import Source from '../Source';
import eeprom from './eeprom';
import * as escsjson from './blheli_escs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_versions.json';
const ESCS_REMOTE = 'https://raw.githubusercontent.com/blheli-configurator/blheli-configurator/master/js/blheli_escs.json';

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
    return escsjson.layouts.Atmel;
  }

  getMcuSignatures() {
    return escsjson.signatures.Atmel;
  }

  async getVersions() {
    return (await this.getVersionsList()).Atmel;
  }
}

class BLHeliSilabsSource extends BLHeliSource {
  getEscLayouts() {
    return escsjson.layouts.SiLabs;
  }

  getMcuSignatures() {
    return escsjson.signatures.SiLabs;
  }

  async getVersions() {
    return (await this.getVersionsList()).Silabs;
  }
}

class BLHeliSSource extends BLHeliSource {
  getEscLayouts() {
    return escsjson.layouts['BLHeli_S SiLabs'];
  }

  getMcuSignatures() {
    return escsjson.signatures['BLHeli_S SiLabs'];
  }

  async getVersions() {
    return (await this.getVersionsList())['BLHeli_S SiLabs'];
  }
}

const pwmOptions = [];
const blheliSource = new BLHeliSource(
  'BLHeli',
  VERSIONS_REMOTE,
  ESCS_REMOTE,
  eeprom,
  pwmOptions
);

const blheliSilabsSource = new BLHeliSilabsSource(
  'BLHeli',
  VERSIONS_REMOTE,
  ESCS_REMOTE,
  eeprom,
  pwmOptions
);

const blheliSSource = new BLHeliSSource(
  'BLHeli_S',
  VERSIONS_REMOTE,
  ESCS_REMOTE,
  eeprom,
  pwmOptions
);

export {
  blheliSource,
  blheliSilabsSource,
  blheliSSource, 
};

export default blheliSSource;