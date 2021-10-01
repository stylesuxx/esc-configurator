import BLHELI_EEPROM from './Blheli/eeprom';
import BLUEJAY_EEPROM from './Bluejay/eeprom';
import AM32_EEPROM from './AM32/eeprom';

import {
  FileNotAvailableError,
  LocalDataNotAvailableError,
} from '../utils/Errors';

class Source {
  constructor(name, platform, versions, escs, eeprom, pwm) {
    if(!name || platform === undefined || !versions || !escs || !eeprom || !pwm) {
      throw new Error("Parameters required: name, platform, versions, escs, eeprom, localVersions, localEscs, pwm");
    }

    this.name = name;
    this.platform = platform;
    this.versions = versions;
    this.escs = escs;
    this.eeprom = eeprom;
    this.pwm = pwm;

    this.fetchJson = async (url) => {
      try {
        const response = await fetch(url);
        if(!response.ok) {
          throw new Error(response.statusText);
        }

        return response.json();
      } catch(e) {
        throw new Error(e);
      }
    };
  }

  buildDisplayName() {
    throw new Error("Method buildDisplayName not implemented");
  }

  getPlatform() {
    return this.platform;
  }

  getName() {
    return this.name;
  }

  getPwm() {
    return this.pwm;
  }

  async getVersionsList() {
    const localStorageKey = `${this.getName()}_versions`;

    try {
      const result = await this.fetchJson(this.versions);
      localStorage.setItem(localStorageKey, JSON.stringify(result));

      return result;
    } catch(e) {
      const content = localStorage.getItem(localStorageKey);

      if(content !== null) {
        return (JSON.parse(content));
      }
    }

    throw new FileNotAvailableError();
  }

  async getEscs() {
    const localStorageKey = `${this.getName()}_escs`;

    try {
      const result = await this.fetchJson(this.escs);
      localStorage.setItem(localStorageKey, JSON.stringify(result));

      return result;
    } catch(e) {
      const content = localStorage.getItem(localStorageKey);

      if(content !== null) {
        return (JSON.parse(content));
      }
    }

    throw new FileNotAvailableError();
  }

  getLocalEscs() {
    const localStorageKey = `${this.getName()}_escs`;
    const content = localStorage.getItem(localStorageKey);

    if(content !== null) {
      return (JSON.parse(content));
    }

    throw new LocalDataNotAvailableError();
  }

  getEeprom() {
    return this.eeprom;
  }
}

const PLATFORMS = {
  SILABS: 0,
  ARM: 1,
};

const SILABS_TYPES = [
  BLHELI_EEPROM.TYPES.BLHELI_S_SILABS,
  BLUEJAY_EEPROM.TYPES.EFM8,
];

const ARM_TYPES = [
  AM32_EEPROM.TYPES.ARM,
];

export {
  ARM_TYPES,
  PLATFORMS,
  SILABS_TYPES,
};

export default Source;
