import blujayEscs from '../../sources/Bluejay/escs.json';
import blheliEscs from '../../sources/Blheli/escs.json';
import openEscEscs from '../../sources/OpenEsc/escs.json';

import {
  BLUEJAY_TYPES,
} from '../Bluejay';

import {
  BLHELI_TYPES,
} from '../Blheli';

import {
  OPEN_ESC_TYPES,
} from '../OpenEsc';

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
          console.debug('Retrying...');
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
  if(blujayEscs.layouts[BLUEJAY_TYPES.EFM8][layout] ||
     blheliEscs.layouts[BLHELI_TYPES.ATMEL][layout] ||
     openEscEscs.layouts[OPEN_ESC_TYPES.ARM][layout] ||
     BLHELI_TYPES.BLHELI_S_SILABS[layout] ||
     BLHELI_TYPES.SILABS[layout]
  ) {
    return true;
  }

  return false;
};

export {
  retry,
  delay,
  compare,
  findMCU,
  isValidFlash,
  isValidLayout,
};
