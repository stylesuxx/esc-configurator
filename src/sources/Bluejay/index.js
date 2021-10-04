import Source from '../Source.js';
import eeprom from './eeprom';
import * as escsjson from '../Blheli/blheli_escs.json';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/mathiasvr/bluejay-configurator/bluejay/js/bluejay_versions.json';

class BluejaySource extends Source {
  buildDisplayName(flash, make) {
    const settings = flash.settings;
    let revision = 'Unsupported/Unrecognized';
    if(settings.MAIN_REVISION !== undefined && settings.SUB_REVISION !== undefined) {
      revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;
    }

    let pwm = '';
    if(settings.__PWM_FREQUENCY && settings.__PWM_FREQUENCY !== 0xFF) {
      pwm = `, ${settings.__PWM_FREQUENCY}kHz`;
    }
    const name = `${settings.NAME.trim()}`;

    return `${make} - ${name}, ${revision}${pwm}`;
  }

  getEscLayouts() {
    return escsjson.layouts['BLHeli_S SiLabs'];
  }

  getMcuSignatures() {
    return escsjson.signatures['BLHeli_S SiLabs'];
  }

  async getVersions() {
    return (await this.getVersionsList()).EFM8;
  }
}

const pwmOptions = [24, 48, 96];
const config = new BluejaySource(
  'Bluejay',
  VERSIONS_REMOTE,
  eeprom,
  pwmOptions
);

export default config;
