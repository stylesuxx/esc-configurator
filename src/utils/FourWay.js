import Convert from './helpers/Convert';
import Flash from './helpers/Flash';
import {
  BufferLengthMismatchError,
  EscInitError,
  EscLockedError,
  InvalidHexFileError,
  SettingsVerificationError,
  TooManyParametersError,
  UnknownInterfaceError,
  UnknownPlatformError,
} from './Errors';

import {
  buildDisplayName as blheliBuildDisplayName,
  EEPROM as BLHELI_EEPROM,
} from '../sources/Blheli';

import {
  buildDisplayName as am32BuildDisplayName,
  EEPROM as AM32_EEPROM,
} from '../sources/AM32';

import {
  buildDisplayName as bluejayBuildDisplayName,
  EEPROM as BLUEJAY_EEPROM,
} from '../sources/Bluejay';

// TODO: We might use the ones from the source here...
import BLHELI_ESCS from '../sources/Blheli/escs.json';
import BLUEJAY_ESCS from '../sources/Bluejay/escs.json';
import AM32_ESCS from '../sources/AM32/escs.json';

import {
  canMigrate,
  getIndividualSettings,
} from './helpers/Settings';

import {
  delay,
  retry,
  compare,
  findMCU,
  isValidFlash,
} from './helpers/General';

