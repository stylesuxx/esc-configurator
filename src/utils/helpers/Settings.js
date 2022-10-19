import { blheliAtmelSource as blheliSource } from '../../sources';

const blheliEeprom = blheliSource.getEeprom();

const getMasterSettings = (escs) => {
  const master = getMaster(escs);
  if(master) {
    return { ...master.settings };
  }

  return {};
};

/**
 * Return the individaul settings for each ESC - include fixed fields
 */
const getIndividualSettingsDescriptions = (esc) => {
  if(esc && esc.individualSettingsDescriptions) {
    const descriptions = esc.individualSettingsDescriptions;
    const individualGroups = Object.keys(descriptions);
    const keep = ['MAIN_REVISION', 'SUB_REVISION', 'LAYOUT', 'LAYOUT_REVISION', 'NAME'];
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

const getIndividualSettings = (esc) => {
  const individualSettings = {};
  const individualKeep = getIndividualSettingsDescriptions(esc);

  for(let j = 0; j < individualKeep.length; j += 1) {
    const setting = individualKeep[j];
    individualSettings[setting] = esc.settings[setting];
  }

  return individualSettings;
};

const getMaster = (escs) => escs.find((esc) => esc.meta.available);

const getAllSettings = (escs) => escs.map((esc) => esc.settings);

const isMulti = (escs) => escs.every((esc) => !esc.settings.MODE || esc.settings.MODE === blheliEeprom.MODES.MULTI);

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
  isMulti,
  canMigrate,
};
