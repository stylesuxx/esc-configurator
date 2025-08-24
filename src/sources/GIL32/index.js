import GithubSource from '../GithubSource';
import eeprom from './eeprom';
import settingsDescriptions from './settings';
import escs from './escs.json';
import patterns from './patterns.json';
import Arm from '../../utils/Hardware/Arm';
import semver from 'semver';
import { fetchJsonCached } from '../../utils/Fetch';

const GITHUB_REPO = 'guser210/Gil32_Firmware';

class GIL32Source extends GithubSource {
  minVersion = "1.3";

  async getRemoteVersionsList(repo, blacklist = null, amount = 100) {
    this.skipCache = true;
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
    return !!flash.meta?.gil32?.mcuType;
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

 
    const mcuType = flash.meta?.gil32?.mcuType ? `, MCU: ${flash.meta.gil32.mcuType}` : '';

    const bootloader = flash.bootloader.valid ? `, Bootloader v${flash.bootloader.version} (${flash.bootloader.pin})${mcuType}` : ', Bootloader unknown';

    return `${make} - ${this.name}, ${revision}${bootloader}`;
  }

  getFirmwareUrl({
    escKey,
    version,
    url,
    esc,
  }) {

    
    let name = null;
    if(esc.meta.gil32) {
      name = esc.meta.gil32.fileName;
    } else {
      name = this.escs.layouts[escKey].fileName;
    }

    version = version.replace(/^v/, '');

    let pattern = `${url}GIL32_${name}_${version}.hex`;
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
      'General',
      'GIL32',
    ];
  }
}

const source = new GIL32Source(
  'GIL32',
  eeprom,
  settingsDescriptions,
  escs
);

export default GIL32Source;
export {
  source,
};