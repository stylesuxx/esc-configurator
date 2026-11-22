import {
  blheliSSource,
  bluejaySource,
} from '../sources';
import { getSource } from './helpers/General';
import { isFlashFailed } from './helpers/Settings';

const FORMAT = 'esc-configurator-settings';
const VERSION = 1;

const FIRMWARES = [blheliSSource.getName(), bluejaySource.getName()];

// They describe the firmware and the hardware, not a choice of the pilot
const IDENTITY_KEYS = [
  'BOOT_LOADER_REVISION',
  'LAYOUT',
  'LAYOUT_REVISION',
  'MAIN_REVISION',
  'MCU',
  'NAME',
  'SUB_REVISION',
];

// The direction depends on how each motor is wired: the ESC keeps its own
const DIRECTION_KEYS = ['MOTOR_DIRECTION'];

const isSupportedEsc = (esc) => Boolean(esc && esc.settings) &&
  FIRMWARES.includes(esc.firmwareName) &&
  !isFlashFailed(esc);

/**
 * Only the settings of an ESC go to the file: never its UID, signature or
 * bootloader data.
 *
 * @param {Array<object>} individual
 * @param {number} count
 * @param {Date} date
 * @returns {object}
 */
function buildSettingsFile(individual, count, date = new Date()) {
  return {
    format: FORMAT,
    version: VERSION,
    date: date.toISOString(),
    count,
    escs: individual.filter(isSupportedEsc).map((esc) => ({
      index: esc.index,
      firmwareName: esc.firmwareName,
      layoutRevision: esc.layoutRevision,
      settings: { ...esc.settings },
    })),
  };
}

function getSettingsFileName(date = new Date()) {
  const pad = (n) => n.toString().padStart(2, '0');
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const time = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;

  return `esc-settings_${day}_${time}.json`;
}

/**
 * @param {object} file
 * @param {string} fileName
 * @returns {boolean} false when the browser can not download
 */
