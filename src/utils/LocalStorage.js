import { serial as serialPolyfill } from 'web-serial-polyfill';
import i18next from 'i18next';

import settings from '../settings.json';

const {
  availableLanguages,
  defaultAppSettings,
  defaultLanguage,
} = settings;

function loadLanguage() {
  let storedLanguage = localStorage.getItem('language');
  if(!storedLanguage) {
    const browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
    if(browserLanguage) {
      for(let [key, value] of Object.entries(availableLanguages)) {
        if(value.value === browserLanguage) {
          storedLanguage = browserLanguage;
          break;
        }
      }

      if(!storedLanguage && browserLanguage.split('-').length > 1) {
        const part = browserLanguage.split('-')[0];
        for(let [key, value] of Object.entries(availableLanguages)) {
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

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('settings')) || {};
  return {
    ...defaultAppSettings,
    ...settings,
  };
}

function loadSerialApi() {
  if('serial' in navigator) {
    return navigator.serial;
  }

  if('usb' in navigator) {
    return serialPolyfill;
  }

  return null;
}

export {
  loadLanguage,
  loadLog,
  loadMelodies,
  loadSerialApi,
  loadSettings,
};
