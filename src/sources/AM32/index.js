import GithubSource from '../GithubSource';
import eeprom from './eeprom';
import settingsDescriptions from './settings';
import escs from './escs.json';
import patterns from './patterns.json';
import Arm from '../../utils/Hardware/Arm';
import semver from 'semver';
import { fetchJsonCached } from '../../utils/Fetch';

const GITHUB_REPO = 'AlkaMotors/AM32-MultiRotor-ESC-firmware';

class AM32Source extends GithubSource {
  minVersion = "1.94";

  async getRemoteVersionsList(repo, blacklist = null, amount = 100) {
    const githubReleases = await fetchJsonCached(`https://api.github.com/repos/${repo}/releases?per_page=${amount}&page=1`, this.skipCache);

    const minVersion = semver.coerce(this.minVersion).version;

    const releasesWithAssets = githubReleases.filter(
      (release) => semver.satisfies(semver.coerce(release.tag_name.slice(1)), `>=${minVersion}`)
    );

    const validReleases = releasesWithAssets.map((release) => ({
      name: release.name || release.tag_name.replace(/^v/, ''),
      key: release.tag_name,
      url: `https://github.com/${repo}/releases/download/${release.tag_name}/`,
      prerelease: release.prerelease,
      published_at: release.published_at,
    }));

    return validReleases;
  }

  getDisabledLayoutSelection(flash) {
    return !!flash.meta?.am32?.mcuType;
  }

  buildDisplayName(flash, make) {
    const settings = flash.settings;
    let revision = 'Unsupported/Unrecognized';
    if(settings.MAIN_REVISION !== undefined && settings.SUB_REVISION !== undefined) {
      revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION > 9 ? '' : '0'}${settings.SUB_REVISION}`;
    }

    if(make === 'NOT READY') {
      revision = 'FLASH FIRMWARE';
    }

    //if we can extract the AM32 mcutype, display it here
    const mcuType = flash.meta?.am32?.mcuType ? `, MCU: ${flash.meta.am32.mcuType}` : '';

    const bootloader = flash.bootloader.valid ? `, Bootloader v${flash.bootloader.version} (${flash.bootloader.pin})${mcuType}` : ', Bootloader unknown';

    return `${make} - ${this.name}, ${revision}${bootloader}`;
  }

  getFirmwareUrl({
    escKey,
    version,
    url,
    esc,
  }) {
    /**
     * AM32 Versions 1.94 and up have the file name baked into the firmware
     * if it is available, we use it, otherwise we fall back to the legacy
     * file name detection.
     */
    let name = null;
    if(esc.meta.am32) {
      name = esc.meta.am32.fileName;
    } else {
      name = this.escs.layouts[escKey].fileName;
    }

    version = version.replace(/^v/, '');

    let pattern = `${url}AM32_${name}_${version}.hex`;
    if (version in patterns) {
      const replaced = patterns[version]
        .replace('${name}', name)
        .replace('${version}', version);

      pattern = `${url}${replaced}`;
    }

    return pattern;
  }

  getMcus() {
    return Arm.getMcus();
  }

  async getVersions() {
    return this.getRemoteVersionsList(GITHUB_REPO);
  }

  getValidNames() {
    return Object.keys(escs.layouts);
  }

  /**
   * Reurns group order for common settings
   *
   * @returns {Array<string>}
   */
  getGroupOrder() {
    return [
      'general',
      'am32motor',
      'am32pwm',
      'am32brake',
      'am32sine',
    ];
  }
}

const source = new AM32Source(
  'AM32',
  eeprom,
  settingsDescriptions,
  escs
);

export default AM32Source;
export {
  source,
};