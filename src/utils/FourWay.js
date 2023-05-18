import Convert from './helpers/Convert';
import Flash from './helpers/Flash';
import {
  BufferLengthMismatchError,
  EscInitError,
  InvalidHexFileError,
  LayoutMismatchError,
  MessageNotOkError,
  SettingsVerificationError,
  TooManyParametersError,
  UnknownInterfaceError,
  UnknownPlatformError,
} from './Errors';

import {
  am32Source,
  blheliAtmelSource as blheliSource,
  blheliSSource,
  bluejaySource,
  classes as sources,
} from '../sources';

import {
  canMigrate,
  getIndividualSettings,
} from './helpers/Settings';

import {
  delay,
  getAppSetting,
  retry,
  compare,
  isValidFlash,
  getSource,
} from './helpers/General';

import FourWayHelper from './helpers/FourWay';

import MCU from './Hardware/MCU';
import Silabs from './Hardware/Silabs';
import Arm from './Hardware/Arm';

import {
  ACK,
  COMMANDS,
  MODES,
} from './FourWayConstants';
import { NotEnoughDataError } from './helpers/QueueProcessor';

import { store } from '../store';
import { incrementByAmount as incrementPacketErrorsByAmount } from '../Components/Statusbar/statusSlice';

const blheliEeprom = blheliSSource.getEeprom();
const blheliSettingsDescriptions = blheliSSource.getSettingsDescriptions();
const bluejayEeprom = bluejaySource.getEeprom();
const bluejaySettingsDescriptions = bluejaySource.getSettingsDescriptions();
const am32Eeprom = am32Source.getEeprom();
const am32SettingsDescriptions = am32Source.getSettingsDescriptions();

/**
 * @typedef Response
 * @property {number} ack
 * @property {number} address
 * @property {number} checksum
 * @property {number} command
 * @property {Uint8Array} params
 */

class FourWay {
  /**
   * Wrapper class to communicate with the four way interface via an established
   * serial connection.
   *
   * @param {function} serial
   */
  constructor(serial) {
    this.serial = serial;

    this.lastCommandTimestamp = 0;

    this.totalBytes = 0;
    this.bytesWritten = 0;
    this.progressCallback = null;

    this.logCallback = null;
    this.packetErrorsCallback = null;

    this.parseMessage = this.parseMessage.bind(this);
  }

  /**
   * Setter for log callback
   *
   * @param {function} logCallback
   */
  setLogCallback(logCallback) {
    this.logCallback = logCallback;
  }

  /**
   * Invoke log callback if available
   *
   * @param {string} message
   * @param {array} params
   */
  addLogMessage(message, params) {
    if(this.logCallback) {
      this.logCallback(message, params);
    }
  }

  /**
   * Invoke packet error callback with count
   *
   * @param {number} count Packet error count
   */
  increasePacketErrors(count) {
    store.dispatch(incrementPacketErrorsByAmount(count));
  }

  /**
   * Triggers sending a keep alive command if enough time has past between now
   * and the last command.
   */
  start() {
    this.interval = setInterval(async() => {
      if (Date.now() - this.lastCommandTimestamp > 900) {
        try {
          await this.testAlive();
        } catch (error) {
          console.debug('Alive Test failed');
        }
      }
    }, 800);
  }

