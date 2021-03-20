import {
  EEPROM as BLUEJAY_EEPROM
} from '../../sources/Bluejay';

const BLUEJAY_TYPES = BLUEJAY_EEPROM.TYPES;

import BLUEJAY_ESCS from '../../sources/Bluejay/escs.json';

import {
  BLHELI_TYPES,
} from '../../sources/Blheli/eeprom';
import BLHELI_ESCS from '../../sources/Blheli/escs.json';

import {
  AM32_TYPES,
} from '../../sources/AM32/eeprom';
import AM32_ESCS from '../../sources/AM32/escs.json';

function compare(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  for (var i = 0; i < a.byteLength; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

async function delay(ms) {
  await new Promise((resolve) => setTimeout(
    resolve,
    ms
  ));
}

function isValidFlash(mcu, flash) {
  // Check instruction at the start of address space
  const firstBytes = flash.subarray(0, 3);
  const ljmpReset = new Uint8Array([0x02, 0x19, 0xFD]);
  const ljmpCheckBootload = new Uint8Array([0x02, 0x19, 0xE0]);

  return !(
    !(mcu.includes('#BLHELI#') ||
    mcu.includes('#BLHELI$')) ||
    (
      !compare(firstBytes, ljmpReset) &&
      !compare(firstBytes, ljmpCheckBootload)
    )
  );
}

/**
 * Expects a function to be resolved or rejected. Retries for a given
 * amount of times.
 */
async function retry(func, maxRetries, iterationDelay = null) {
  function wrapped() {
    return new Promise((resolve,reject) => func(resolve, reject));
  }

  const process = async(resolve, reject) => {
    let retries = 0;
    let done = false;
    let result = null;

    while(!done) {
      try {
        result = await wrapped();
        done = true;
      } catch(e) {
        retries += 1;

        // After max retries we pass through the original error
        if(retries >= maxRetries) {
          return reject(e);
        }

        if(iterationDelay) {
          console.debug(`Retrying: ${e.message}`);
          await delay(iterationDelay * retries);
        }
      }
    }

    return resolve(result);
  };

  return new Promise((resolve, reject) => process(resolve, reject));
}

// signatrue is expected to be a decimal
const findMCU = (signature, MCUList) => MCUList.find((mcu) => parseInt(mcu.signature, 16) === parseInt(signature, 10));

// Check if a given layout is available in any of the sources
const isValidLayout = (layout) => {
  if(BLUEJAY_ESCS.layouts[BLUEJAY_TYPES.EFM8][layout] ||
     BLHELI_ESCS.layouts[BLHELI_TYPES.ATMEL][layout] ||
     AM32_ESCS.layouts[AM32_TYPES.ARM][layout] ||
     BLHELI_TYPES.BLHELI_S_SILABS[layout] ||
     BLHELI_TYPES.SILABS[layout]
  ) {
    return true;
  }

  return false;
};

const getPossibleTypes = (signature) => {
  const types = [];
  if(findMCU(signature, BLUEJAY_ESCS.signatures[BLUEJAY_TYPES.EFM8])) {
    types.push(BLUEJAY_TYPES.EFM8);
  }

  if (findMCU(signature, BLHELI_ESCS.signatures[BLHELI_TYPES.BLHELI_S_SILABS])) {
    types.push(BLHELI_TYPES.BLHELI_S_SILABS);
  }

  if (findMCU(signature, BLHELI_ESCS.signatures[BLHELI_TYPES.SILABS])) {
    types.push(BLHELI_TYPES.SILABS);
  }

  if (findMCU(signature, BLHELI_ESCS.signatures[BLHELI_TYPES.ATMEL])) {
    types.push(BLHELI_TYPES.ATMEL);
  }

  if (findMCU(signature, AM32_ESCS.signatures[AM32_TYPES.ARM])) {
    types.push(AM32_TYPES.ARM);
  }

  return types;
};

export {
  retry,
  delay,
  compare,
  findMCU,
  isValidFlash,
  isValidLayout,
  getPossibleTypes,
};
