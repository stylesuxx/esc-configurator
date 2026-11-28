import { getSource } from './General';

/**
 * The different ways settings can be handled when flashing new firmware:
 * migrating only between versions of the same firmware, migrating between
 * different firmware or not migrating at all - in which case the ESC is left
 * with the settings that are hard coded in the flashed firmware.
 */
const MIGRATION = {
  SAME: 'same',
  ALL: 'all',
  DEFAULTS: 'defaults',
};

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
    const source = getSource(esc.firmwareName);
    if(source) {
      const keep = ['MAIN_REVISION', 'SUB_REVISION', 'LAYOUT', 'LAYOUT_REVISION', 'NAME'];
      const descriptions = source.getIndividualSettings(esc.layoutRevision);

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
    try {
      const individualKeep = getIndividualSettingsDescriptions(esc);

      for(let j = 0; j < individualKeep.length; j += 1) {
        const setting = individualKeep[j];
        individualSettings[setting] = esc.settings[setting];
      }
    } catch (e) {
      return individualSettings;
    }
  }

  return individualSettings;
};

const FLASH_FAILED_NAME = '**FLASH*FAILED**';

/**
 * ESC whose last flash failed: its settings hold the **FLASH*FAILED** mark
 * and values read with the wrong layout. They must not be written, to it or
 * to the other ESCs, until it is flashed again.
 *
 * @param {object} esc
 * @returns {boolean}
 */
const isFlashFailed = (esc) => {
  if(!esc || !esc.settings) {
    return false;
  }

  return esc.settings.NAME === FLASH_FAILED_NAME;
};

/**
 * First available ESC whose settings can be trusted: an ESC marked
 * **FLASH*FAILED** is read with the wrong layout, so its values must never be
 * shown as the common settings nor copied to the other ESCs.
 *
 * @param {Array<object>} escs
 * @returns {object|undefined}
 */
const getMaster = (escs) => escs.find((esc) => esc.meta.available && !isFlashFailed(esc));

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

/**
 * Check if an ESC supports LED configuration
 *
 * Which layouts support LEDs is described by the firmware source itself, so
 * instead of duplicating that list, the setting description is asked.
 *
 * @param {object} esc
 * @returns {boolean}
 */
const supportsLeds = (esc) => {
  const source = getSource(esc?.firmwareName);
  const descriptions = source?.getIndividualSettings(esc.layoutRevision);

  const led = descriptions?.base.find((description) => description.name === 'LED_CONTROL');
  if(!led) {
    return false;
  }

  return led.visibleIf ? led.visibleIf(esc.individualSettings || {}) : true;
};

/**
 * Names of the common settings described for this ESC (its firmware and
 * layout revision), or null when there is no description for it.
 *
 * @param {object} esc
 * @returns {Array<string>|null}
 */
const getCommonSettingNames = (esc) => {
  if(!esc || !esc.firmwareName || !esc.layoutRevision) {
    return null;
  }

  const source = getSource(esc.firmwareName);
  if(!source) {
    return null;
  }

  const descriptions = source.getCommonSettings(esc.layoutRevision);
  if(!descriptions || !Array.isArray(descriptions.base)) {
    return null;
  }

  return descriptions.base.map((description) => description.name);
};

export {
  getCommonSettingNames,
  isFlashFailed,
  getIndividualSettings,
  getIndividualSettingsDescriptions,
  getMaster,
  getMasterSettings,
  canMigrate,
  MIGRATION,
  supportsLeds,
};
