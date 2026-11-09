import { ConversionError } from '../Errors';

class Convert {
  /**
   * Convert array to matching layout object
   *
   * @param {Uint8Array} settingsUint8Array
   * @param {object} layout
   * @returns {object}
   */
  static arrayToSettingsObject(settingsUint8Array, layout) {
    const object = {};

    for (const [prop, setting] of Object.entries(layout)) {
      const {
        size,
        offset,
      } = setting;

      if (size === 1) {
        object[prop] = settingsUint8Array[offset];
      } else if (size === 2) {
        object[prop] = (settingsUint8Array[offset] << 8) | settingsUint8Array[offset + 1];
      } else if (size > 2) {
        if(prop === 'STARTUP_MELODY') {
          object[prop] = settingsUint8Array.subarray(offset, offset + size);
          object[prop] = Array.from(object[prop]);
        } else {
          object[prop] = String.fromCharCode.apply(undefined, settingsUint8Array.subarray(offset, offset + size)).trim();
        }
      } else {
        throw new ConversionError();
      }
    }

    return object;
  }

  /**
   * Convert a setting object to a matching settings array
   *
   * When the currently stored settings array is passed, it is used as the base
   * for the new array. This way bytes which are not described by our layout are
   * preserved instead of being overwritten - firmware might be storing settings
   * there which we do not (yet) know about.
   *
   * For the same reason the read only string fields (NAME, MCU, LAYOUT) are
   * left untouched when a base array is available: they are never edited by the
   * user and converting them back from string is lossy.
   *
   * @param {object} settingsObject
   * @param {object} layout
   * @param {number} layoutSize
   * @param {Array|Uint8Array} [currentSettingsArray]
   * @returns {Uint8Array}
   */
  static objectToSettingsArray(settingsObject, layout, layoutSize, currentSettingsArray = null) {
    const array = new Uint8Array(layoutSize).fill(0xff);

    const preserveUnknown = !!currentSettingsArray;
    if (preserveUnknown) {
      array.set(Uint8Array.from(currentSettingsArray).subarray(0, layoutSize));
    }

    for (const [prop, setting] of Object.entries(layout)) {
      const {
        size,
        offset,
      } = setting;

      if (size === 1) {
        array[offset] = settingsObject[prop];
      } else if (size === 2) {
        array[offset] = (settingsObject[prop] >> 8) & 0xff;
        array[offset + 1] = settingsObject[prop] & 0xff;
      } else if (size > 2) {
        const isMelody = prop === 'STARTUP_MELODY';

        // Read only string field - keep whatever is currently stored
        if (!isMelody && preserveUnknown) {
          continue;
        }

        const { length } = settingsObject[prop];
        for (let i = 0; i < size; i += 1) {
          if(isMelody) {
            array[offset + i] = i < length ? settingsObject[prop][i] % 256 : 0;
          } else {
            array[offset + i] = i < length ? settingsObject[prop].charCodeAt(i) : ' '.charCodeAt(0);
          }
        }
      } else {
        throw new ConversionError();
      }
    }

    return array;
  }

  /**
   * Convert a buffer to ASCII
   *
   * @param {Uint8Array} buffer
   * @returns {string}
   */
  static bufferToAscii(buffer) {
    return String.fromCharCode.apply(null, buffer);
  }

  /**
   * Convert an ASCII string to buffer
   *
   * @param {string} ascii
   * @returns {Uint8Array}
   */
  static asciiToBuffer(ascii) {
    const buffer = new Uint8Array(ascii.length);

    for (var i = 0; i < ascii.length; i += 1) {
      buffer[i] = ascii.charCodeAt(i);
    }

    return buffer;
  }
}

export default Convert;
