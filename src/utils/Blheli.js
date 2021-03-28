import {
  BLHELI_MODES,
} from '../sources/Blheli/eeprom';

class Blheli {
  modeToString(mode) {
    for (const property in BLHELI_MODES) {
      if (Object.prototype.hasOwnProperty.call(
        BLHELI_MODES,
        property
      )) {
        if (BLHELI_MODES[property] === mode) {
          return property;
        }
      }
    }
  }

  settingsObject(settingsUint8Array, layout) {
    const object = {};

    for (const prop in layout) {
      if (Object.prototype.hasOwnProperty.call(
        layout,
        prop
      )) {
        const setting = layout[prop];

        if (setting.size === 1) {
          object[prop] = settingsUint8Array[setting.offset];
        } else if (setting.size === 2) {
          object[prop] = settingsUint8Array[setting.offset] << 8 |
            settingsUint8Array[setting.offset + 1];
        } else if (setting.size > 2) {
          if(prop === 'STARTUP_MELODY') {
            object[prop] = settingsUint8Array.subarray(setting.offset).subarray(0, setting.size);
          } else {
            object[prop] = String.fromCharCode.apply(
              undefined,
              settingsUint8Array.subarray(setting.offset).subarray(0, setting.size)
            ).trim();
          }
        } else {
          throw new Error('Logic error');
        }
      }
    }

    return object;
  }

  settingsArray(settingsObject, layout, layoutSize) {
    const array = new Uint8Array(layoutSize).fill(0xff);

    for (const prop in layout) {
      if (Object.prototype.hasOwnProperty.call(
        layout,
        prop
      )) {
        const setting = layout[prop];

        if (setting.size === 1) {
          array[setting.offset] = settingsObject[prop];
        } else if (setting.size === 2) {
          array[setting.offset] = settingsObject[prop] >> 8 & 0xff;
          array[setting.offset + 1] = settingsObject[prop] & 0xff;
        } else if (setting.size > 2) {
          const { length } = settingsObject[prop];
          for (let i = 0; i < setting.size; i += 1) {
            if(prop === 'STARTUP_MELODY') {
              array[setting.offset + i] = i < length ? settingsObject[prop][i] % 256 : 0;
            } else {
              array[setting.offset + i] = i < length ? settingsObject[prop].charCodeAt(i) : ' '.charCodeAt(0);
            }
          }
        } else {
          throw new Error('Logic error');
        }
      }
    }

    return array;
  }
}

export default Blheli;
