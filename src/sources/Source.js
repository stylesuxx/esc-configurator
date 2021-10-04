import {
  LocalDataNotAvailableError,
  MethodNotImplementedError,
  MissingParametersError,
} from '../utils/Errors';

class Source {
  constructor(name, versions, eeprom) {
    if(!name || !versions || !eeprom) {
      throw new MissingParametersError("name, versions, eeprom");
    }

    this.name = name;
    this.versions = versions;
    this.eeprom = eeprom;
    this.pwm = [];

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

    this.getVersionsList = async () => {
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

      throw new LocalDataNotAvailableError();
    };
  }

  buildDisplayName() {
    throw new MethodNotImplementedError("buildDisplayName()");
  }

  getEscLayouts() {
    throw new MethodNotImplementedError("getEscLayouts()");
  }

  getMcuSignatures() {
    throw new MethodNotImplementedError("getMcuSignatures()");
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
