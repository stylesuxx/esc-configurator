import {
  LocalDataNotAvailableError,
  MethodNotImplementedError,
  MissingParametersError,
} from '../utils/Errors';

import settings from '../settings.json';

const { corsProxy } = settings;

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

    this.fetchJson = async (url) => {
      try {
        const proxy = `${corsProxy}${url}`;
        const response = await fetch(proxy);
        if(!response.ok) {
          throw new Error(response.statusText);
        }

        return response.json();
      } catch(e) {
        throw new Error(e);
      }
    };

    this.getRemoteVersionsList = async (url) => {
      const localStorageKey = `${this.getName()}_versions`;

      try {
        const result = await this.fetchJson(url);
        localStorage.setItem(localStorageKey, JSON.stringify(result));

        return result;
      } catch(e) {
        const content = localStorage.getItem(localStorageKey);

        if(content !== null) {
          return (JSON.parse(content));
        }
      }

      throw new LocalDataNotAvailableError();
    };

    this.setLocalVersions = async(versions) => {
      const localStorageKey = `${this.getName()}_versions`;
      localStorage.setItem(localStorageKey, JSON.stringify(versions));
    };
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

export default Source;
