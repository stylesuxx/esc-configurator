import SettingsHandler from '../Components/Flash/Escs/Esc/SettingsHandler';
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
  constructor(name, eeprom, settings, escs) {
    if(!name || !eeprom || !settings || !escs) {
      throw new MissingParametersError("name, eeprom, settings, escs");
    }

    this.name = name;
    this.eeprom = eeprom;
    this.settings = settings;
    this.escs = escs;
    this.pwm = [];
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

  getMcus() {
    return this.escs.mcus;
  }

  getVersions() {
    throw new MethodNotImplementedError("getVersions()");
  }

  getEeprom() {
    return this.eeprom;
  }

  getSettings() {
    return this.settings;
  }

  getName() {
    return this.name;
  }

  getPwm() {
    return this.pwm;
  }
}



export default Source;
