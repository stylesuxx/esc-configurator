import Source, { PLATFORMS } from '../Source.js';
import eeprom from './eeprom';

const VERSIONS_REMOTE = 'https://raw.githubusercontent.com/mathiasvr/bluejay-configurator/bluejay/js/bluejay_versions.json';
const ESCS_REMOTE = 'https://raw.githubusercontent.com/mathiasvr/bluejay-configurator/bluejay/js/bluejay_escs.json';

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
}

const pwmOptions = [24, 48, 96];
const config = new BluejaySource(
  'Bluejay',
  PLATFORMS.SILABS,
  VERSIONS_REMOTE,
  ESCS_REMOTE,
  eeprom,
  pwmOptions
);

export default config;
