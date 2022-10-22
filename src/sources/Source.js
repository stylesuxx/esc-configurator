import {
  MethodNotImplementedError,
  MissingParametersError,
} from '../utils/Errors';
import { fetchJsonCached } from '../utils/Fetch';

/**
 * Abstract Base Class for firmware sources
 *
 * Every source needs to implement this abstract Source class and implement all
 * required methods.
 */
class Source {
  /**
   * Instanciate a source with at least a name eeprom layouts, setting
   * descriptions and ESC layouts.
   *
   * @param {string} name
   * @param {object} eeprom
   * @param {object} settingsDescriptions
   * @param {object} escs
   */
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

  /**
   * Get remote version list
   *
   * @param {string} url
   * @returns {Promise}
   */
  async getRemoteVersionsList(url) {
    return await fetchJsonCached(url);
  }

  /**
   * Get a display name for the given firmware
   *
   * @returns {string}
   */
  buildDisplayName() {
    throw new MethodNotImplementedError("buildDisplayName()");
  }

  /**
   * Get available ESC layouts
   *
   * @returns {object}
   */
  getEscLayouts() {
    return this.escs.layouts;
  }

  /**
   * Get available MCUs
   *
   * @returns {Array<object>}
   */
  getMcus() {
    return this.escs.mcus;
  }

  /**
   * Get available versions
   *
   * @returns {Array<object>}
   */
  getVersions() {
    throw new MethodNotImplementedError("getVersions()");
  }

  /**
   * Get EEprom
   *
   * @returns {object}
   */
  getEeprom() {
    return this.eeprom;
  }

  /**
   * Get setting descriptions
   *
   * @returns {object}
   */
  getSettingsDescriptions() {
    return this.settings;
  }

  /**
   * Get available revisions
   *
   * @returns {Array<number>}
   */
  getRevisions() {
    const revisions = Object.keys(this.settings.COMMON);
    return revisions;
  }

  /**
   * Get common settings for a chosen revision
   *
   * @param {number} revision
   * @returns {object}
   */
  getCommonSettings(revision) {
    return this.settings.COMMON[revision];
  }

  /**
   * Get individual settings for a chosen revision
   *
   * @param {number} revision
   * @returns  {object}
   */
  getIndividualSettings(revision) {
    return this.settings.INDIVIDUAL[revision];
  }

  /**
   * Get default settings for a chosen revision
   *
   * @param {number} revision
   * @returns {object}
   */
  getDefaultSettings(revision) {
    return this.settings.DEFAULTS[revision];
  }

  /**
   * Get firmware name
   *
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Get available PWM options
   *
   * @returns {Array<number>}
   */
  getPwm() {
    return this.pwm;
  }

  /**
   * Get available names
   *
   * @returns {Array<string>}
   */
  getValidNames() {
    return this.eeprom.NAMES;
  }

  /**
   * Check if a given name is valid
   *
   * @param {string} name
   * @returns {boolean}
   */
  isValidName(name) {
    return this.eeprom.NAMES.includes(name);
  }

  /**
   * Check if settings can be migrated to this firmware
   *
   * @param {string} name
   * @returns {boolean}
   */
  canMigrateTo(name) {
    return this.isValidName(name);
  }

  /**
   * Get the size of the layout
   *
   * @returns {number}
   */
  getLayoutSize() {
    return this.eeprom.LAYOUT_SIZE;
  }

  /**
   * Get the settings layout
   *
   * @returns {object}
   */
  getLayout() {
    return this.eeprom.LAYOUT;
  }
}

export default Source;
