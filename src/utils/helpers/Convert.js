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
   * @param {object} settingsObject
   * @param {object} layout
   * @param {number} layoutSize
   * @returns {Uint8Array}
   */
  static objectToSettingsArray(settingsObject, layout, layoutSize) {
    const array = new Uint8Array(layoutSize).fill(0xff);

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
        const { length } = settingsObject[prop];
        for (let i = 0; i < size; i += 1) {
          if(prop === 'STARTUP_MELODY') {
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
