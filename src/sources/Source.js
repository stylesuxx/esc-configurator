import {
  FileNotAvailableError,
  LocalDataNotAvailableError,
} from '../utils/Errors';

class Source {
  constructor(name, versions, eeprom, pwm) {
    if(!name || !versions || !eeprom || !pwm) {
      throw new Error("Parameters required: name, versions, eeprom, pwm");
    }

    this.name = name;
    this.versions = versions;
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

  getEeprom() {
    return this.eeprom;
  }
}

export default Source;
