import { GithubSource } from '../Source';
import eeprom from './eeprom';
import settings from './settings';
import escsBlheliS from '../BlheliS/escs.json';
import escsBluejay from './escs.json';

const escs = {
  mcus: escsBlheliS.mcus,
  layouts: {
    ...escsBlheliS.layouts,
    ...escsBluejay.layouts,
  },
};

const GITHUB_REPO = 'mathiasvr/bluejay';

class BluejaySource extends GithubSource {
  constructor(name, eeprom, escs, pwm) {
    super(name, eeprom, escs);
    this.pwm = pwm;
  }

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

  async getVersions() {
    return this.getRemoteVersionsList(GITHUB_REPO);
  }

  getFirmwareUrl({
    escKey, version, pwm, url,
  }) {
    const name = this.escs.layouts[escKey].name.replace(/[\s-]/g, '_').toUpperCase();

    return `${url}${name}_${pwm}_v${version}.hex`;
  }
}

const pwmOptions = [24, 48, 96];
const config = new BluejaySource(
  'Bluejay',
  {
    ...eeprom,
    ...settings,
  },
  escs,
  pwmOptions
);

export default config;
