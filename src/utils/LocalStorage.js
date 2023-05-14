import { serial as serialPolyfill } from 'web-serial-polyfill';

import settings from '../settings.json';

const {
  availableLanguages,
  defaultAppSettings,
  defaultLanguage,
} = settings;

const MAX_LOG_LENGTH = 10000;

/**
 * Returns a previously stored language, an auto detected language or the
 * default language as a last fallback.
 *
 * @returns {string}
 */
function loadLanguage() {
  let storedLanguage = localStorage.getItem('language');
  if(!storedLanguage) {
    const browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
    if(browserLanguage) {
      for(let [, value] of Object.entries(availableLanguages)) {
        if(value.value === browserLanguage) {
          storedLanguage = browserLanguage;
          break;
        }
      }

      if(!storedLanguage && browserLanguage.split('-').length > 1) {
        const part = browserLanguage.split('-')[0];
        for(let [, value] of Object.entries(availableLanguages)) {
          if(value.value === part) {
            storedLanguage = part;
            break;
          }
        }
      }
    }
  }

  return(storedLanguage || defaultLanguage);
}

/**
 * Returns the log. If the log is longer than a set amount of lines, a truncated
 * version of the log is returned.
 *
 * @returns {Array<string>}
 */
function loadLog() {
  const storedLog = JSON.parse(localStorage.getItem('log'));
  if(storedLog) {
    return storedLog.slice(-MAX_LOG_LENGTH);
  }

  return [];
}

/**
 * Clears the log
 *
 * @returns {Array<string>}
 */
function clearLog() {
  localStorage.setItem('log', JSON.stringify([]));

  return [];
}

/**
 * Returns an array of previously stored melodies
 *
 * @returns {Array<object>}
 */
function loadMelodies() {
  const storedMelodies = JSON.parse(localStorage.getItem('melodies'));
  if(storedMelodies) {
    return storedMelodies;
  }

  return [];
}

/**
 * Returns a settings object overwriting the defaults with user saved settings
 *
 * @returns {object}
 */
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('settings')) || {};
  return {
    ...defaultAppSettings,
    ...settings,
  };
}

/**
 * Checks browser and returns preferred serial API.
 *
 * @returns {Serial}
 */
function loadSerialApi() {
  if('serial' in navigator) {
    return navigator.serial;
  }

  // Brave has USB support but it does not work properly with the polyfill
  if(
    'usb' in navigator &&
    !('brave' in navigator)
  ) {
    return serialPolyfill;
  }

  return null;
}

export {
  clearLog,
  loadLanguage,
  loadLog,
  loadMelodies,
  loadSerialApi,
  loadSettings,
};
