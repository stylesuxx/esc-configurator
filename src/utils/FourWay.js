import Convert from './helpers/Convert';
import Flash from './helpers/Flash';
import {
  BufferLengthMismatchError,
  EscInitError,
  InvalidHexFileError,
  SettingsVerificationError,
  TooManyParametersError,
  UnknownInterfaceError,
  UnknownPlatformError,
} from './Errors';

import {
  am32Source,
  blheliSource,
  bluejaySource,
} from '../sources';

import {
  canMigrate,
  getIndividualSettings,
} from './helpers/Settings';

import {
  delay,
  retry,
  compare,
  isValidFlash,
} from './helpers/General';

import MCU from './helpers/MCU';

import {
  ACK,
  ATMEL_MODES,
  COMMANDS,
  MODES,
  SILABS_MODES,
} from './FourWayConstants';
import { NotEnoughDataError } from './helpers/QueueProcessor';

const blheliEeprom = blheliSource.getEeprom();
const bluejayEeprom = bluejaySource.getEeprom();
const am32Eeprom = am32Source.getEeprom();

class FourWay {
  constructor(serial) {
    this.serial = serial;

    this.lastCommandTimestamp = 0;

    this.totalBytes = 0;
    this.bytesWritten = 0;
    this.progressCallback = null;

    this.logCallback = null;
    this.packetErrorsCallback = null;

    this.parseMessage = this.parseMessage.bind(this);

    this.extendedDebug = false;

    this.blheliEscs = blheliSource.getLocalEscs();
    this.bluejayEscs = bluejaySource.getLocalEscs();

  }

  setExtendedDebug(extendedDebug) {
    this.extendedDebug = extendedDebug;
  }

  setLogCallback(logCallback) {
    this.logCallback = logCallback;
  }

  addLogMessage(message, params) {
    if(this.logCallback) {
      this.logCallback(message, params);
    }
  }

  setPacketErrorsCallback(packetErrorsCallback) {
    this.packetErrorsCallback = packetErrorsCallback;
  }

  increasePacketErrors(count) {
    if(this.packetErrorsCallback) {
      this.packetErrorsCallback(count);
    }
  }

  commandToString(command) {
    for (const field in COMMANDS) {
      if (COMMANDS[field] === command) {
        return field;
      }
    }

    return null;
  }

  ackToString(ack) {
    for (const field in ACK) {
      if (ACK[field] === ack) {
        return field;
      }
    }

    return null;
  }

