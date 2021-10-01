import Source, { PLATFORMS } from '../Source';
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

    return `${make} - BLHeli_S, ${revision}`;
  }

  getEscLayouts() {
    return escsjson.layouts.Atmel;
  }

  getMcuSignatures() {
    return escsjson.signatures.Atmel;
  }
}

class BLHeliSilabsSource extends BLHeliSource {
  getEscLayouts() {
    return escsjson.layouts.SiLabs;
  }

  getMcuSignatures() {
    return escsjson.signatures.SiLabs;
  }
}

class BLHeliSSource extends BLHeliSource {
  getEscLayouts() {
    return escsjson.layouts['BLHeli_S SiLabs'];
  }

  getMcuSignatures() {
    return escsjson.signatures['BLHeli_S SiLabs'];
  }
}

const pwmOptions = [];
const blheliSource = new BLHeliSource(
  'BLHeli',
  'PLATFORMS.ATMEL', // TODO
  VERSIONS_REMOTE,
  ESCS_REMOTE,
  eeprom,
  pwmOptions
);

const blheliSilabsSource = new BLHeliSilabsSource(
  'BLHeli',
  PLATFORMS.SILABS,
  VERSIONS_REMOTE,
  ESCS_REMOTE,
  eeprom,
  pwmOptions
);

const blheliSSource = new BLHeliSSource(
  'BLHeli_S',
  PLATFORMS.SILABS,
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