  /**
   * Calculate a X-Modem checksum
   *
   * @param {number} crc
   * @param {number} byte
   * @returns {number}
   */
  crc16XmodemUpdate(crc, byte) {
    const polynomic = 0x1021;
    crc ^= byte << 8;
    for (let i = 0; i < 8; i += 1) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomic;
      } else {
        crc <<= 1;
      }
    }

    return crc & 0xffff;
  }

  /**
   * Create a message ready to be sent to the four way interface
   *
   * @param {number} command
   * @param {Array.<number>} params
   * @param {number} address
   * @returns {ArrayBuffer}
   */
  createMessage(command, params, address) {
    const pc = 0x2f;

    // Ensure parameters are correctly set
    if (params.length === 0) {
      params.push(0);
    } else if (params.length > 256) {
      throw new TooManyParametersError(params.length);
    }

    const bufferOut = new ArrayBuffer(7 + params.length);
    const bufferView = new Uint8Array(bufferOut);

    // Fill header
    bufferView[0] = pc;
    bufferView[1] = command;
    bufferView[2] = (address >> 8) & 0xff;
    bufferView[3] = address & 0xff;
    bufferView[4] = params.length === 256 ? 0 : params.length;

    // Copy params
    const outParams = bufferView.subarray(5);
    for (let i = 0; i < params.length; i += 1) {
      outParams[i] = params[i];
    }

    // Calculate checksum
    const msgWithoutChecksum = bufferView.subarray(0, -2);
    const checksum = msgWithoutChecksum.reduce(this.crc16XmodemUpdate, 0);

    bufferView[5 + params.length] = (checksum >> 8) & 0xff;
    bufferView[6 + params.length] = checksum & 0xff;

    return bufferOut;
  }

  /**
   * Parse a message and invoke either resolve or reject callback
   *
   * @param {ArrayBuffer} buffer
   * @param {function} resolve
   * @param {function} reject
   * @returns {Promise}
   */
  parseMessage(buffer, resolve, reject) {
    const fourWayIf = 0x2e;

    let view = new Uint8Array(buffer);
    if (view[0] !== fourWayIf) {
      const error = `invalid message start: ${view[0]}`;
      return reject(new Error(error));
    }

    if (view.length < 9) {
      return reject(new NotEnoughDataError());
    }

    let paramCount = view[4];
    if (paramCount === 0) {
      paramCount = 256;
    }

    if (view.length < 8 + paramCount) {
      return reject(new NotEnoughDataError());
    }

    const message = {
      command: view[1],
      address: (view[2] << 8) | view[3],
      ack: view[5 + paramCount],
      checksum: (view[6 + paramCount] << 8) | view[7 + paramCount],
      params: view.slice(5, 5 + paramCount),
    };

    const msgWithoutChecksum = view.subarray(0, 6 + paramCount);
    const checksum = msgWithoutChecksum.reduce(this.crc16XmodemUpdate, 0);

    if (checksum !== message.checksum) {
      this.increasePacketErrors(1);

      const error = `checksum mismatch, received: ${message.checksum}, calculated: ${checksum}`;
      console.debug(error);
      return reject(new Error(error));
    }

    return resolve(message);
  }

  /**
   * Send a message
   *
   * If it does not succees, sending the command is retried a given amount of
   * times before it is finally rejected.
   *
   * @param {number} command
   * @param {Array.<number>} params
   * @param {number} address
   * @param {number} retries
   * @returns {Promise}
   */
  sendMessagePromised(command, params = [0], address = 0, retries = 10) {
    const process = async (resolve, reject) => {
      this.lastCommandTimestamp = Date.now();
      const message = this.createMessage(command, params, address);

      // Debug print all messages except the keep alive messages
      if (getAppSetting('extendedDebug') && command !== COMMANDS.cmd_InterfaceTestAlive) {
        const paramsHex = Array.from(params).map((param) => `0x${param.toString(0x10).toUpperCase()}`);
        console.debug(`TX: ${FourWayHelper.commandToString(command)}${address ? ' @ 0x' + address.toString(0x10).toUpperCase() : ''} - ${paramsHex}`);
      }

      const processMessage = async(resolve, reject) => {
        /**
         * Immediately resolve the exit command since it will not produce any
         * processable output.
         */
        if (command === COMMANDS.cmd_InterfaceExit) {
          await this.serial(message, null);
          return resolve();
        }

        try {
          const msg = await this.serial(message, this.parseMessage);
          if (msg && msg.ack === ACK.ACK_OK) {
            if (getAppSetting('extendedDebug') && command !== COMMANDS.cmd_InterfaceTestAlive) {
              const paramsHex = Array.from(msg.params).map((param) => `0x${param.toString(0x10).toUpperCase()}`);
              console.debug(`RX: ${FourWayHelper.commandToString(msg.command)}${msg.address ? ' @ 0x' + address.toString(0x10).toUpperCase() : ''} - ${paramsHex}`);
            }
            return resolve(msg);
          }
        } catch(e) {
          console.debug(`Command ${FourWayHelper.commandToString(command)} failed: ${e.message}`);
          return reject(e);
        }

        return reject(new MessageNotOkError('Message not OK'));
      };

      try {
        const result = await retry(processMessage, retries, 250);
        return resolve(result);
      } catch(e) {
        console.debug(`Failed processing command ${FourWayHelper.commandToString(command)} after ${retries} retries.`);
        reject(e);
      }
    };

    return new Promise((resolve, reject) => process(resolve, reject));
  }

  /**
   * Flash preflight for making sure that the provided hex works with the current esc hardware
   *
   * @param {object} esc
   * @param {object} hex
   * @param {boolean} force
   *
   * @throws {Error} if the firmware file does not match the MCU type or filename
   */
  async flashPreflight(esc, hex, force) {
    const info = await this.getInfo(esc.index);
    const meta = info.meta;

    // if current firmware version is 1.93 or higher, we will only flash firmware matching MCU type and throw a error if fileName is different
    if (info.isArm && meta.am32.fileName && !force) {
      const mcu = new MCU(esc.meta.interfaceMode, esc.meta.signature);
      const eepromOffset = mcu.getEepromOffset();
      const offset = 0x8000000;
      const fileNamePlaceOffset = 30;

      const fileFlash = Flash.parseHex(hex);
      const findFileNameBlock = fileFlash.data.find((d) =>
        (eepromOffset - fileNamePlaceOffset) > (d.address - offset) &&
        (eepromOffset - fileNamePlaceOffset) < (d.address - offset + d.bytes)
      );

      if (!findFileNameBlock) {
        this.addLogMessage('flashingEscMissmatchFileNameMissing', { index: esc.index + 1 });
        throw new InvalidHexFileError('File name not found in hex file.');
      }

      const hexFileName = new TextDecoder().decode(new Uint8Array(findFileNameBlock.data).slice(0, findFileNameBlock.data.indexOf(0x00)));
      if (!hexFileName.endsWith(meta.am32.mcuType)) {
        this.addLogMessage('flashingEscMissmatchMcuType', { index: esc.index + 1 });
        throw new InvalidHexFileError('Invalid MCU type in hex file.');
      }

      const currentFileName = hexFileName.slice(0, hexFileName.lastIndexOf('_'));
      const expectedFileName = meta.am32.fileName.slice(0, meta.am32.fileName.lastIndexOf('_'));
      if ( currentFileName !== expectedFileName) {
        this.addLogMessage('flashingEscMissmatchFileName', { index: esc.index + 1 });
        throw new LayoutMismatchError(expectedFileName, currentFileName);
      }
    }
  }

  /**
   * Get information of a certain ESC
   *
   * @param {number} target
   * @returns {object}
   */
  async getInfo(target) {
    const flash = await this.initFlash(target, 5);
    const info = Flash.getInfo(flash);

    try {
      let mcu = null;
      try {
        mcu = new MCU(info.meta.interfaceMode, info.meta.signature);
        if (!mcu.class) {
          console.debug('Unknown MCU class.');
          throw new UnknownPlatformError('Neither SiLabs nor Arm');
        }
      } catch(e) {
        console.log('Unknown interface', e);
        throw new UnknownPlatformError('Neither SiLabs nor Arm');
      }

      let source = null;
      if (mcu.class === Silabs) {
        // Assume BLHeli_S to be the default
        source = blheliSSource;

        const eepromOffset = mcu.getEepromOffset();

        info.layout = source.getLayout();
        info.layoutSize = source.getLayoutSize();
        info.settingsArray = (await this.read(eepromOffset, info.layoutSize)).params;
        info.settings = Convert.arrayToSettingsObject(info.settingsArray, info.layout);

        // Check if Bluejay
        if(bluejaySource.isValidName(info.settings.NAME)) {
          source = bluejaySource;

          info.layout = source.getLayout();
          info.layoutSize = bluejaySource.getLayoutSize();
          info.settingsArray = (await this.read(eepromOffset, info.layoutSize)).params;
          info.settings = Convert.arrayToSettingsObject(info.settingsArray, info.layout);
        }
      }

      if (mcu.class === Arm) {
        // Assume AM32 to be the default
        source = am32Source;

        const eepromOffset = mcu.getEepromOffset();

        //Attempt reading filename
        try {
          const fileNameRead = await this.read(eepromOffset - 32, 16);
          const fileName = new TextDecoder().decode(fileNameRead.params.slice(0, fileNameRead.params.indexOf(0x00)));

          if (/[A-Z0-9_]+/.test(fileName)) {
            info.meta.am32.fileName = fileName;
            info.meta.am32.mcuType = fileName.slice(fileName.lastIndexOf('_') + 1);
          }
        } catch(e) {
          // Failed reading filename - could be old version of AM32
        }

        info.layout = source.getLayout();
        info.layoutSize = source.getLayoutSize();
        info.settingsArray = (await this.read(eepromOffset, info.layoutSize)).params;
        info.settings = Convert.arrayToSettingsObject(info.settingsArray, info.layout);

        /**
         * If not AM32, then very likely BLHeli_32, even if not - we can't
         * handle it.
         */
        if(!Object.values(am32Eeprom.BOOT_LOADER_PINS).includes(info.meta.input)) {
          source = null;

          info.settings.NAME = 'Unknown';

          // TODO: Find out if there is a way to reliably identify BLHeli_32
          // info.settings.NAME = 'BLHeli_32';
        }
      }

      /**
       * Try to guess firmware type if it was not properly set in the EEPROM
       */
      if(info.settings.NAME === '') {
        const start = 0x80;
        const amount = 0x80;
        const data = (await this.read(start, amount)).params;
        for (let i = 0; i < amount - 5; i += 1) {
          if (
            data[i] === 0x4A &&
            data[i + 1] === 0x45 &&
            data[i + 2] === 0x53 &&
            data[i + 3] === 0x43
          ) {
            info.settings.NAME = 'JESC';
            info.layout = null;

            break;
          }
        }

        /*
          * If still no name, it might be BLHeli_M - this can unfortunately
          * only be guessed based on the version - if it is 16.8 or higher,
          * then it _might_ be BLHeli_M with a high probability.
          *
          * This needs to be updated in case BLHeli_S ever gets an update.
          */
        if(info.settings.NAME === '') {
          if(
            info.settings.MAIN_REVISION === 16 &&
            (
              info.settings.SUB_REVISION === 8 ||
              info.settings.SUB_REVISION === 9
            )
          ) {
            info.settings.NAME = 'BLHeli_M';
            info.layout = null;
          }
        }
      }

      const layoutRevision = info.settings.LAYOUT_REVISION.toString();
      info.layoutRevision = layoutRevision;
      if(source) {
        info.defaultSettings = source.getDefaultSettings(layoutRevision);
      }

      if(!info.defaultSettings) {
        this.addLogMessage('layoutNotSupported', { revision: layoutRevision });
      }

      const layoutName = (info.settings.LAYOUT || '').trim();
      let make = null;

      // SiLabs EFM8 based
      if (info.isSiLabs) {
        /**
         * If we don't have a valid layout, something is wrong with the current
         * firmware. It means the ESC can still be flashed, but we can't say
         * for sure which firmware it is running
         */
        const layouts = source.getEscLayouts();
        const layout = layouts[layoutName];
        if(!layout) {
          source = null;

          info.layout = {};
        } else {
          make = layout.name;
        }

        if (source instanceof sources.BluejaySource) {
          info.displayName = source.buildDisplayName(info, make);
          info.firmwareName = source.getName();
        }

        /**
         * Check if firmware is mistagged
         *
         * This will only work for BLHeli_S, not JESC or BLHeli_M, if either of
         * those is detected we don't even attempt it.
         */
        if (
          source instanceof sources.BLHeliSSource &&
          info.settings.NAME !== 'JESC' &&
          info.settings.NAME !== 'BLHeli_M'
        ) {
          const splitMake =  make.split('-');
          const taggedTiming = splitMake[2];
          const mcuType = splitMake[1];

          /**
           * Some manufacturers mistag their firmware so that the actual
           * deadtime is higher than the reported one. Try to read the timing
           * from the currently flashed hex.
           *
           * Read bytes of data in 128 byte increments starting at address 0x250
           * - 16.7:  0x300 bytes are enough
           * - 16.71: 0x500 bytes are enough
           */
          const start = 0x250;
          const amount = 0x500;
          const data = new Uint8Array(amount);
          let pos = 0;
          for (let address = start; address < start + amount; address += 0x80) {
            const currentData = (await this.read(address, 0x80)).params;
            data.set(currentData, pos);
            pos += 0x80;
          }

          /* Scan the gathered data to find the actual deadtime - looking for
            * a section that looks like this in asm:
            *
            * MOV R1, A
            * CLR C
            * MOV A, R0
            * SUBB A, #data (#data being data[i + 4])
            *
            * This is the relevant section in BLHeli_S source code:
            * https://github.com/bitdump/BLHeli/blob/467834db443a887534c1f2c9fb0ff61fd6b40e3e/BLHeli_S%20SiLabs/BLHeli_S.asm#L1433
            */
          let timing = 0;
          for (var i = 0; i < amount - 5; i += 1) {
            if (
              data[i] === 0xf9 &&
              data[i + 1] === 0xc3 &&
              data[i + 2] === 0xe8 &&
              data[i + 3] === 0x94
            ) {
              timing = data[i + 4];

              // If an H or X type MCU is detected, half the timing.
              if(mcuType === 'H' || mcuType === 'X') {
                timing /= 2;
              }

              break;
            }
          }

          if(timing) {
            timing = String(timing);

            if(taggedTiming !== timing) {
              splitMake[2] = timing;
              const actualMake = splitMake.join('-');
              this.addLogMessage('timingMismatch', {
                tagged: make,
                actual: actualMake,
              });

              info.actualMake = actualMake;
            }
          }

          info.displayName = source.buildDisplayName(info, make);
          info.firmwareName = source.getName();
        }

        if (
          info.settings.NAME === 'JESC' ||
          info.settings.NAME === 'BLHeli_M'
        ) {
          const settings = info.settings;
          let revision = 'Unsupported/Unrecognized';
          if(
            settings.MAIN_REVISION !== undefined &&
            settings.SUB_REVISION !== undefined
          ) {
            revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;
          }

          info.displayName = `${make} - ${info.settings.NAME}, ${revision}`;
          info.firmwareName = info.settings.NAME;

          info.supported = false;
        }
      }

      // Arm
      if (info.isArm) {
        if (
          info.settings.NAME === 'BLHeli_32'
        ) {
          let revision = 'Unsupported/Unrecognized';
          make = 'Unknown';

          info.displayName = `${make} - ${info.settings.NAME}, ${revision}`;
          info.firmwareName = info.settings.NAME;

          info.supported = false;
        } else if (source instanceof sources.AM32Source) {
          info.bootloader = {};
          if(info.meta.input) {
            info.bootloader.input = info.meta.input;
            info.bootloader.valid = false;
          }

          /* Bootloader input pins are limited. If something different is set,
            * then the user probably has an old fw flashed.
            */
          for(let [key, value] of Object.entries(am32Eeprom.BOOT_LOADER_PINS)) {
            if(value === info.bootloader.input) {
              info.bootloader.valid = true;
              info.bootloader.pin = key;
              info.bootloader.version = info.settings.BOOT_LOADER_REVISION;
            }
          }

          info.settings.LAYOUT = info.settings.NAME;

          info.displayName = am32Source.buildDisplayName(info, info.meta.am32.fileName ? info.meta.am32.fileName.slice(0, info.meta.am32.fileName.lastIndexOf('_')) : info.settings.NAME);
          info.firmwareName = am32Source.getName();
        }
      }

      info.make = make;
    } catch (e) {
      console.debug(`ESC ${target + 1} read settings failed ${e.message}`, e);
      throw new Error(e);
    }

    try {
      info.individualSettings = getIndividualSettings(info);
    } catch(e) {
      console.debug('Could not get individual settings');
      throw new Error(e);
    }

    return info;
  }

  /**
   * Write settings to selected ESC if they changed
   *
   * @param {number} target
   * @param {object} esc
   * @param {Array} settings
   * @returns {Array}
   */
  async writeSettings(target, esc, settings) {
    const flash = await this.sendMessagePromised(COMMANDS.cmd_DeviceInitFlash, [target]);

    if (flash) {
      const newSettingsArray = Convert.objectToSettingsArray(settings, esc.layout, esc.layoutSize);
      if(newSettingsArray.length !== esc.settingsArray.length) {
        throw new BufferLengthMismatchError(newSettingsArray.length, esc.settingsArray.length);
      }

      if(compare(newSettingsArray, esc.settingsArray)) {
        this.addLogMessage('escSettingsNoChange', { index: target + 1 });
      } else {
        const mcu = new MCU(esc.meta.interfaceMode, esc.meta.signature);
        const eepromOffset = mcu.getEepromOffset();
        const pageSize = mcu.getPageSize();

        let readbackSettings = null;

        if(esc.isSiLabs) {
          const lockbyteAddress = mcu.getLockByteAddress();

          let pageMultiplier = 1;
          if(pageSize !== 512) {
            pageMultiplier = 4;
          }

          const mcuName = esc.settings.MCU;
          if (mcuName && mcuName.startsWith('#BLHELI$EFM8')) {
            const codeLockByte = (await this.read(lockbyteAddress, 1)).params[0];
            if (codeLockByte !== 0xFF) {
              this.addLogMessage('escLocked', {
                index: target + 1,
                codeLockByte,
              });
            }
          }

          await this.erasePage(eepromOffset / pageSize * pageMultiplier);
          await this.write(eepromOffset, newSettingsArray);
          readbackSettings = (await this.read(eepromOffset, esc.layoutSize)).params;
        } else if (esc.isArm) {
          await this.write(eepromOffset, newSettingsArray);
          readbackSettings = (await this.read(eepromOffset, esc.layoutSize)).params;
        } else {
          // write only changed bytes for Atmel
          for (var pos = 0; pos < newSettingsArray.byteLength; pos += 1) {
            var offset = pos;

            // find the longest span of modified bytes
            while (newSettingsArray[pos] !== esc.settingsArray[pos]) {
              pos += 1;
            }

            // byte unchanged, continue
            if (offset === pos) {
              continue;
            }

            // write span
            await this.writeEEprom(offset, newSettingsArray.subarray(offset, pos));
            readbackSettings = (await this.readEEprom(0, esc.layoutSize)).params;
          }
        }

        if(!compare(newSettingsArray, readbackSettings)) {
          throw new SettingsVerificationError(newSettingsArray, readbackSettings);
        }

        this.addLogMessage('escUpdateSuccess', { index: target + 1 });
      }

      return newSettingsArray;
    }

    throw new EscInitError();
  }

  /**
   * Read firmware from a selected ESC
   *
   * @param {number} target
   * @param {object} esc
   * @param {function} cbProgress
   * @returns {Uint8Array}
   */
  async readFirmware(target, esc, cbProgress) {
    const {
      interfaceMode, signature,
    } = esc.meta;

    this.progressCallback = cbProgress;

    const mcu = new MCU(interfaceMode, signature);
    let flashSize = mcu.getFlashSize();
    const firmwareStart = mcu.getFirmwareStart();
    const chunkSize = 0x80;
    const name = mcu.getName();

    /**
     * This cutoff is needed for dumping the firmware on BLHeli_S based
     * firmware since the bootloader is not (yet) able to read above
     * this address space.
     */
    const hardCutoff = 0x3800;
    if(name.startsWith("EFM8BB") && flashSize > hardCutoff) {
      flashSize = hardCutoff;
    }

    this.totalBytes = flashSize - firmwareStart;
    this.bytesWritten = 0;

    const data = new Uint8Array(this.totalBytes);
    let pos = 0;

    await this.initFlash(target);
    for (let address = firmwareStart; address < flashSize; address += chunkSize) {
      const currentData = (await this.read(address, chunkSize)).params;
      data.set(currentData, pos);
      pos += chunkSize;

      this.bytesWritten += chunkSize;
      this.progressCallback((this.bytesWritten / this.totalBytes) * 100);
    }

    return data;
  }

  /**
   * Write hex to MCU
   *
   * @param {number} target
   * @param {object} esc
   * @param {object} hex
   * @param {boolean} force
   * @param {boolean} migrate
   * @param {function} cbProgress
   * @returns
   */
  async writeHex(target, esc, hex, force, migrate, cbProgress) {
    const {
      interfaceMode, signature,
    } = esc.meta;

    this.progressCallback = cbProgress;

    const mcu = new MCU(interfaceMode, signature);
    const flashSize = mcu.getFlashSize();
    const flashOffset = mcu.getFlashOffset();
    const firmwareStart = mcu.getFirmwareStart();

    const migrateSettings = async(oldEsc, newEsc) => {
      /**
       * Migrate settings from the previous firmware if possible.
       */
      const newSettings = { ...newEsc.settings };
      const oldSettings = esc.settings;

      let settingsDescriptions = null;
      let individualSettingsDescriptions = null;
      switch(newEsc.layout) {
        case blheliEeprom.LAYOUT: {
          console.debug('BLHELI layout found');
          settingsDescriptions = blheliSettingsDescriptions.COMMON;
          individualSettingsDescriptions = blheliSettingsDescriptions.INDIVIDUAL;
        } break;

        case bluejayEeprom.LAYOUT: {
          console.debug('Bluejay layout found');
          settingsDescriptions = bluejaySettingsDescriptions.COMMON;
          individualSettingsDescriptions = bluejaySettingsDescriptions.INDIVIDUAL;
        } break;

        case am32Eeprom.LAYOUT: {
          console.debug('AM32 layout found');
          settingsDescriptions = am32SettingsDescriptions.COMMON;
          individualSettingsDescriptions = am32SettingsDescriptions.INDIVIDUAL;
        } break;

        default: {
          console.log('Unknown layout', newEsc.layout);
        }
      }

      /**
       * Try migrating settings if possible - this ensures that the motor
       * direction is saved between flashes.
       */
      const saveMigratins = ['MOTOR_DIRECTION', 'BEEP_STRENGTH', 'BEACON', 'TEMPERATURE_PROTECTION'];
      if(settingsDescriptions && individualSettingsDescriptions) {
        if(newSettings.MODE === oldSettings.MODE) {
          for (var prop in newSettings) {
            if (Object.prototype.hasOwnProperty.call(newSettings, prop) &&
                Object.prototype.hasOwnProperty.call(oldSettings, prop)
            ) {
              if(canMigrate(prop, oldSettings, newSettings, settingsDescriptions, individualSettingsDescriptions)) {
                // With a proper migration path
                newSettings[prop] = oldSettings[prop];

                console.debug(`Migrated setting ${prop}`);
              } else {
                if (saveMigratins.includes(prop)) {
                  // Settings that are save to migrate because they are the
                  // same on all firmwares.
                  newSettings[prop] = oldSettings[prop];

                  console.debug(`Migrated setting ${prop}`);
                }
              }
            }
          }
        }
      } else {
        console.debug('Can not migrate settings');
      }

      await this.writeSettings(target, newEsc, newSettings);
      newEsc.settings = newSettings;
      newEsc.individualSettings = getIndividualSettings(newEsc);

      return newEsc;
    };

    const flashSiLabs = async(flash, mcu) => {
      /**
       * The size of the Flash is larger(full flash size) than the pages we write.
       * This is why we need to calculate the total Bytes by page size
       * and actual pages we write, which in case of BB1 and BB2 is 14 and 7 on
       * the BB51.
       *
       * We then double that since we are also tracking the bytes read back
       * and update the progress bar accordingly.
       */
      const eepromOffset = mcu.getEepromOffset();
      const pageSize = mcu.getPageSize();
      const bootloaderAddress = mcu.getBootloaderAddress();
      let pageCount = 14;

      // Bigger pages on BB51
      if(pageSize === 2048) {
        pageCount = 7;
      }

      this.totalBytes = pageSize * pageCount * 2;
      this.bytesWritten = 0;

      const message = await this.read(eepromOffset, blheliSource.getLayoutSize());

      // checkESCAndMCU
      const escSettingArrayTmp = message.params;
      const target_layout = escSettingArrayTmp.subarray(
        blheliEeprom.LAYOUT.LAYOUT.offset,
        blheliEeprom.LAYOUT.LAYOUT.offset + blheliEeprom.LAYOUT.LAYOUT.size);

      const settings_image = flash.subarray(eepromOffset);
      const fw_layout = settings_image.subarray(
        blheliEeprom.LAYOUT.LAYOUT.offset,
        blheliEeprom.LAYOUT.LAYOUT.offset + blheliEeprom.LAYOUT.LAYOUT.size);

      if (!compare(target_layout, fw_layout)) {
        var target_layout_str = Convert.bufferToAscii(target_layout).trim();
        if (target_layout_str.length === 0) {
          target_layout_str = 'EMPTY';
        }

        if(!force) {
          this.addLogMessage('escSettingsLayoutMismatch');
          return esc;
        }
      }

      const target_mcu = escSettingArrayTmp.subarray(
        blheliEeprom.LAYOUT.MCU.offset,
        blheliEeprom.LAYOUT.MCU.offset + blheliEeprom.LAYOUT.MCU.size);
      const fw_mcu = settings_image.subarray(
        blheliEeprom.LAYOUT.MCU.offset,
        blheliEeprom.LAYOUT.MCU.offset + blheliEeprom.LAYOUT.MCU.size);
      if (!compare(target_mcu, fw_mcu)) {
        var target_mcu_str = Convert.bufferToAscii(target_mcu).trim();
        if (target_mcu_str.length === 0) {
          target_mcu_str = 'EMPTY';
        }

        if(!force) {
          this.addLogMessage('escSettingsMcuMismatch');
          return esc;
        }
      }

      if(pageSize === 512) {
        // Erase 0x0D and only write **FLASH*FAILED** as ESC NAME.
        // This will be overwritten in case of sussessfull flash.
        console.debug("### Step 1: Erasing EEPROM and writing safeguards");
        await this.erasePage(0x0D);
        await this.writeEEpromSafeguard(escSettingArrayTmp, eepromOffset);

        // write `LJMP bootloader` to avoid bricking
        console.debug("### Step 2: Writing bootloader failsafe (brick protection)");
        await this.writeBootoaderFailsafe(pageSize, bootloaderAddress);

        // Skip first two pages with bootloader failsafe
        // 0x02 - 0x0D: erase, write, verify
        console.debug("### Step 3: Erase, write and verify Pages 0x02-0x0D");
        await this.erasePages(0x02, 0x0D);
        await this.writePages(0x02, 0x0D, pageSize, flash);
        await this.verifyPages(0x02, 0x0D, pageSize, flash);

        // Override first two pages that had bootloader failsafe
        // 0x00 - 0x02: erase, write, verify
        console.debug("### Step 4: Erase, write and verify Pages 0x00-0x02");
        await this.erasePages(0x00, 0x02);
        await this.writePages(0x00, 0x02, pageSize, flash);
        await this.verifyPages(0x00, 0x02, pageSize, flash);

        // 14th page: erase, write, verify (EEprom)
        console.debug("### Step 5: Write EEPROM section");
        await this.erasePage(0x0D);
        await this.writePage(0x0D, pageSize, flash);
        await this.verifyPage(0x0D, pageSize, flash);
      }

      if(pageSize === 2048) {
        /**
         * Mutliplier is needed to properly erase pages since the bootloader
         * does not account for the bigger pages of the BB51.
         */
        const multiplier = 4;

        // Erase 0x06 and only write **FLASH*FAILED** as ESC NAME.
        // This will be overwritten in case of sussessfull flash.
        console.debug("### Step 1: Erasing EEPROM and writing safeguards");
        await this.erasePage(0x06 * multiplier);
        await this.writeEEpromSafeguard(escSettingArrayTmp, eepromOffset);

        // write `LJMP bootloader` to avoid bricking
        console.debug("### Step 2: Writing bootloader failsafe (brick protection)");
        await this.writeBootoaderFailsafe(pageSize, bootloaderAddress, multiplier);

        // Skipp first two pages with bootloader failsafe
        // 0x02 - 0x06: erase, write, verify
        console.debug("### Step 3: Erase, write and verify Pages 0x02-0x0D");
        await this.erasePages(0x02 * multiplier, 0x06 * multiplier);
        await this.writePages(0x02, 0x06, pageSize, flash);
        await this.verifyPages(0x02, 0x06, pageSize, flash);

        // Override first two pages that had bootloader failsafe
        // 0x00 - 0x02: erase, write, verify
        console.debug("### Step 4: Erase, write and verify Pages 0x00-0x02");
        await this.erasePages(0x00, 0x02 * multiplier);
        await this.writePages(0x00, 0x02, pageSize, flash);
        await this.verifyPages(0x00, 0x02, pageSize, flash);

        // 6th page: erase, write, verify (EEprom)
        console.debug("### Step 5: Write EEPROM section");
        await this.erasePage(0x06 * multiplier);
        await this.writePage(0x06, pageSize, flash);
        await this.verifyPage(0x06, pageSize, flash);
      }
    };

    const flashArm = async(flash, mcu) => {
      const eepromOffset = mcu.getEepromOffset();
      const pageSize = mcu.getPageSize();
      const firmwareStart = mcu.getFirmwareStart();

      this.totalBytes = (flash.byteLength - firmwareStart) * 2;
      this.bytesWritten = 0;

      const message = await this.read(eepromOffset, am32Eeprom.LAYOUT_SIZE);
      const originalSettings = message.params;

      const eepromInfo = new Uint8Array(17).fill(0x00);
      eepromInfo.set([originalSettings[1], originalSettings[2]], 1);
      eepromInfo.set(Convert.asciiToBuffer('FLASH FAIL  '), 5);

      await this.write(eepromOffset, eepromInfo);

      await this.writePages(0x04, 0x40, pageSize, flash);
      await this.verifyPages(0x04, 0x40, pageSize, flash);

      originalSettings[0] = 0x01;
      originalSettings.fill(0x00, 3, 5);
      originalSettings.set(Convert.asciiToBuffer('NOT READY   '), 5);

      await this.write(eepromOffset, originalSettings);
    };

    const flashTarget = async(target, flash) => {
      const startTimestamp = Date.now();

      const message = await this.initFlash(target);
      const interfaceMode = message.params[3];
      const signature = (message.params[1] << 8) | message.params[0];
      const mcu = new MCU(interfaceMode, signature);

      switch (interfaceMode) {
        case MODES.SiLBLB: {
          await flashSiLabs(flash, mcu);
        } break;

        case MODES.ARMBLB: {
          await flashArm(flash, mcu);

          // Reset after flashing to update name and settings
          await this.reset(target);
          await delay(am32Eeprom.RESET_DELAY);
        } break;

        default: throw new UnknownInterfaceError(interfaceMode);
      }

      const elapsedSec = (Date.now() - startTimestamp) / 1000;
      const rounded = Math.round(elapsedSec * 10) / 10;
      this.addLogMessage('escFlashedInTime', {
        index: target + 1,
        seconds: rounded,
      });

      let newEsc = await this.getInfo(target);

      const source = getSource(esc.firmwareName);
      const sameFirmware = (
        esc.individualSettings &&
        newEsc.individualSettings &&
        source &&
        source.canMigrateTo(newEsc.individualSettings.NAME)
      );

      /**
       * Only migrate settings if new and old Firmware are the same or if user
       * forces override.
       */
      if(migrate || sameFirmware) {
        newEsc = migrateSettings(esc, newEsc);
      }

      return newEsc;
    };

    if(esc.isArm) {
      try {
        const parsed = Flash.parseHex(hex);
        const endAddress = parsed.data[parsed.data.length - 1].address + parsed.data[parsed.data.length - 1].bytes;
        const flash = Flash.fillImage(parsed, endAddress - flashOffset, flashOffset);

        if (!force) {
          /**
           * Compare the first 4 bytes of the vector table of the firmware to be flashed
           * against the currently flashed firmware.
           *
           * The vector table will not change between firmware versions, but will be
           * different for different MCUs
           */
          //call initFlash before call to read, or the read will read from the last (the 4th) esc
          await this.initFlash(target);
          const newVectorStartBytes = flash.subarray(firmwareStart, firmwareStart + 4);
          const currentVectorStartBytes = (await this.read(firmwareStart, 4, 10)).params;

          if (!compare(newVectorStartBytes, currentVectorStartBytes)) {
            throw new InvalidHexFileError('Invalid hex file');
          }
        }

        if (firmwareStart) {
          flash.firmwareStart = firmwareStart;
        }

        return flashTarget(target, flash);
      } catch(e) {
        console.debug('Failed flashing Arm:', e);
        return null;
      }
    }

    if(esc.isSiLabs) {
      try {
        const parsed = Flash.parseHex(hex);
        const flash = Flash.fillImage(parsed, flashSize, flashOffset);

        // Check pseudo-eeprom page for BLHELI signature
        const eepromOffset = mcu.getEepromOffset();
        const mcuType = Convert.bufferToAscii(
          flash.subarray(eepromOffset)
            .subarray(blheliEeprom.LAYOUT.MCU.offset)
            .subarray(0, blheliEeprom.LAYOUT.MCU.size));

        if(!isValidFlash(mcuType, flash)) {
          throw new InvalidHexFileError('Invalid hex file');
        }

        if (firmwareStart) {
          flash.firmwareStart = firmwareStart;
        }

        return flashTarget(target, flash);
      } catch(e) {
        console.debug('Failed flashing SiLabs:', e);
        return null;
      }
    }

    if(!esc.isArm || !esc.isSiLabs) {
      throw new UnknownInterfaceError(interfaceMode);
    }
  }

  /**
   * Write bootloader failsafe
   *
   * The booloader failsafe helps in recovering from a failed flash, attempting
   * to jump from address 0x00 into the bootloader.
   *
   * pageMultiplier is a workaround for BB51 MCU since the BLHeli_S bootloader
   * does not account for bigger page sizes.
   *
   * @param {number} pageSize
   * @param {number} bootloaderAddress
   * @param {number} pageMultiplier
   */
  async writeBootoaderFailsafe(pageSize, bootloaderAddress, pageMultiplier = 1) {
    const bootloaderByteHi = (bootloaderAddress >> 8) & 0xFF;
    const bootloaderByteLo = bootloaderAddress & 0xFF;

    const ljmpAsm = 0x02;
    const ljmpBootloader = new Uint8Array([ljmpAsm, bootloaderByteHi, bootloaderByteLo]);

    // Erase page 1 and write the jump instruction to the beginning of page 1
    await this.erasePage(0x01 * pageMultiplier);
    await this.write(pageSize, ljmpBootloader);

    const verifyBootloader = async (resolve, reject) => {
      const response = await this.read(pageSize, ljmpBootloader.byteLength);

      if(!compare(ljmpBootloader, response.params)) {
        reject(new Error('failed to verify `LJMP bootloader` write'));
      }

      resolve();
    };

    await retry(verifyBootloader, 10);

    // Erase page 0
    await this.erasePage(0x00 * pageMultiplier);
    const beginAddress = 0x00;
    const endAddress = pageSize;
    const step = 0x80;

    for (let address = beginAddress; address < endAddress; address += step) {
      const verifyErased = async(resolve, reject) => {
        const message = await this.read(address, step);
        const erased = message.params.every((x) => x === 0xFF);

        if(!erased) {
          reject(new Error('failed to verify erasure of the first page'));
        }

        resolve();
      };

      await retry(verifyErased, 10);
    }
  }

  /**
   * Write the EEprom safeguard
   *
   * This writes in the area that will be read when infos are being fetched.
   * This info is then used to indicate that the flash failed. When in this
   * state, flashing is still possible, although MCU layout ignore box has to
   * be checked.
   *
   * @param {Uint8Array} settings
   * @param {number} eepromOffset
   */
  async writeEEpromSafeguard(settings, eepromOffset) {
    settings.set(Convert.asciiToBuffer('**FLASH*FAILED**'), blheliEeprom.LAYOUT.NAME.offset);
    const response = await this.write(eepromOffset, settings);

    const verifySafeguard = async (resolve, reject) => {
      const message = await this.read(response.address, blheliSource.getLayoutSize());

      if (!compare(settings, message.params)) {
        reject(new Error('failed to verify write **FLASH*FAILED**'));
      }

      resolve();
    };

    await retry(verifySafeguard, 10);
  }

  /**
   * Verify multiple pages up to (but not including) end page
   *
   * @param {number} begin
   * @param {number} end
   * @param {number} pageSize
   * @param {Uint8Array} data
   */
  async verifyPages(begin, end, pageSize, data) {
    const beginAddress = begin * pageSize;
    const end_address = end * pageSize;
    const step = 0x80;

    for (let address = beginAddress; address < end_address && address < data.length; address += step) {
      const verifyPages = async (resolve, reject) => {
        const message = await this.read(address, Math.min(step, data.length - address));
        const reference = data.subarray(message.address, message.address + message.params.byteLength);

        if (!compare(message.params,reference)) {
          console.debug('Verification failed - retry');
          reject(new Error(`failed to verify write at address 0x${message.address.toString(0x10)}`));
        } else {
          this.bytesWritten += step;
          this.progressCallback((this.bytesWritten / this.totalBytes) * 100);

          resolve();
        }
      };

      // Verification might not always succeed the first time
      await retry(verifyPages, 10);
    }
  }

  /**
   * Verify a single page against given data
   *
   * @param {number} page
   * @param {number} pageSize
   * @param {Uint8Array} data
   */
  verifyPage(page, pageSize, data) {
    return this.verifyPages(page, page + 1, pageSize, data);
  }

  /**
   * Write data to multiple pages up to (but not including) end page
   *
   * @param {number} begin
   * @param {number} end
   * @param {number} pageSize
   * @param {Uint8Array} data
   */
  async writePages(begin, end, pageSize, data) {
    const beginAddress = begin * pageSize;
    const endAddress = end * pageSize;
    const step = 0x100;

    for (let address = beginAddress; address < endAddress && address < data.length; address += step) {
      await this.write(
        address,
        data.subarray(address, Math.min(address + step, data.length)));

      this.bytesWritten += step;
      this.progressCallback((this.bytesWritten / this.totalBytes) * 100);
    }
  }

  /**
   * Write a page with a given size
   *
   * @param {number} page
   * @param {number} pageSize
   * @param {Uint8Array} data
   */
  writePage(page, pageSize, data) {
    return this.writePages(page, page + 1, pageSize, data);
  }

  /**
   * Erase multiple pages up till (but not including) stop page
   *
   * @param {number} startPage
   * @param {number} stopPage
   */
  async erasePages(startPage, stopPage) {
    for(let page = startPage; page < stopPage; page += 1) {
      await this.erasePage(page);
    }
  }

  /**
   * The following functions send commands directly to the four way interface
   * and thus the bootloader. All other functions rely on this functions or
   * wrap them in some way.
   *
   * All of this functions will return a Promise that resolves to a Response
   * object.
   */

  /**
   * Clear TestAlive interval and send Exit command
   *
   * @returns {Promise<Response>}
   */
  exit() {
    clearInterval(this.interval);

    return this.sendMessagePromised(COMMANDS.cmd_InterfaceExit);
  }

  /**
   * Send TestAlive command
   *
   * @returns {Promise<Response>}
   */
  testAlive() {
    return this.sendMessagePromised(COMMANDS.cmd_InterfaceTestAlive);
  }

  /**
   * Reset a target
   *
   * Depending on the exact firmware different things might happen during
   * the reset process.
   *
   * @param {number} target
   * @returns {Promise<Response>}
   */
  reset(target) {
    return this.sendMessagePromised(COMMANDS.cmd_DeviceReset, [target], 0);
  }

  /**
   * Initialize the flash
   *
   * @param {number} target
   * @param {number} retries
   * @returns {Promise<Response>}
   */
  async initFlash(target, retries = 10) {
    return this.sendMessagePromised(COMMANDS.cmd_DeviceInitFlash, [target], 0, retries);
  }

  /**
   * Erase a single page
   *
   * @param {number} page
   * @returns {Promise<Response>}
   */
  erasePage(page) {
    return this.sendMessagePromised(COMMANDS.cmd_DevicePageErase, [page]);
  }

  /**
   * Read a specified amount of bytes from a starting address
   *
   * @param {number} address
   * @param {number} bytes
   * @param {number} retries
   * @returns {Promise<Response>}
   */
  read(address, bytes, retries = 10) {
    return this.sendMessagePromised(
      COMMANDS.cmd_DeviceRead,
      [bytes === 256 ? 0 : bytes],
      address,
      retries
    );
  }

  /**
   * Read a number of bytes from a given address
   *
   * @param {number} address
   * @param {number} bytes
   * @returns {Promise<Response>}
   */
  readEEprom(address, bytes) {
    return this.sendMessagePromised(
      COMMANDS.cmd_DeviceReadEEprom,
      [bytes === 256 ? 0 : bytes],
      address
    );
  }

  /**
   * Write data to address
   *
   * @param {number} address
   * @param {Array<number>} data
   * @returns {Promise<Response>}
   */
  write(address, data) {
    return this.sendMessagePromised(COMMANDS.cmd_DeviceWrite, data, address);
  }

  /**
   * Write data to EEprom address
   *
   * @param {number} address
   * @param {Array<number>} data
   * @returns {Promise<Response>}
   */
  writeEEprom(address, data) {
    return this.sendMessagePromised(COMMANDS.cmd_DeviceWriteEEprom, data, address);
  }
}

export default FourWay;
