import GithubSource from '../GithubSource';
import eeprom from './eeprom';
import settingsDescriptions from './settings';
import escsBlheliS from '../BlheliS/escs.json';
import escsBluejay from './escs.json';
import blacklist from './blacklist.json';
import Silabs from '../../utils/Hardware/Silabs';
import semver from 'semver';

const escs = {
  layouts: {
    ...escsBlheliS.layouts,
    ...escsBluejay.layouts,
  },
};

const GITHUB_REPO = 'bird-sanctuary/bluejay';

class BluejaySource extends GithubSource {
  buildDisplayName(flash, make) {
    const settings = flash.settings;
    let revision = 'Unsupported/Unrecognized';
    if(settings.MAIN_REVISION !== undefined && settings.SUB_REVISION !== undefined) {
      revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;
    }

    let pwm = '';
    if(settings.PWM_FREQUENCY && settings.PWM_FREQUENCY !== 0xFF) {
      pwm = `, ${settings.PWM_FREQUENCY}kHz`;

      if(settings.PWM_FREQUENCY === 192) {
        pwm = ', Dynamic PWM';
      }
    }
    const name = `${settings.NAME.trim()}`;

    return `${make} - ${name}, ${revision}${pwm}`;
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

  getMcus() {
    return Silabs.getMcus();
  }

  async getVersions() {
    return this.getRemoteVersionsList(GITHUB_REPO, blacklist, 5);
  }

  isValidName(name) {
    const regexes = [ /Bluejay( \(.*\))?/g ];
    for(let i = 0; i < regexes.length; i += 1){
      const regex = new RegExp(regexes[i]);
      const match = regex.test(name);
      if (match) {
        return true;
      }
    }

    return false;
  }

  canMigrateTo(name) {
    return this.isValidName(name);
  }

  getPwm(version) {
    // Before v0.21.0 PWM was a build time option and should be selectable
    // in the firmware selector.
    if(semver.lt(version, '0.21.0')) {
      return [24, 48, 96];
    }

    return [];
  }

  getSkipSettings(oldLayout, newLayout) {
    // Migration between same layouts is always fine
    if(newLayout !== oldLayout) {
      // When flashing from older version to this version, don't migrate those
      // settings - we use new defaults.
      if(oldLayout < newLayout && newLayout === 207) {
        return [
          'DITHERING',
          'TEMPERATURE_PROTECTION',
        ];
      }
    }

    return [];
  }
}

const source = new BluejaySource(
  'Bluejay',
  eeprom,
  settingsDescriptions,
  escs
);

export default BluejaySource;
export {
  source,
};
