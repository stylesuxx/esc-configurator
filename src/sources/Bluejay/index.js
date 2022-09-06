import GithubSource from '../GithubSource';
import eeprom from './eeprom';
import settingsDescriptions from './settings';
import escsBlheliS from '../BlheliS/escs.json';
import escsBluejay from './escs.json';
import blacklist from './blacklist.json';

const escs = {
  mcus: escsBlheliS.mcus,
  layouts: {
    ...escsBlheliS.layouts,
    ...escsBluejay.layouts,
  },
};

const GITHUB_REPO = 'bird-sanctuary/bluejay';

class BluejaySource extends GithubSource {
  constructor(name, eeprom, settingsDescriptions, escs, pwm) {
    super(name, eeprom, settingsDescriptions, escs);
    this.pwm = pwm;
  }

  buildDisplayName(flash, make) {
    const settings = flash.settings;
    let revision = 'Unsupported/Unrecognized';
    if(settings.MAIN_REVISION !== undefined && settings.SUB_REVISION !== undefined) {
      revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;
    }

    let pwm = '';
    if(settings.PWM_FREQUENCY && settings.PWM_FREQUENCY !== 0xFF) {
      pwm = `, ${settings.PWM_FREQUENCY}kHz`;
    }
    const name = `${settings.NAME.trim()}`;

    return `${make} - ${name}, ${revision}${pwm}`;
  }

  async getVersions() {
    return this.getRemoteVersionsList(GITHUB_REPO, blacklist);
  }

  getFirmwareUrl({
    escKey, version, pwm, url, settings,
  }) {
    const name = this.escs.layouts[escKey].name.replace(/[\s-]/g, '_').toUpperCase();

    if (version === 'test-melody-pwm') {
      return `${url}${name}_${version}.hex`;
    }

    return `${url}${name}_${pwm}_${version}.hex`;
  }
}

const pwmOptions = [24, 48, 96];
const config = new BluejaySource(
  'Bluejay',
  eeprom,
  settingsDescriptions,
  escs,
  pwmOptions
);

export default config;