function downloadSettingsFile(file, fileName) {
  try {
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch(e) {
    console.debug('Settings file download failed', e);

    return false;
  }
}

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isSavedEsc = (saved) => isObject(saved) &&
  Number.isInteger(saved.index) &&
  saved.index >= 0 &&
  typeof saved.firmwareName === 'string' &&
  typeof saved.layoutRevision === 'string' &&
  isObject(saved.settings);

/**
 * Throws when the text is not a settings file of this version.
 *
 * @param {string} text
 * @returns {object}
 */
function parseSettingsFile(text) {
  const file = JSON.parse(text);
  if(!isObject(file) ||
    file.format !== FORMAT ||
    file.version !== VERSION ||
    typeof file.date !== 'string' ||
    !Number.isInteger(file.count) ||
    !Array.isArray(file.escs) ||
    !file.escs.every(isSavedEsc)) {
    throw new Error('Not a settings file');
  }

  return file;
}

/**
 * @param {object} esc
 * @param {object} saved
 * @returns {boolean} true when the saved ESC runs the same firmware, version
 * and layout
 */
const isSameEsc = (esc, saved) => saved.firmwareName === esc.firmwareName &&
  saved.layoutRevision === esc.layoutRevision &&
  ['MAIN_REVISION', 'SUB_REVISION', 'LAYOUT'].every((key) => saved.settings[key] === esc.settings[key]);

/**
 * Common and individual settings descriptions of an ESC, with the overrides
 * of its version, as the settings screen shows them.
 *
 * @param {object} esc
 * @returns {object} descriptions by setting name
 */
function getDescriptions(esc) {
  const source = getSource(esc.firmwareName);
  const descriptions = {};
  if(!source) {
    return descriptions;
  }

  const revision = `${esc.settings.MAIN_REVISION}.${esc.settings.SUB_REVISION}`;
  [
    source.getCommonSettings(esc.layoutRevision),
    source.getIndividualSettings(esc.layoutRevision),
  ].filter((group) => group && group.base).forEach((group) => {
    const overrides = (group.overrides && group.overrides[revision]) || [];
    group.base.forEach((description) => {
      descriptions[description.name] = overrides.find((override) => override.name === description.name) || description;
    });
  });

  return descriptions;
}

/**
 * Same bounds as the settings screen. Numbers are bound on the value shown,
 * the ESC holds (shown - offset) / factor.
 *
 * @param {object} description
 * @param {*} value
 * @returns {boolean}
 */
function isAllowed(description, value, current) {
  switch(description.type) {
    case 'melody': {
      return Array.isArray(value) &&
        Array.isArray(current) &&
        value.length === current.length &&
        value.every((byte) => Number.isInteger(byte) && byte >= 0 && byte <= 255);
    }

    case 'bool': {
      return value === 0 || value === 1;
    }

    case 'enum': {
      return description.options.some((option) => String(option.value) === String(value));
    }

    case 'number': {
      const factor = description.factor || description.displayFactor || 1;
      const offset = description.offset || description.displayOffset || 0;

      return Number.isInteger(value) &&
        value >= Math.ceil((description.min - offset) / factor) &&
        value <= Math.floor((description.max - offset) / factor);
    }

    default: {
      return false;
    }
  }
}

// A select gives "1" where the ESC holds 1
function isSameValue(a, b) {
  if(Array.isArray(a) || Array.isArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  return String(a) === String(b);
}

const WRITABLE_TYPES = ['bool', 'enum', 'melody', 'number'];

// Written by the melody editor with the melody, so that all ESCs end it together
const MELODY_WAIT = 'STARTUP_MELODY_WAIT_MS';

// 0xFFFF is an erased value: a 65 s silence after the melody
const isAllowedMelodyWait = (value) => Number.isInteger(value) && value >= 0 && value < 0xFFFF;

/**
 * Settings of the saved ESC that may be written to the ESC, and the names of
 * those out of the bounds of the settings screen.
 *
 * @param {object} esc
 * @param {object} saved
 * @returns {{ settings: object, rejected: Array<string> }}
 */
function getLoadedSettings(esc, saved) {
  const descriptions = getDescriptions(esc);
  const settings = {};
  const rejected = [];
  Object.keys(descriptions).forEach((name) => {
    const description = descriptions[name];
    const value = saved.settings[name];
    if(value === undefined ||
      IDENTITY_KEYS.includes(name) ||
      DIRECTION_KEYS.includes(name)) {
      return;
    }

    let allowed = false;
    if(name === MELODY_WAIT) {
      allowed = isAllowedMelodyWait(value);
    } else if(WRITABLE_TYPES.includes(description.type)) {
      allowed = isAllowed(description, value, esc.settings[name]);
    } else {
      return;
    }

    if(allowed) {
      settings[name] = value;
    } else {
      rejected.push(name);
    }
  });

  return {
    settings,
    rejected,
  };
}

function getValueText(description, value) {
  if(description.type === 'enum') {
    const option = description.options.find((item) => String(item.value) === String(value));
    if(option) {
      return option.label;
    }
  }

  return value;
}

/**
 * @param {object} esc
 * @param {object} settings
 * @returns {Array<object>} label and values shown of each changed setting
 */
function getSettingChanges(esc, settings) {
  const descriptions = getDescriptions(esc);

  return Object.keys(settings)
    .filter((name) => !isSameValue(esc.settings[name], settings[name]))
    .map((name) => ({
      name,
      type: descriptions[name].type,
      label: descriptions[name].label,
      before: getValueText(descriptions[name], esc.settings[name]),
      after: getValueText(descriptions[name], settings[name]),
    }));
}

const getMismatchedSettings = (written, read) => Object.keys(written)
  .filter((name) => !isSameValue(written[name], read[name]));

/**
 * ESCs to change, with the settings to write and the changes they make. Each
 * ESC only takes the saved ESC at its own position, with the same firmware,
 * version and layout.
 *
 * @param {Array<object>} individual
 * @param {object} file
 * @returns {{ plans: Array<object>, messages: Array<object> }} messages to log
 */
function getLoadPlans(individual, file) {
  const plans = [];
  const messages = [];
  individual.forEach((esc) => {
    const index = esc.index + 1;
    if(!isSupportedEsc(esc)) {
      messages.push({
        key: 'settingsLoadSkippedFirmware',
        params: { index },
      });

      return;
    }

    const saved = file.escs.find((item) => item.index === esc.index);
    if(!saved) {
      messages.push({
        key: 'settingsLoadSkippedMissing',
        params: { index },
      });

      return;
    }

    if(!isSameEsc(esc, saved)) {
      messages.push({
        key: 'settingsLoadSkippedVersion',
        params: { index },
      });

      return;
    }

    const {
      rejected,
      settings,
    } = getLoadedSettings(esc, saved);
    if(rejected.length > 0) {
      messages.push({
        key: 'settingsLoadOutOfBounds',
        params: {
          index,
          names: rejected.join(', '),
        },
      });
    }

    const changes = getSettingChanges(esc, settings);
    if(changes.length > 0) {
      plans.push({
        changes,
        esc,
        settings,
      });
    }
  });

  return {
    messages,
    plans,
  };
}

/**
 * @param {Array<object>} plans
 * @param {function} t translates a key of the common namespace
 * @returns {Array<string>} one line per change
 */
function getPreviewLines(plans, t) {
  return plans.flatMap((plan) => plan.changes.map((change) => {
    const index = plan.esc.index + 1;
    if(change.type === 'melody') {
      return t('settingsLoadPreviewMelody', { index });
    }

    if(change.name === MELODY_WAIT) {
      return t('settingsLoadPreviewMelodyWait', {
        ...change,
        index,
      });
    }

    return t('settingsLoadPreviewLine', {
      ...change,
      index,
      label: t(change.label, { defaultValue: change.label }),
    });
  }));
}

/**
 * @param {Array<object>} plans
 * @param {Array<object>} individual the ESCs read after writing
 * @returns {Array<object>} messages to log, one per ESC written
 */
function checkLoadedSettings(plans, individual) {
  return plans.map((plan) => {
    const index = plan.esc.index + 1;
    const read = individual.find((esc) => esc.index === plan.esc.index);
    const names = getMismatchedSettings(plan.settings, (read && read.settings) || {});
    if(names.length > 0) {
      return {
        key: 'settingsLoadMismatch',
        params: {
          index,
          names: names.join(', '),
        },
      };
    }

    return {
      key: 'settingsLoadVerified',
      params: { index },
    };
  });
}

export {
  buildSettingsFile,
  checkLoadedSettings,
  downloadSettingsFile,
  getDescriptions,
  getLoadPlans,
  getLoadedSettings,
  getMismatchedSettings,
  getPreviewLines,
  getSettingChanges,
  getSettingsFileName,
  isAllowed,
  isSameEsc,
  isSameValue,
  isSupportedEsc,
  parseSettingsFile,
};
