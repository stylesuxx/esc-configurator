import {
  BLHELI_TYPES,
} from './Blheli/eeprom';

import BLUEJAY_EEPROM from './Bluejay/eeprom';
const BLUEJAY_TYPES = BLUEJAY_EEPROM.TYPES;

import {
  AM32_TYPES,
} from './AM32/eeprom';

class Source {
  constructor(name, platform, versions, escs, eeprom, localVersions, localEscs, pwm) {
    if(!name || platform === undefined || !versions || !escs || !eeprom || !localVersions || !localEscs || !pwm) {
      throw new Error("Parameters required: name, platform, versions, escs, eeprom, localVersions, localEscs, pwm");
    }

    this.name = name;
    this.platform = platform;
    this.versions = versions;
    this.escs = escs;
    this.eeprom = eeprom;
    this.localVersions = localVersions;
    this.localEscs = localEscs;
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

  getPlatform() {
    return this.platform;
  }

  getName() {
    return this.name;
  }

  getPwm() {
    return this.pwm;
  }

  async getVersions() {
    if(navigator.onLine) {
      try {
        const result = await this.fetchJson(this.versions);
        return result;
      } catch(e) {
        // No neet to catch - returl local versions anyway
      }
    }

    return this.localVersions;
  }

  async getEscs() {
    if(navigator.onLine) {
      try {
        const result = await this.fetchJson(this.escs);
        return result;
      } catch(e) {
        // No neet to catch - return local escs anyway
      }
    }

    return this.localEscs;
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
  BLHELI_TYPES.BLHELI_S_SILABS,
  BLUEJAY_TYPES.EFM8,
];

const ARM_TYPES = [
  AM32_TYPES.ARM,
];

export {
  ARM_TYPES,
  PLATFORMS,
  SILABS_TYPES,
};

export default Source;
