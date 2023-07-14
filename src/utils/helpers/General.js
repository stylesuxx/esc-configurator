import sources from '../../sources';
import { store } from '../../store';

/**
 * Deeply compare two ByteArrays to each other
 *
 * @param {ByteArray} a
 * @param {ByteArray} b
 * @returns {boolean}
 */
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

/**
 * Delay for a given amount of ms
 *
 * @param {number} ms
 */
async function delay(ms) {
  await new Promise((resolve) => setTimeout(
    resolve,
    ms
  ));
}

/**
 * Check if given flash is valid
 *
 * @param {string} mcu
 * @param {Uint8Array} flash
 * @returns {boolean}
 */
function isValidFlash(mcu, flash) {
  // Check instruction at the start of address space
  const firstBytes = flash.subarray(0, 3);
  const ljmpReset = new Uint8Array([0x02, 0x19, 0xFD]);
  const ljmpResetBB51 = new Uint8Array([0x02, 0x2F, 0xFD]);
  const ljmpCheckBootload = new Uint8Array([0x02, 0x19, 0xE0]);

  return !(
    !(mcu.includes('#BLHELI#') || mcu.includes('#BLHELI$')) ||
    (
      !compare(firstBytes, ljmpReset) &&
      !compare(firstBytes, ljmpCheckBootload) &&
      !compare(firstBytes, ljmpResetBB51)
    )
  );
}

/**
 * Expects a function to be resolved or rejected. Retries for a given amount of
 * times
 *
 * @param {function} func
 * @param {number} maxRetries
 * @param {number} iterationDelay
 */
async function retry(func, maxRetries, iterationDelay = 0) {
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
          await delay(iterationDelay * retries);
        }
      }
    }

    return resolve(result);
  };

  return new Promise((resolve, reject) => process(resolve, reject));
}

/**
 * Check if a given signature can be found in a given list
 *
 * @param {number} signature
 * @param {Array<string>} MCUList
 * @returns
 */
const findMCU = (signature, MCUList) => MCUList.find((mcu) => parseInt(mcu.signature, 16) === signature);

/**
 * Check if the given layout matches any of the available layouts from any of
 * the sources
 *
 * @param {string} layout
 * @returns {boolean}
 */
const isValidLayout = (layout) => sources.some((source) => source.isValidLayout(layout));

/**
 * Return a list of matching sources for a given signature
 *
 * @param {number} signature
 * @returns {Array<sources>}
 */
const getSupportedSources = (signature) => sources.filter((source) => findMCU(signature, source.getMcus()));

const getAppSetting = (name) => store.getState().settings.settings[name].value;

const getPwm = (name, version) => {
  const source = sources.filter((source) => source.name === name);

  if(source.length > 0) {
    return source[0].getPwm(version);
  }

  return [];
};

const getSource = (name) => {
  const options = sources.filter((source) => source.getName() === name);
  if(options.length > 0) {
    return options[0];
  }

  return null;
};

export {
  retry,
  delay,
  compare,
  findMCU,
  isValidFlash,
  isValidLayout,
  getSupportedSources,
  getAppSetting,
  getPwm,
  getSource,
};
