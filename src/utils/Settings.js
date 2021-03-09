import {
  BLHELI_MODES,
} from './Blheli';

const getMasterSettings = (escs) => {
  const master = getMaster(escs);
  if(master) {
    return Object.assign({}, master.settings);
  }

  return {};
};

const getIndividualSettingsDescriptions = (esc) => {
  if(esc) {
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

const getMaster = (escs) => escs.find((esc) => esc.meta.available);

const getAllSettings = (escs) => escs.map((esc) => esc.settings);

const isMulti = (escs) => escs.every((esc) => !esc.settings.MODE || esc.settings.MODE === BLHELI_MODES.MULTI);

export {
  getAllSettings,
  getIndividualSettingsDescriptions,
  getMaster,
  getMasterSettings,
  isMulti,
};
