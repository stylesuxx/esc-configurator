import {
  BLHELI_TYPES,
} from '../utils/Blheli';

import {
  BLUEJAY_TYPES,
} from '../utils/Bluejay';

import {
  OPEN_ESC_TYPES,
} from '../utils/OpenEsc';

class Source {
  constructor(name, platform, versions, escs, localVersions, localEscs, pwm) {
    if(!name || !versions || !escs || !localVersions || !localEscs || !pwm) {
      throw new Error("Parameters required: name, versions, escs, localVersions, localEscs");
    }

    this.name = name;
    this.platform = platform;
    this.versions = versions;
    this.escs = escs;
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
  OPEN_ESC_TYPES.ARM,
];

export {
  ARM_TYPES,
  PLATFORMS,
  SILABS_TYPES,
};
export default Source;
