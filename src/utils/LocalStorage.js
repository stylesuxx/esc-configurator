import { serial as serialPolyfill } from 'web-serial-polyfill';
import i18next from 'i18next';

import settings from '../settings.json';

const {
  availableLanguages,
  defaultAppSettings,
  defaultLanguage,
} = settings;

function clearLog() {
  localStorage.setItem('log', JSON.stringify([]));

  return [];
}

function loadCookie() {
  const cookie = localStorage.getItem('cookie');

  return cookie === 'true';
}

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

  if(storedLanguage) {
    i18next.changeLanguage(storedLanguage);
  }

  return(storedLanguage || defaultLanguage);
}

function loadLog() {
  // Load previously stored log messages and sanitize to a max line count
  const storedLog = JSON.parse(localStorage.getItem('log'));
  if(storedLog) {
    return storedLog.slice(-10000);
  }

  return [];
}

function loadMelodies() {
  const storedMelodies = JSON.parse(localStorage.getItem('melodies'));
  if(storedMelodies) {
    return storedMelodies;
  }

  return [];
}

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

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('settings')) || {};
  return {
    ...defaultAppSettings,
    ...settings,
  };
}

export {
  clearLog,
  loadCookie,
  loadLanguage,
  loadLog,
  loadMelodies,
  loadSerialApi,
  loadSettings,
};
