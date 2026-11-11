/**
 * Flashing a BLHeli_S / Bluejay ESC (SiLabs) whose power is cut during the
 * flash, against a simulated ESC: its flash memory is an array, erased by
 * hardware page like the real MCU. The real page, verification and safeguard
 * steps run unchanged; only the bootloader commands are simulated.
 */
import { TextDecoder } from 'util';

import Flash from '../helpers/Flash';
import { TimeoutError } from '../helpers/QueueProcessor';

global.TextDecoder = TextDecoder;

const fs = require('fs');

const HEX = fs.readFileSync(`${__dirname}/../helpers/__tests__/valid.hex`).toString();

// EFM8BB21 (signature 0xE8B2): 512 byte pages, EEPROM 0x1A00, bootloader 0x1C00
const BB21 = {
  signature: 0xE8B2,
  size: 0x2000,
  hardwarePage: 512,
  eeprom: 0x1A00,
  bootloader: 0x1C00,
};

const esc = {
  firmwareName: 'Bluejay',
  isArm: false,
  isSiLabs: true,
  meta: {
    interfaceMode: 1,
    signature: BB21.signature,
  },
  settings: {},
};

function makeMemory() {
  const image = Flash.fillImage(Flash.parseHex(HEX), BB21.size, 0);
  const memory = new Uint8Array(BB21.size).fill(0xFF);
  memory.set(image.subarray(0, BB21.bootloader));

  return {
    image,
    memory,
  };
}

/**
 * Simulated bootloader behind the real 4-way commands: answers after "delay"
 * ms, as long as "alive" returns true. A dead ESC either times out like the
 * serial queue does, or never answers at all.
 */
function makeSerial(memory, {
  delay = 1,
  alive = () => true,
  mode = 'timeout',
} = {}) {
  return jest.fn((buffer) => new Promise((resolve, reject) => {
    const view = new Uint8Array(buffer);
    const command = view[1];

    // Keep alive and exit are answered by the flight controller
    const toEsc = command !== 0x30 && command !== 0x34;
    if(toEsc && !alive()) {
      if(mode === 'timeout') {
        setTimeout(() => reject(new TimeoutError('Timed out after 1000ms')), 1000);
      }

      return;
    }

    const address = (view[2] << 8) | view[3];
    const count = view[4] === 0 ? 256 : view[4];
    const params = view.slice(5, 5 + count);
    let answer = [0];

    if(command === 0x37) {
      // cmd_DeviceInitFlash
      answer = [BB21.signature & 0xFF, BB21.signature >> 8, 0x00, 0x01];
    } else if(command === 0x3a) {
      // cmd_DeviceRead
      const bytes = params[0] === 0 ? 256 : params[0];
      answer = memory.slice(address, address + bytes);
    } else if(command === 0x3b) {
      // cmd_DeviceWrite
      memory.set(params, address);
    } else if(command === 0x39) {
      // cmd_DevicePageErase
      const start = Math.floor((params[0] * 512) / BB21.hardwarePage) * BB21.hardwarePage;
      memory.fill(0xFF, start, start + BB21.hardwarePage);
    }

    setTimeout(() => resolve({
      command,
      address,
      ack: 0,
      params: answer,
    }), delay);
  }));
}

async function runFlash(serial, maxSeconds) {
  const FourWay = require('../FourWay').default;
  const fourWay = new FourWay(serial);
  fourWay.logCallback = jest.fn();
  fourWay.getInfo = jest.fn(async() => ({
    index: 0,
    settings: {},
  }));

  const start = Date.now();
  let settled = false;
  let result;
  fourWay.writeHex(0, esc, HEX, false, false, jest.fn()).then((value) => {
    settled = true;
    result = value;
  }, (e) => {
    settled = true;
    result = e;
  });

  for(let i = 0; i < maxSeconds * 4 && !settled; i += 1) {
    jest.advanceTimersByTime(250);
    for(let j = 0; j < 20; j += 1) {
      await Promise.resolve();
    }
  }

  return {
    settled,
    result,
    elapsed: Date.now() - start,
    fourWay,
  };
}

describe('SiLabs flash with the ESC power cut', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Cut points over the whole flash: safeguard, bootloader jump, code pages
  // (erase, write, verify), first pages and EEPROM section
  [1, 4, 8, 20, 40, 60, 75, 85].forEach((cutAt) => {
    ['timeout', 'silent'].forEach((mode) => {
      it(`should give up within 60 s, cut after ${cutAt} commands (${mode})`, async() => {
        const { memory } = makeMemory();
        let count = 0;
        const serial = makeSerial(memory, {
          mode,
          alive: () => {
            count += 1;
            return count <= cutAt;
          },
        });

        const outcome = await runFlash(serial, 90);

        expect(outcome.settled).toBeTruthy();
        expect(outcome.result).toBeNull();
        expect(outcome.elapsed).toBeLessThan(60000);
      });
    });
  });

  it('should log that the flash was given up', async() => {
    const { memory } = makeMemory();
    let count = 0;
    const serial = makeSerial(memory, {
      mode: 'silent',
      alive: () => {
        count += 1;
        return count <= 20;
      },
    });

    const outcome = await runFlash(serial, 90);

    expect(outcome.fourWay.logCallback).toHaveBeenCalledWith('flashingEscStalled', {
      index: 1,
      seconds: 30,
    });
  });
});

describe('SiLabs flash on a slow but healthy ESC', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not be given up when every answer takes 900 ms', async() => {
    const {
      image,
      memory,
    } = makeMemory();
    const serial = makeSerial(memory, { delay: 900 });

    const outcome = await runFlash(serial, 600);

    expect(outcome.settled).toBeTruthy();
    expect(outcome.result).not.toBeNull();
    expect(outcome.result).not.toBeInstanceOf(Error);
    expect(outcome.fourWay.logCallback).not.toHaveBeenCalledWith('flashingEscStalled', expect.anything());
    expect(memory.subarray(0, BB21.bootloader)).toEqual(image.subarray(0, BB21.bootloader));
  });
});
