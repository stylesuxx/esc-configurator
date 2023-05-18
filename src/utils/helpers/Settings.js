import { getSource } from './General';

/**
 * Get master settings from a set of settings
 *
 * @param {Array<object>} escs
 * @returns {object}
 */
const getMasterSettings = (escs) => {
  const master = getMaster(escs);
  if(master) {
    return { ...master.settings };
  }

  return {};
};

/**
 * Return the individaul settings for each ESC - include fixed fields
 *
 * @param {object} esc
 * @returns {Array<string>}
 */
const getIndividualSettingsDescriptions = (esc) => {
  if(esc && esc.firmwareName && esc.layoutRevision) {
    const keep = ['MAIN_REVISION', 'SUB_REVISION', 'LAYOUT', 'LAYOUT_REVISION', 'NAME'];

    const source = getSource(esc.firmwareName);
    const descriptions = source ? source.getIndividualSettings(esc.layoutRevision) : {};

    const individualGroups = Object.keys(descriptions);
    for(let i = 0; i < individualGroups.length; i += 1) {
      const keepSettings = descriptions[individualGroups[i]];
      for(let j = 0; j < keepSettings.length; j += 1) {
        const current = keepSettings[j].name;
        keep.push(current);
      }
    }

    return keep;
  }

  return [];
};

/**
 * Return individual settings for a  given ESC
 *
 * @param {object} esc
 * @returns {object}
 */
const getIndividualSettings = (esc) => {
  const individualSettings = {};

  if(esc && esc.settings) {
    const individualKeep = getIndividualSettingsDescriptions(esc);

    for(let j = 0; j < individualKeep.length; j += 1) {
      const setting = individualKeep[j];
      individualSettings[setting] = esc.settings[setting];
    }
  }

  return individualSettings;
};

/**
 * Get master ESC from a list of ESCs
 *
 * @param {Array<object>} escs
 * @returns {object}
 */
const getMaster = (escs) => escs.find((esc) => esc.meta.available);

/**
 * Get the settings for all given ESCs
 *
 * @param {Array<object>} escs
 * @returns {Array<object>}
 */
const getAllSettings = (escs) => escs.map((esc) => esc.settings);

/**
 * Check if a specific setting can be migrated from one firmware to another
 *
 * @param {string} settingName
 * @param {object} from
 * @param {object} to
 * @param {object} toSettingsDescriptions
 * @param {object} toIndividualSettingsDescriptions
 * @returns {boolean}
 */
function canMigrate(settingName, from, to, toSettingsDescriptions, toIndividualSettingsDescriptions) {
  if (from.MODE === to.MODE) {
    if (!toSettingsDescriptions[from.LAYOUT_REVISION] ||
        !toSettingsDescriptions[to.LAYOUT_REVISION] ||
        !toIndividualSettingsDescriptions[from.LAYOUT_REVISION] ||
        !toIndividualSettingsDescriptions[to.LAYOUT_REVISION]
    ) {
      return false;
    }

    const fromLayout = toSettingsDescriptions[from.LAYOUT_REVISION];
    const toLayout = toSettingsDescriptions[to.LAYOUT_REVISION];

    if(!(fromLayout.base && toLayout.base)) {
      return false;
    }

    const fromCommon = fromLayout.base.find((setting) => setting.name === settingName);
    const toCommon = toLayout.base.find((setting) => setting.name === settingName);

    if (fromCommon && toCommon) {
      return true;
    }

    const fromIndividuals = toIndividualSettingsDescriptions[from.LAYOUT_REVISION].base;
    const toIndividuals = toIndividualSettingsDescriptions[to.LAYOUT_REVISION].base;

    const fromIndividual = fromIndividuals.find((setting) => setting.name === settingName);
    const toIndividual = toIndividuals.find((setting) => setting.name === settingName);

    if (fromIndividual && toIndividual) {
      return true;
    }
  }

  return false;
}

export {
  getAllSettings,
  getIndividualSettings,
  getIndividualSettingsDescriptions,
  getMaster,
  getMasterSettings,
  canMigrate,
};
