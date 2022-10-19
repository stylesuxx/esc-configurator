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
  constructor(name, eeprom, settingsDescriptions, escs) {
    if(!name || !eeprom || !settingsDescriptions || !escs) {
      throw new MissingParametersError("name, eeprom, settingsDescriptions, escs");
    }

    this.name = name;
    this.eeprom = eeprom;
    this.settings = settingsDescriptions;
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

  getSettingsDescriptions() {
    return this.settings;
  }

  getCommonSettings(revision) {
    return this.settings.COMMON[revision];
  }

  getIndividualSettings(revision) {
    return this.settings.INDIVIDUAL[revision];
  }

  getDefaultSettings(revision) {
    return this.settings.DEFAULTS[revision];
  }

  getName() {
    return this.name;
  }

  getPwm() {
    return this.pwm;
  }

  getValidNames() {
    return this.eeprom.NAMES;
  }

  isValidName(name) {
    return this.eeprom.NAMES.includes(name);
  }

  getLayoutSize() {
    return this.eeprom.LAYOUT_SIZE;
  }

  getLayout() {
    return this.eeprom.LAYOUT;
  }
}



export default Source;
