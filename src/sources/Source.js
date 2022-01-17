import {
  MethodNotImplementedError,
  MissingParametersError,
} from '../utils/Errors';

import { fetchJsonCached } from '../utils/Fetch';

/* Abstract Base Class for firmware sources
 *
 * Every source needs to implement thi abstract Source class and implement all
 * required methods.
 */
class Source {
  constructor(name, eeprom, escs) {
    if(!name || !eeprom || !escs) {
      throw new MissingParametersError("name, eeprom, escs");
    }

    this.name = name;
    this.eeprom = eeprom;
    this.escs = escs;
    this.pwm = [];

    this.setLocalVersions = async(versions) => {
      const localStorageKey = `${this.getName()}_versions`;
      localStorage.setItem(localStorageKey, JSON.stringify(versions));
    };
  }

  async getRemoteVersionsList(url) {
    return await fetchJsonCached(url);
  }

  buildDisplayName() {
    throw new MethodNotImplementedError("buildDisplayName()");
  }

  getEscLayouts() {
    return this.escs.layouts;
  }

  getMcuSignatures() {
    return this.escs.mcus;
  }

  getVersions() {
    throw new MethodNotImplementedError("getVersions()");
  }

  getEeprom() {
    return this.eeprom;
  }

  getName() {
    return this.name;
  }

  getPwm() {
    return this.pwm;
  }
}

class GithubSource extends Source {
  async getRemoteVersionsList(repo) {
    const githubReleases = await fetchJsonCached(`https://api.github.com/repos/${repo}/releases`);

    return githubReleases
      .filter((r) => r.assets.length) // hide releases without assets
      .map((r) => ({
        name: r.name || r.tag_name.replace(/^v/, ''),
        key: r.tag_name,
        url: `https://github.com/${repo}/releases/download/${r.tag_name}/`,
        prerelease: r.prerelease,
        published_at: r.published_at,
      }));
  }
}

export {
  GithubSource,
};

export default Source;
