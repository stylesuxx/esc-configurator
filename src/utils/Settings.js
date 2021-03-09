import {
  BLHELI_MODES,
} from './Blheli';

const getMasterSettings = (escs) => {
  const master = getMaster(escs);
  if(master) {
    return master.settings;
  }

  return {};
};

const getMaster = (escs) => escs.find((esc) => esc.meta.available);

const getAllSettings = (escs) => escs.map((esc) => esc.settings);

const isMulti = (escs) => escs.every((esc) => !esc.settings.MODE || esc.settings.MODE === BLHELI_MODES.MULTI);

export {
  getAllSettings,
  getMaster,
  getMasterSettings,
  isMulti,
};
