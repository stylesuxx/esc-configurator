import sources from '../../sources';

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
const isValidLayout = (layout) => sources.some((s) => layout in s.getEscLayouts());

const getSupportedSources = (signature) => sources.filter((source) => findMCU(signature, source.getMcus()));

export {
  retry,
  delay,
  compare,
  findMCU,
  isValidFlash,
  isValidLayout,
  getSupportedSources,
};