  crc16XmodemUpdate(crc, byte) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i += 1) {
      if (crc & 0x8000) {
        crc = crc << 1 ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }

    return crc & 0xffff;
  }

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
    bufferView[2] = address >> 8 & 0xff;
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

    bufferView[5 + params.length] = checksum >> 8 & 0xff;
    bufferView[6 + params.length] = checksum & 0xff;

    return bufferOut;
  }

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
      address: view[2] << 8 | view[3],
      ack: view[5 + paramCount],
      checksum: view[6 + paramCount] << 8 | view[7 + paramCount],
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

  sendMessagePromised(command, params = [0], address = 0, retries = 10) {
    const self = this;

    const process = async (resolve, reject) => {
      this.lastCommandTimestamp = Date.now();
      const message = self.createMessage(command, params, address);

      // Debug print all messages except the keep alive messages
      if (this.extendedDebug && command !== COMMANDS.cmd_InterfaceTestAlive) {
        const paramsHex = Array.from(params).map((param) => `0x${param.toString(0x10).toUpperCase()}`);
        console.debug(`TX: ${this.commandToString(command)}${address ? ' @ 0x' + address.toString(0x10).toUpperCase() : ''} - ${paramsHex}`);
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
            if (this.extendedDebug && command !== COMMANDS.cmd_InterfaceTestAlive) {
              const paramsHex = Array.from(msg.params).map((param) => `0x${param.toString(0x10).toUpperCase()}`);
              console.debug(`RX: ${this.commandToString(msg.command)}${msg.address ? ' @ 0x' + address.toString(0x10).toUpperCase() : ''} - ${paramsHex}`);
            }
            return resolve(msg);
          }
        } catch(e) {
          console.debug(`Command ${this.commandToString(command)} failed: ${e.message}`);
          return reject(e);
        }

        return reject(new Error('Message not OK'));
      };

      try {
        const result = await retry(processMessage, retries, 250);
        return resolve(result);
      } catch(e) {
        console.debug(`Failed processing command ${this.commandToString(command)} after ${retries} retries.`);
        reject(e);
      }
    };

    return new Promise((resolve, reject) => process(resolve, reject));
  }

  async getInfo(target) {
    const flash = await this.initFlash(target, 0);

    if (flash) {
      flash.meta = {};

      try {
        const interfaceMode = flash.params[3];
        flash.meta.input = flash.params[2];
        flash.meta.signature = flash.params[1] << 8 | flash.params[0];
        flash.meta.interfaceMode = interfaceMode;
        flash.meta.available = true;

        const isAtmel = ATMEL_MODES.includes(interfaceMode);
        const isSiLabs = SILABS_MODES.includes(interfaceMode);
        const isArm = interfaceMode === MODES.ARMBLB;
        let settingsArray = null;
        let layout = blheliEeprom.LAYOUT;
        let layoutSize = blheliEeprom.LAYOUT_SIZE;
        let defaultSettings = blheliEeprom.DEFAULTS;
        let validFirmwareNames = blheliEeprom.NAMES;
        let displayName = 'UNKNOWN';

        if (isSiLabs) {
          layoutSize = blheliEeprom.LAYOUT_SIZE;
          settingsArray = (await this.read(blheliEeprom.SILABS.EEPROM_OFFSET, layoutSize)).params;
        } else if (isArm) {
          validFirmwareNames = am32Eeprom.NAMES;
          layoutSize = am32Eeprom.LAYOUT_SIZE;
          layout = am32Eeprom.LAYOUT;
          defaultSettings = am32Eeprom.DEFAULTS;
          settingsArray = (await this.read(am32Eeprom.EEPROM_OFFSET, layoutSize)).params;
        } else {
          throw new UnknownPlatformError('Neither SiLabs nor Arm');
        }

        flash.isSiLabs = isSiLabs;
        flash.isArm = isArm;
        flash.isAtmel = isAtmel;

        flash.settingsArray = settingsArray;
        flash.settings = Convert.arrayToSettingsObject(settingsArray, layout);

        /**
         * Baased on the name we can decide if the initially guessed layout
         * was correct, if not, we need to build a new settings object.
         */
        let name = flash.settings.NAME;
        let newLayout = null;
        if(bluejayEeprom.NAMES.includes(name)) {
          validFirmwareNames = bluejayEeprom.NAMES;
          newLayout = bluejayEeprom.LAYOUT;
          layoutSize = bluejayEeprom.LAYOUT_SIZE;
          defaultSettings = bluejayEeprom.DEFAULTS;
          settingsArray = (await this.read(bluejayEeprom.EEPROM_OFFSET, layoutSize)).params;
        }

        // Try to guess firmware type if it was not properly set in the EEPROM
        if(name === '') {
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
              flash.settings.NAME = 'JESC';
              layout = null;

              break;
            }
          }
        }

        if(newLayout) {
          layout = newLayout;
          flash.settingsArray = settingsArray;
          flash.settings = Convert.arrayToSettingsObject(settingsArray, layout);
        }

        const layoutRevision = flash.settings.LAYOUT_REVISION.toString();

        let individualSettingsDescriptions = null;
        let settingsDescriptions = null;
        switch(layout) {
          case blheliEeprom.LAYOUT: {
            settingsDescriptions = blheliEeprom.SETTINGS_DESCRIPTIONS;
            individualSettingsDescriptions = blheliEeprom.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
          } break;

          case bluejayEeprom.LAYOUT: {
            settingsDescriptions = bluejayEeprom.SETTINGS_DESCRIPTIONS;
            individualSettingsDescriptions = bluejayEeprom.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
          } break;

          case am32Eeprom.LAYOUT: {
            settingsDescriptions = am32Eeprom.SETTINGS_DESCRIPTIONS;
            individualSettingsDescriptions = am32Eeprom.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
          } break;

          default: {
            settingsDescriptions = {};
            individualSettingsDescriptions = {};
          }
        }

        flash.settingsDescriptions = settingsDescriptions[layoutRevision];
        flash.individualSettingsDescriptions = individualSettingsDescriptions[layoutRevision];

        if (interfaceMode !== MODES.ARMBLB) {
          const mode = Convert.modeToString(flash.settings.MODE);
          try {
            const descriptions = settingsDescriptions[layoutRevision][mode];
            flash.settingsDescriptions = descriptions;
          } catch(e) {
            this.addLogMessage('layoutNotSupported', { revision: layoutRevision });
          }
        }

        const layoutName = (flash.settings.LAYOUT || '').trim();
        let make = null;
        if (isSiLabs) {
          const blheliLayouts = this.blheliEscs.layouts[blheliEeprom.TYPES.SILABS];
          const blheliSLayouts = this.blheliEscs.layouts[blheliEeprom.TYPES.BLHELI_S_SILABS];
          const bluejayLayouts = this.bluejayEscs.layouts[bluejayEeprom.TYPES.EFM8];

          if (flash.settings.NAME === 'JESC') {
            make = blheliSLayouts[layoutName].name;
            const settings = flash.settings;
            let revision = 'Unsupported/Unrecognized';
            if(settings.MAIN_REVISION !== undefined && settings.SUB_REVISION !== undefined) {
              revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;
            }

            displayName = `${make} - JESC, ${revision}`;
          } else if (bluejayEeprom.NAMES.includes(name) && layoutName in bluejayLayouts) {
            make = bluejayLayouts[layoutName].name;
            displayName = bluejaySource.buildDisplayName(flash, make);
          } else if (layoutName in blheliLayouts) {
            make = blheliLayouts[layoutName].name;
          } else if (layoutName in blheliSLayouts) {
            make = blheliSLayouts[layoutName].name;
            const splitMake =  make.split('-');
            const taggedTiming = splitMake[2];
            const mcuType = splitMake[1];

            /* Some manufacturers mistag their firmware so that the actual
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

                // If an H type MCU is detected, half the timing.
                if(mcuType === 'H') {
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

                flash.actualMake = actualMake;
              }
            }

            displayName = blheliSource.buildDisplayName(flash, make);
          }
        } else if (isArm) {
          /* Read version information direct from EEPROM so we can later
           * compare to the settings object. This allows us to verify, that
           * everything went well after flashing.
           */
          const [mainRevision, subRevision] = (await this.read(am32Eeprom.VERSION_OFFSET, am32Eeprom.VERSION_SIZE)).params;

          if(
            flash.settings.MAIN_REVISION !== mainRevision ||
            flash.settings.SUB_REVISION !== subRevision
          ) {
            const flashFirmware = `${flash.settings.MAIN_REVISION}.${flash.settings.SUB_REVISION}`;
            const eepromFirmware = `${mainRevision}.${subRevision}`;
            this.addLogMessage('firmwareMismatch', {
              flash: flashFirmware,
              eeprom: eepromFirmware,
            });
          }

          flash.bootloader = {};
          if(flash.meta.input) {
            flash.bootloader.input = flash.meta.input;
            flash.bootloader.valid = false;
          }

          /* Bootloader input pins are limited. If something different is set,
           * then the user probably has an old fw flashed.
           */
          for(let [key, value] of Object.entries(am32Eeprom.BOOT_LOADER_PINS)) {
            if(value === flash.bootloader.input) {
              flash.bootloader.valid = true;
              flash.bootloader.pin = key;
              flash.bootloader.version = flash.settings.BOOT_LOADER_REVISION;
            }
          }

          flash.settings.MAIN_REVISION = mainRevision;
          flash.settings.SUB_REVISION = subRevision;
          flash.settings.LAYOUT = flash.settings.NAME;

          displayName = am32Source.buildDisplayName(flash, flash.settings.NAME);
        } else {
          const blheliAtmelLayouts = this.blheliEscs.layouts[blheliEeprom.TYPES.ATMEL];
          if (layoutName in blheliAtmelLayouts) {
            make = blheliAtmelLayouts[layoutName].name;
          }
        }

        flash.canMigrateTo = validFirmwareNames;
        flash.defaultSettings = defaultSettings[layoutRevision];
        flash.displayName = displayName;
        flash.layoutSize = layoutSize;
        flash.layout = layout;
        flash.make = make;
      } catch (e) {
        console.debug(`ESC ${target + 1} read settings failed ${e.message}`, e);
        throw new Error(e);
      }

      try {
        flash.individualSettings = getIndividualSettings(flash);
      } catch(e) {
        console.debug('Could not get individual settings');
        throw new Error(e);
      }

      // Delete some things that we do not need to pass on to the client
      delete flash.ack;
      delete flash.params;
      delete flash.address;
      delete flash.command;
      delete flash.checksum;
    }

    return flash;
  }

  async initFlash(target, retries = 10) {
    return this.sendMessagePromised(COMMANDS.cmd_DeviceInitFlash, [target], 0, retries);
  }

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
        let readbackSettings = null;
        if(esc.isSiLabs) {
          const mcu = esc.settings.MCU;
          if (mcu && mcu.startsWith('#BLHELI$EFM8')) {
            const CODE_LOCK_BYTE_OFFSET = mcu.endsWith('B21#') ? 0xFBFF : 0x1FFF;
            const codeLockByte = (await this.read(CODE_LOCK_BYTE_OFFSET, 1)).params[0];
            if (codeLockByte !== 0xFF) {
              this.addLogMessage('escLocked', {
                index: target + 1,
                codeLockByte,
              });
            }
          }

          await this.pageErase(blheliEeprom.EEPROM_OFFSET / blheliEeprom.PAGE_SIZE);
          await this.write(blheliEeprom.EEPROM_OFFSET, newSettingsArray);
          readbackSettings = (await this.read(blheliEeprom.EEPROM_OFFSET, esc.layoutSize)).params;
        } else if (esc.isArm) {
          await this.write(am32Eeprom.EEPROM_OFFSET, newSettingsArray);
          readbackSettings = (await this.read(am32Eeprom.EEPROM_OFFSET, esc.layoutSize)).params;
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

  async readFirmware(target, esc, cbProgress) {
    const {
      interfaceMode, signature,
    } = esc.meta;

    this.progressCallback = cbProgress;

    const mcu = new MCU(interfaceMode, signature);
    const flashSize = mcu.getFlashSize();
    const firmwareStart = mcu.getFirmwareStart();

    this.totalBytes = flashSize - firmwareStart;
    this.bytesWritten = 0;

    const data = new Uint8Array(this.totalBytes);
    let pos = 0;

    await this.initFlash(target);
    for (let address = firmwareStart; address < flashSize; address += 0x80) {
      const currentData = (await this.read(address, 0x80)).params;
      data.set(currentData, pos);
      pos += 0x80;

      this.bytesWritten += 0x80;
      this.progressCallback((this.bytesWritten / this.totalBytes) * 100);
    }

    return data;
  }

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
      const newSettings = Object.assign({}, newEsc.settings);
      const oldSettings = esc.settings;

      let settingsDescriptions = null;
      let individualSettingsDescriptions = null;
      switch(newEsc.layout) {
        case blheliEeprom.LAYOUT: {
          console.debug('BLHELI layout found');
          settingsDescriptions = blheliEeprom.SETTINGS_DESCRIPTIONS;
          individualSettingsDescriptions = blheliEeprom.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
        } break;

        case bluejayEeprom.LAYOUT: {
          console.debug('Bluejay layout found');
          settingsDescriptions = bluejayEeprom.SETTINGS_DESCRIPTIONS;
          individualSettingsDescriptions = bluejayEeprom.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
        } break;

        case am32Eeprom.LAYOUT: {
          console.debug('AM32 layout found');
          settingsDescriptions = am32Eeprom.SETTINGS_DESCRIPTIONS;
          individualSettingsDescriptions = am32Eeprom.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
        } break;
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

    const flashSiLabs = async(flash) => {
      /**
       * The size of the Flash is larger than the pages we write.
       * that is why we need to calculate the total Bytes by page size
       * and actual pages we write, which in this case is 14.
       *
       * We then double that since we are also tracking the bytes read back
       * and update the progress bar accordingly.
       */
      this.totalBytes = blheliEeprom.PAGE_SIZE * 14 * 2;
      this.bytesWritten = 0;

      const message = await this.read(blheliEeprom.SILABS.EEPROM_OFFSET, blheliEeprom.LAYOUT_SIZE);

      // checkESCAndMCU
      const escSettingArrayTmp = message.params;
      const target_layout = escSettingArrayTmp.subarray(
        blheliEeprom.LAYOUT.LAYOUT.offset,
        blheliEeprom.LAYOUT.LAYOUT.offset + blheliEeprom.LAYOUT.LAYOUT.size);

      const settings_image = flash.subarray(blheliEeprom.EEPROM_OFFSET);
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

      // Erase 0x0D and only write **FLASH*FAILED** as ESC NAME.
      // This will be overwritten in case of sussessfull flash.
      await this.erasePage(0x0D);
      await this.writeEEpromSafeguard(escSettingArrayTmp);

      // write `LJMP bootloader` to avoid bricking
      await this.writeBootoaderFailsafe();

      // Skipp first two pages with bootloader failsafe
      // 0x02 - 0x0D: erase, write, verify
      await this.erasePages(0x02, 0x0D);
      await this.writePages(0x02, 0x0D, blheliEeprom.PAGE_SIZE, flash);
      await this.verifyPages(0x02, 0x0D, blheliEeprom.PAGE_SIZE, flash);

      // write & verify first page
      await this.writePage(0x00, blheliEeprom.PAGE_SIZE, flash);
      await this.verifyPage(0x00, blheliEeprom.PAGE_SIZE, flash);

      // Second page: erase, write, verify
      await this.erasePage(0x01);
      await this.writePage(0x01, blheliEeprom.PAGE_SIZE, flash);
      await this.verifyPage(0x01, blheliEeprom.PAGE_SIZE, flash);

      // 14th page: erase, write, verify
      await this.erasePage(0x0D);
      await this.writePage(0x0D, blheliEeprom.PAGE_SIZE, flash);
      await this.verifyPage(0x0D, blheliEeprom.PAGE_SIZE, flash);
    };

    const flashArm = async(flash) => {
      this.totalBytes = (flash.byteLength - (flash.firmwareStart ? flash.firmwareStart : 0)) * 2;
      this.bytesWritten = 0;

      const message = await this.read(am32Eeprom.EEPROM_OFFSET, am32Eeprom.LAYOUT_SIZE);
      const originalSettings = message.params;

      const eepromInfo = new Uint8Array(17).fill(0x00);
      eepromInfo.set([originalSettings[1], originalSettings[2]], 1);
      eepromInfo.set(Convert.asciiToBuffer('FLASH FAIL  '), 5);

      await this.write(am32Eeprom.EEPROM_OFFSET, eepromInfo);

      await this.writePages(0x04, 0x40, am32Eeprom.PAGE_SIZE, flash);
      await this.verifyPages(0x04, 0x40, am32Eeprom.PAGE_SIZE, flash);

      originalSettings[0] = 0x01;
      originalSettings.fill(0x00, 3, 5);
      originalSettings.set(Convert.asciiToBuffer('NOT READY   '), 5);

      await this.write(am32Eeprom.EEPROM_OFFSET, originalSettings);
    };

    const flashTarget = async(target, flash) => {
      const startTimestamp = Date.now();

      const message = await this.initFlash(target);
      const interfaceMode = message.params[3];

      switch (interfaceMode) {
        case MODES.SiLBLB: {
          await flashSiLabs(flash);
        } break;

        case MODES.ARMBLB: {
          await flashArm(flash);

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

      const sameFirmware = (
        esc.individualSettings && newEsc.individualSettings &&
        esc.canMigrateTo.includes(newEsc.individualSettings.NAME)
      );

      /* Only migrate settings if new and old Firmware are the same or if user
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

        //TODO: Also check for the firmware name
        // But we first need to get this moved to a fixed location
        const firstBytes = flash.subarray(firmwareStart, firmwareStart + 4);
        const vecTabStart = new Uint8Array([ 0x00, 0x20, 0x00, 0x20 ]);
        if (!compare(firstBytes, vecTabStart)) {
          throw new InvalidHexFileError('Invalid hex file');
        }

        if (firmwareStart) {
          flash.firmwareStart = firmwareStart;
        }

        return flashTarget(target, flash);
      } catch(e) {
        console.debug('Failed flashing Arm:', e);
        return null;
      }
    } else if(!esc.isAtmel) {
      try {
        const parsed = Flash.parseHex(hex);
        const flash = Flash.fillImage(parsed, flashSize, flashOffset);

        // Check pseudo-eeprom page for BLHELI signature
        const mcu = Convert.bufferToAscii(
          flash.subarray(blheliEeprom.SILABS.EEPROM_OFFSET)
            .subarray(blheliEeprom.LAYOUT.MCU.offset)
            .subarray(0, blheliEeprom.LAYOUT.MCU.size));

        if(!isValidFlash(mcu, flash)) {
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
    } else {
      throw new UnknownInterfaceError(interfaceMode);
    }
  }

  async writeBootoaderFailsafe() {
    //const ljmpReset = new Uint8Array([0x02, 0x19, 0xFD]);
    const ljmpBootloader = new Uint8Array([0x02, 0x1C, 0x00]);

    /*
    const message = await this.read(0, 3);

    if(!compare(ljmpReset, message.params)) {
      // @todo LJMP bootloader is probably already there and we could skip some steps
    }
    */

    await this.erasePage(0x01);
    await this.write(0x200, ljmpBootloader);

    const verifyBootloader = async (resolve, reject) => {
      const response = await this.read(0x200, ljmpBootloader.byteLength);

      if(!compare(ljmpBootloader, response.params)) {
        reject(new Error('failed to verify `LJMP bootloader` write'));
      }

      resolve();
    };

    await retry(verifyBootloader, 10);

    await this.erasePage(0x00);
    const beginAddress = 0x00;
    const endAddress = 0x200;
    const step = 0x80;

    for (var address = beginAddress; address < endAddress; address += step) {
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

  async writeEEpromSafeguard(settings) {
    settings.set(Convert.asciiToBuffer('**FLASH*FAILED**'), blheliEeprom.LAYOUT.NAME.offset);
    const response = await this.write(blheliEeprom.EEPROM_OFFSET, settings);

    const verifySafeguard = async (resolve, reject) => {
      const message = await this.read(response.address, blheliEeprom.LAYOUT_SIZE);

      if (!compare(settings, message.params)) {
        reject(new Error('failed to verify write **FLASH*FAILED**'));
      }

      resolve();
    };

    await retry(verifySafeguard, 10);
  }

  async verifyPages(begin, end, pageSize, image) {
    const beginAddress = begin * pageSize;
    const end_address = end * pageSize;
    const step = 0x80;

    for (var address = beginAddress; address < end_address && address < image.length; address += step) {
      const verifyPages = async (resolve, reject) => {
        const message = await this.read(address, Math.min(step, image.length - address));
        const reference = image.subarray(message.address, message.address + message.params.byteLength);

        if (!compare(message.params,reference)) {
          console.debug('Verification failed - retry');
          reject(new Error(`failed to verify write at address 0x${message.address.toString(0x10)}`));
        } else {
          this.bytesWritten += step;
          this.progressCallback((this.bytesWritten / this.totalBytes) * 100);

          resolve();
        }
      };

      // Verification might not always succeed on the first time
      await retry(verifyPages, 10);
    }
  }

  verifyPage(page, pageSize, image) {
    return this.verifyPages(page, page + 1, pageSize, image);
  }

  async writePages(begin, end, pageSize, image) {
    const beginAddress = begin * pageSize;
    const endAddress = end * pageSize;
    const step = 0x100;

    for (let address = beginAddress; address < endAddress && address < image.length; address += step) {
      await this.write(
        address,
        image.subarray(address, Math.min(address + step, image.length)));

      this.bytesWritten += step;
      this.progressCallback((this.bytesWritten / this.totalBytes) * 100);
    }
  }

  writePage(page, pageSize, image) {
    return this.writePages(page, page + 1, pageSize, image);
  }

  erasePage(page) {
    return this.erasePages(page, page + 1);
  }

  async erasePages(startPage, stopPage) {
    for(let page = startPage; page < stopPage; page += 1) {
      await this.pageErase(page);
    }
  }

  pageErase(page) {
    return this.sendMessagePromised(COMMANDS.cmd_DevicePageErase, [page]);
  }

  read(address, bytes, retries = 10) {
    return this.sendMessagePromised(
      COMMANDS.cmd_DeviceRead,
      [bytes === 256 ? 0 : bytes],
      address,
      retries
    );
  }

  readEEprom(address, bytes) {
    return this.sendMessagePromised(
      COMMANDS.cmd_DeviceReadEEprom,
      [bytes === 256 ? 0 : bytes],
      address
    );
  }

  write(address, data) {
    return this.sendMessagePromised(COMMANDS.cmd_DeviceWrite, data, address);
  }

  writeEEprom(address, data) {
    return this.sendMessagePromised(COMMANDS.cmd_DeviceWriteEEprom, data, address);
  }

  reset(target) {
    return this.sendMessagePromised(COMMANDS.cmd_DeviceReset, [target], 0);
  }

  exit() {
    clearInterval(this.interval);

    return this.sendMessagePromised(COMMANDS.cmd_InterfaceExit);
  }

  testAlive() {
    return this.sendMessagePromised(COMMANDS.cmd_InterfaceTestAlive);
  }

  start() {
    const self = this;

    this.interval = setInterval(async() => {
      if (Date.now() - self.lastCommandTimestamp > 900) {
        try {
          await self.testAlive();
        } catch (error) {
          console.debug('Alive Test failed');
        }
      }
    }, 800);
  }
}

export default FourWay;
