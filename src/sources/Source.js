import {
  FileNotAvailableError,
  LocalDataNotAvailableError,
} from '../utils/Errors';

class Source {
  constructor(name, versions, escs, eeprom, pwm) {
    if(!name || !versions || !escs || !eeprom || !pwm) {
      throw new Error("Parameters required: name, versions, escs, eeprom, pwm");
    }

    this.name = name;
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

export default Source;