import {
  ACK,
  ATMEL_MODES,
  COMMANDS,
  MODES,
  SILABS_MODES,
} from './FourWayConstants';
import { NotEnoughDataError } from './helpers/QueueProcessor';

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

    const process = async (resolve) => {
      this.lastCommandTimestamp = Date.now();
      const message = self.createMessage(command, params, address);

      // Debug print all messages except the keep alive messages
      /*
      if (command !== COMMANDS.cmd_InterfaceTestAlive) {
        console.debug('sending', this.commandToString(command), address.toString(0x10));
      }
      */

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
        resolve(null);
      }
    };

    return new Promise((resolve) => process(resolve));
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
        let layout = BLHELI_EEPROM.LAYOUT;
        let layoutSize = BLHELI_EEPROM.LAYOUT_SIZE;
        let defaultSettings = BLHELI_EEPROM.DEFAULTS;

        if (isSiLabs) {
          layoutSize = BLHELI_EEPROM.LAYOUT_SIZE;
          settingsArray = (await this.read(BLHELI_EEPROM.SILABS.EEPROM_OFFSET, layoutSize)).params;
        } else if (isArm) {
          layoutSize = AM32_EEPROM.LAYOUT_SIZE;
          layout = AM32_EEPROM.LAYOUT;
          defaultSettings = AM32_EEPROM.DEFAULTS;
          settingsArray = (await this.read(AM32_EEPROM.EEPROM_OFFSET, layoutSize)).params;
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
        const name = flash.settings.NAME;
        let newLayout = null;
        if(BLUEJAY_EEPROM.NAMES.includes(name)) {
          newLayout = BLUEJAY_EEPROM.LAYOUT;
          layoutSize = BLUEJAY_EEPROM.LAYOUT_SIZE;
          defaultSettings = BLUEJAY_EEPROM.DEFAULTS;
          settingsArray = (await this.read(BLUEJAY_EEPROM.EEPROM_OFFSET, layoutSize)).params;
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
          case BLHELI_EEPROM.LAYOUT: {
            settingsDescriptions = BLHELI_EEPROM.SETTINGS_DESCRIPTIONS;
            individualSettingsDescriptions = BLHELI_EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
          } break;

          case BLUEJAY_EEPROM.LAYOUT: {
            settingsDescriptions = BLUEJAY_EEPROM.SETTINGS_DESCRIPTIONS;
            individualSettingsDescriptions = BLUEJAY_EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
          } break;

          case AM32_EEPROM.LAYOUT: {
            settingsDescriptions = AM32_EEPROM.SETTINGS_DESCRIPTIONS;
            individualSettingsDescriptions = AM32_EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
          } break;
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
        let displayName = 'UNKNOWN';
        if (isSiLabs) {
          const blheliLayouts = BLHELI_ESCS.layouts[BLHELI_EEPROM.TYPES.SILABS];
          const blheliSLayouts = BLHELI_ESCS.layouts[BLHELI_EEPROM.TYPES.BLHELI_S_SILABS];
          const bluejayLayouts = BLUEJAY_ESCS.layouts[BLUEJAY_EEPROM.TYPES.EFM8];

          if (BLUEJAY_EEPROM.NAMES.includes(name) && layoutName in bluejayLayouts) {
            make = bluejayLayouts[layoutName].name;
            displayName = bluejayBuildDisplayName(flash, make);
          }
          else if (layoutName in blheliLayouts) {
            make = blheliLayouts[layoutName].name;
          } else if (layoutName in blheliSLayouts) {
            make = blheliSLayouts[layoutName].name;
            displayName = blheliBuildDisplayName(flash, make);
          }
        } else if (isArm) {
          /* Read version information direct from EEPROM so we can later
           * compare to the settings object. This allows us to verify, that
           * everything went well after flashing.
           */
          const [mainRevision, subRevision] = (await this.read(AM32_EEPROM.VERSION_OFFSET, AM32_EEPROM.VERSION_SIZE)).params;

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
          for(let [key, value] of Object.entries(AM32_EEPROM.BOOT_LOADER_PINS)) {
            if(value === flash.bootloader.input) {
              flash.bootloader.valid = true;
              flash.bootloader.pin = key;
              flash.bootloader.version = flash.settings.BOOT_LOADER_REVISION;
            }
          }

          flash.settings.MAIN_REVISION = mainRevision;
          flash.settings.SUB_REVISION = subRevision;

          displayName = am32BuildDisplayName(flash, flash.settings.NAME);
        } else {
          const blheliAtmelLayouts = BLHELI_ESCS.layouts[BLHELI_EEPROM.TYPES.ATMEL];
          if (layoutName in blheliAtmelLayouts) {
            make = blheliAtmelLayouts[layoutName].name;
          }
        }

        flash.defaultSettings = defaultSettings[layoutRevision];
        flash.displayName = displayName;
        flash.layoutSize = layoutSize;
        flash.layout = layout;
        flash.make = make;
      } catch (e) {
        console.debug(`ESC ${target + 1} read settings failed ${e.message}`, e);
        return null;
      }

      try {
        flash.individualSettings = getIndividualSettings(flash);
      } catch(e) {
        console.debug('Could not get individual settings');
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
            const CODE_LOCK_BYTE_OFFSET = mcu.endsWith('B21#') ? 0xFBFE : 0x1FFE;
            const codeLockByte = (await this.read(CODE_LOCK_BYTE_OFFSET, 1)).params[0];
            if (codeLockByte !== 0xFF) {
              throw new EscLockedError(`ESC is locked (${codeLockByte})`);
            }
          }

          await this.pageErase(BLHELI_EEPROM.EEPROM_OFFSET / BLHELI_EEPROM.PAGE_SIZE);
          await this.write(BLHELI_EEPROM.EEPROM_OFFSET, newSettingsArray);
          readbackSettings = (await this.read(BLHELI_EEPROM.EEPROM_OFFSET, esc.layoutSize)).params;
        } else if (esc.isArm) {
          await this.write(AM32_EEPROM.EEPROM_OFFSET, newSettingsArray);
          readbackSettings = (await this.read(AM32_EEPROM.EEPROM_OFFSET, esc.layoutSize)).params;
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

  async writeHex(target, esc, hex, force, migrate, cbProgress) {
    const {
      interfaceMode, signature,
    } = esc.meta;

    this.progressCallback = cbProgress;

    let flashOffset = 0;
    let firmwareStart = 0;
    let flashSize = (() => {
      let mcu = null;

      switch(interfaceMode) {
        case MODES.SiLC2: {
          return BLHELI_EEPROM.SILABS.FLASH_SIZE;
        }

        case MODES.SiLBLB: {
          mcu = findMCU(signature, BLUEJAY_ESCS.signatures[BLUEJAY_EEPROM.TYPES.EFM8]) ||
                findMCU(signature, BLHELI_ESCS.signatures[BLHELI_EEPROM.TYPES.BLHELI_S_SILABS]) ||
                findMCU(signature, BLHELI_ESCS.signatures.SiLabs);
        } break;

        case MODES.AtmBLB:
        case MODES.AtmSK: {
          mcu = findMCU(signature, BLHELI_ESCS.signatures.Atmel);
        } break;

        case MODES.ARMBLB: {
          mcu = findMCU(signature, AM32_ESCS.signatures.Arm);
        } break;

        default: {
          throw new UnknownInterfaceError(interfaceMode);
        }
      }

      if(mcu.flash_offset) {
        flashOffset = parseInt(mcu.flash_offset, 16);
      }

      if(mcu.firmware_start) {
        firmwareStart = parseInt(mcu.firmware_start, 16);
      }

      return mcu.flash_size;
    })();

    const migrateSettings = async(oldEsc, newEsc) => {
      /**
       * Migrate settings from the previous firmware if possible.
       */
      const newSettings = Object.assign({}, newEsc.settings);
      const oldSettings = esc.settings;

      let settingsDescriptions = null;
      let individualSettingsDescriptions = null;
      switch(newEsc.layout) {
        case BLHELI_EEPROM.LAYOUT: {
          console.debug('BLHELI layout found');
          settingsDescriptions = BLHELI_EEPROM.SETTINGS_DESCRIPTIONS;
          individualSettingsDescriptions = BLHELI_EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
        } break;

        case BLUEJAY_EEPROM.LAYOUT: {
          console.debug('Bluejay layout found');
          settingsDescriptions = BLUEJAY_EEPROM.SETTINGS_DESCRIPTIONS;
          individualSettingsDescriptions = BLUEJAY_EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
        } break;

        case AM32_EEPROM.LAYOUT: {
          console.debug('AM32 layout found');
          settingsDescriptions = AM32_EEPROM.SETTINGS_DESCRIPTIONS;
          individualSettingsDescriptions = AM32_EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
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
      this.totalBytes = BLHELI_EEPROM.PAGE_SIZE * 14 * 2;
      this.bytesWritten = 0;

      const message = await this.read(BLHELI_EEPROM.SILABS.EEPROM_OFFSET, BLHELI_EEPROM.LAYOUT_SIZE);

      // checkESCAndMCU
      const escSettingArrayTmp = message.params;
      const target_layout = escSettingArrayTmp.subarray(
        BLHELI_EEPROM.LAYOUT.LAYOUT.offset,
        BLHELI_EEPROM.LAYOUT.LAYOUT.offset + BLHELI_EEPROM.LAYOUT.LAYOUT.size);

      const settings_image = flash.subarray(BLHELI_EEPROM.EEPROM_OFFSET);
      const fw_layout = settings_image.subarray(
        BLHELI_EEPROM.LAYOUT.LAYOUT.offset,
        BLHELI_EEPROM.LAYOUT.LAYOUT.offset + BLHELI_EEPROM.LAYOUT.LAYOUT.size);

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
        BLHELI_EEPROM.LAYOUT.MCU.offset,
        BLHELI_EEPROM.LAYOUT.MCU.offset + BLHELI_EEPROM.LAYOUT.MCU.size);
      const fw_mcu = settings_image.subarray(
        BLHELI_EEPROM.LAYOUT.MCU.offset,
        BLHELI_EEPROM.LAYOUT.MCU.offset + BLHELI_EEPROM.LAYOUT.MCU.size);
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

      // erase EEPROM page
      await this.erasePage(0x0D);

      // write **FLASH*FAILED** as ESC NAME
      await this.writeEEpromSafeguard(escSettingArrayTmp);

      // write `LJMP bootloader` to avoid bricking
      await this.writeBootoaderFailsafe();

      // erase up to EEPROM, skipping first two first pages with
      // bootloader failsafe
      await this.erasePages(0x02, 0x0D);

      // write & verify just erased locations
      await this.writePages(0x02, 0x0D, BLHELI_EEPROM.PAGE_SIZE, flash);
      await this.verifyPages(0x02, 0x0D, BLHELI_EEPROM.PAGE_SIZE, flash);

      // write & verify first page
      await this.writePage(0x00, BLHELI_EEPROM.PAGE_SIZE, flash);
      await this.verifyPage(0x00, BLHELI_EEPROM.PAGE_SIZE, flash);

      // erase second page
      await this.erasePage(0x01);

      // write & verify second page
      await this.writePage(0x01, BLHELI_EEPROM.PAGE_SIZE, flash);
      await this.verifyPage(0x01, BLHELI_EEPROM.PAGE_SIZE, flash);

      // erase EEPROM
      await this.erasePage(0x0D);

      // write & verify EEPROM
      await this.writePage(0x0D, BLHELI_EEPROM.PAGE_SIZE, flash);
      await this.verifyPage(0x0D, BLHELI_EEPROM.PAGE_SIZE, flash);
    };

    const flashArm = async(flash) => {
      this.totalBytes = (flash.byteLength - (flash.firmwareStart ? flash.firmwareStart : 0)) * 2;
      this.bytesWritten = 0;

      const message = await this.read(AM32_EEPROM.EEPROM_OFFSET, AM32_EEPROM.LAYOUT_SIZE);
      const originalSettings = message.params;

      const eepromInfo = new Uint8Array(17).fill(0x00);
      eepromInfo.set([originalSettings[1], originalSettings[2]], 1);
      eepromInfo.set(Convert.asciiToBuffer('FLASH FAIL  '), 5);

      await this.write(AM32_EEPROM.EEPROM_OFFSET, eepromInfo);

      await this.writePages(0x04, 0x40, AM32_EEPROM.PAGE_SIZE, flash);
      await this.verifyPages(0x04, 0x40, AM32_EEPROM.PAGE_SIZE, flash);

      originalSettings[0] = 0x01;
      originalSettings.fill(0x00, 3, 5);
      originalSettings.set(Convert.asciiToBuffer('NOT READY   '), 5);

      await this.write(AM32_EEPROM.EEPROM_OFFSET, originalSettings);
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
          await delay(AM32_EEPROM.RESET_DELAY);
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
      if(migrate) {
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
          flash.subarray(BLHELI_EEPROM.SILABS.EEPROM_OFFSET)
            .subarray(BLHELI_EEPROM.LAYOUT.MCU.offset)
            .subarray(0, BLHELI_EEPROM.LAYOUT.MCU.size));

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
    const ljmpReset = new Uint8Array([ 0x02, 0x19, 0xFD ]);
    const ljmpBootloader = new Uint8Array([ 0x02, 0x1C, 0x00 ]);

    const message = await this.read(0, 3);

    if(!compare(ljmpReset, message.params)) {
      // @todo LJMP bootloader is probably already there and we could skip some steps
    }

    await this.erasePage(1);
    await this.write(0x200, ljmpBootloader);

    const verifyBootloader = async (resolve, reject) => {
      const response = await this.read(0x200, ljmpBootloader.byteLength);

      if(!compare(ljmpBootloader, response.params)) {
        reject(new Error('failed to verify `LJMP bootloader` write'));
      }

      resolve();
    };

    await retry(verifyBootloader, 10);

    await this.erasePage(0);
    const beginAddress = 0;
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
    settings.set(Convert.asciiToBuffer('**FLASH*FAILED**'), BLHELI_EEPROM.LAYOUT.NAME.offset);
    const response = await this.write(BLHELI_EEPROM.EEPROM_OFFSET, settings);

    const verifySafeguard = async (resolve, reject) => {
      const message = await this.read(response.address, BLHELI_EEPROM.LAYOUT_SIZE);

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
