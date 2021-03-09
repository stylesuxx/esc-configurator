import {
  BLHELI_INDIVIDUAL_SETTINGS_DESCRIPTIONS,
  BLHELI_SETTINGS_DESCRIPTIONS,
  BLHELI_SILABS_EEPROM_OFFSET,
  BLHELI_SILABS_PAGE_SIZE,
  BLHELI_LAYOUT_SIZE,
  BLHELI_LAYOUT,
  BLHELI_SILABS,
  BLHELI_TYPES,
  Blheli,
} from './Blheli';

import BLHELI_ESCS from '../sources/Blheli/escs.json';
import BLUEJAY_ESCS  from '../sources/Bluejay/escs.json';

import {
  fillImage,
  parseHex,
  buf2ascii,
  ascii2buf,
} from './helpers/Flash';

import {
  retry,
  compare,
  findMCU,
  isValidFlash,
} from './helpers/General';

import {
  OPEN_ESC_EEPROM_OFFSET,
  OPEN_ESC_LAYOUT,
  OPEN_ESC_LAYOUT_SIZE,
  OPEN_ESC_SETTINGS_DESCRIPTIONS,
  OPEN_ESC_INDIVIDUAL_SETTINGS_DESCRIPTIONS,
} from './OpenEsc';

import {
  canMigrate as bluejayCanMigrate,
  BLUEJAY_TYPES,
  BLUEJAY_LAYOUT,
  BLUEJAY_LAYOUT_SIZE,
  BLUEJAY_SETTINGS_DESCRIPTIONS,
  BLUEJAY_INDIVIDUAL_SETTINGS_DESCRIPTIONS,
} from './Bluejay';

import {
  NotEnoughDataError,
} from './helpers/QueueProcessor';

class FourWay {
  constructor(serial) {
    this.serial = serial;

    this.commandQueue = [];

    this.lastCommandTimestamp = 0;
    this.commands = {
      cmd_InterfaceTestAlive: 0x30,
      cmd_ProtocolGetVersion: 0x31,
      cmd_InterfaceGetName: 0x32,
      cmd_InterfaceGetVersion: 0x33,
      cmd_InterfaceExit: 0x34,
      cmd_DeviceReset: 0x35,
      cmd_DeviceInitFlash: 0x37,
      cmd_DeviceEraseAll: 0x38,
      cmd_DevicePageErase: 0x39,
      cmd_DeviceRead: 0x3a,
      cmd_DeviceWrite: 0x3b,
      cmd_DeviceC2CK_LOW: 0x3c,
      cmd_DeviceReadEEprom: 0x3d,
      cmd_DeviceWriteEEprom: 0x3e,
      cmd_InterfaceSetMode: 0x3f,
    };

    // Acknowledgment answers from interface
    this.ack = {
      ACK_OK: 0x00,
      ACK_I_UNKNOWN_ERROR: 0x01, // Unused
      ACK_I_INVALID_CMD: 0x02,
      ACK_I_INVALID_CRC: 0x03,
      ACK_I_VERIFY_ERROR: 0x04,
      ACK_D_INVALID_COMMAND: 0x05, // Unused
      ACK_D_COMMAND_FAILED: 0x06, // Unused
      ACK_D_UNKNOWN_ERROR: 0x07, // Unused
      ACK_I_INVALID_CHANNEL: 0x08,
      ACK_I_INVALID_PARAM: 0x09,
      ACK_D_GENERAL_ERROR: 0x0f,
    };

    this.modes = {
      SiLC2: 0,
      SiLBLB: 1,
      AtmBLB: 2,
      AtmSK: 3,
      ARMBLB: 4,
    };

    this.siLabsModes = [
      this.modes.SiLC2,
      this.modes.SiLBLB,
    ];

    this.atmelModes = [
      this.modes.AtmBLB,
      this.modes.AtmSK,
    ];

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

  addLogMessage(message) {
    if(this.logCallback) {
      this.logCallback(message);
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
    for (const field in this.commands) {
      if (this.commands[field] === command) {
        return field;
      }
    }

    console.debug(`invalid command: ${command}`);
    return null;
  }

  ackToString(ack) {
    for (const field in this.ack) {
      if (this.ack[field] === ack) {
        return field;
      }
    }

    console.debug(`invalid ack: ${ack}`);
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
      throw new Error(`4way interface supports maximum of 256 params, ${params.length} passed`);
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
      console.debug(error);
      return reject(new Error(error));
    }

    if (view.length < 9) {
      console.debug('Incomplete message - waiting');
      return reject(new NotEnoughDataError());
    }

    let paramCount = view[4];
    if (paramCount === 0) {
      paramCount = 256;
    }

    if (view.length < 8 + paramCount) {
      console.debug('Incomplete message - waiting');
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

  async processQueue() {
    if(!this.processing) {
      this.processing = true;
      while(this.commandQueue.length > 0) {
        const commandCurrent = this.commandQueue.shift();
        const {
          command, params, address, callback, timeout,
        } = commandCurrent;
        const result = await this.sendMessagePromised(command, params, address, timeout);

        if (callback) {
          callback(result);
        }
      }
    }

    this.processing = false;
  }

  addCommand(command, params = [0], address = 0, timeout = 5000){
    return new Promise((resolve) => {
      const callback = (result) => resolve(result);

      const newCommand = {
        command,
        params,
        address,
        callback,
        timeout,
      };

      this.commandQueue.push(newCommand);
      this.processQueue();
    });
  }

  sendMessagePromised(command, params = [0], address = 0) {
    const self = this;

    const process = async (resolve) => {
      this.lastCommandTimestamp = Date.now();
      const message = self.createMessage(command, params, address);

      // Debug print all messages except the keep alive messages
      if (command !== this.commands.cmd_InterfaceTestAlive) {
        console.debug('sending', this.commandToString(command), address.toString(0x10));
      }

      const processMessage = async(resolve, reject) => {
        // Immediately resolve the exit command since it will not produce any
        // processable output.
        if (command === this.commands.cmd_InterfaceExit) {
          await this.serial(message, null);
          return resolve();
        }

        const msg = await this.serial(message, this.parseMessage);

        if (msg && msg.ack === self.ack.ACK_OK) {
          return resolve(msg);
        }

        return reject(new Error('Message not OK'));
      };

      try {
        const result = await retry(processMessage, 10, 250);
        return resolve(result);
      } catch(e) {
        console.debug('Failed processing command', command);
        resolve(null);
      }
    };

    return new Promise((resolve) => process(resolve));
  }

  async getInfo(target) {
    const flash = await this.initFlash(target);

    if (flash) {
      const maxRetry = 5;
      let retry = 0;
      while(retry < maxRetry) {
        flash.meta = {};

        try {
          const blheli = new Blheli();
          const interfaceMode = flash.params[3];

          flash.meta.signature = flash.params[1] << 8 | flash.params[0];
          flash.meta.interfaceMode = interfaceMode;
          flash.meta.available = true;

          const isAtmel = this.atmelModes.includes(interfaceMode);
          const isSiLabs = this.siLabsModes.includes(interfaceMode);
          const isArm = interfaceMode === this.modes.ARMBLB;
          let settingsArray = null;
          let layout = BLHELI_LAYOUT;
          let layoutSize = BLHELI_LAYOUT_SIZE;

          if (isSiLabs) {
            layoutSize = BLHELI_LAYOUT_SIZE;
            settingsArray = (await this.read(BLHELI_SILABS.EEPROM_OFFSET, layoutSize)).params;
          } else if (isArm) {
            layoutSize = OPEN_ESC_LAYOUT_SIZE;
            layout = OPEN_ESC_LAYOUT;
            settingsArray = (await this.read(OPEN_ESC_EEPROM_OFFSET, layoutSize)).params;
          } else {
            throw new Error('Neither Silabs nor Arm');
          }

          flash.isSiLabs = isSiLabs;
          flash.isArm = isArm;
          flash.isAtmel = isAtmel;

          flash.settingsArray = settingsArray;
          flash.settings = blheli.settingsObject(
            settingsArray,
            layout
          );

          /**
           * Baased on the name we can decide if the initially guessed layout
           * was correct, if not, we need to build a new settings object.
           */
          const name = flash.settings.NAME;
          let newLayout = null;
          switch(name) {
            case 'Bluejay':
            case 'Bluejay (BETA)': {
              newLayout = BLUEJAY_LAYOUT;
              layoutSize = BLUEJAY_LAYOUT_SIZE;
            } break;
          }

          if(newLayout) {
            layout = newLayout;

            flash.settings = blheli.settingsObject(
              settingsArray,
              layout
            );
          }

          const layoutRevision = flash.settings.LAYOUT_REVISION.toString();

          let individualSettingsDescriptions = null;
          let settingsDescriptions = null;
          switch(layout) {
            case BLHELI_LAYOUT: {
              settingsDescriptions = BLHELI_SETTINGS_DESCRIPTIONS;
              individualSettingsDescriptions = BLHELI_INDIVIDUAL_SETTINGS_DESCRIPTIONS;
            } break;

            case BLUEJAY_LAYOUT: {
              settingsDescriptions = BLUEJAY_SETTINGS_DESCRIPTIONS;
              individualSettingsDescriptions = BLUEJAY_INDIVIDUAL_SETTINGS_DESCRIPTIONS;
            } break;

            case OPEN_ESC_LAYOUT: {
              settingsDescriptions = OPEN_ESC_SETTINGS_DESCRIPTIONS;
              individualSettingsDescriptions = OPEN_ESC_INDIVIDUAL_SETTINGS_DESCRIPTIONS;
            } break;
          }

          flash.settingsDescriptions = settingsDescriptions[layoutRevision];
          flash.individualSettingsDescriptions = individualSettingsDescriptions[layoutRevision];

          if (interfaceMode !== this.modes.ARMBLB) {
            const mode = blheli.modeToString(flash.settings.MODE);
            const descriptions = settingsDescriptions[layoutRevision][mode];
            flash.settingsDescriptions = descriptions;
          }

          const layoutName = (flash.settings.LAYOUT || '').trim();
          let bootloaderRevision = null;
          let make = null;
          if (isSiLabs) {
            const blheliLayouts = BLHELI_ESCS.layouts[BLHELI_TYPES.SILABS];
            const blheliSLayouts = BLHELI_ESCS.layouts[BLHELI_TYPES.BLHELI_S_SILABS];
            const bluejayLayouts = BLUEJAY_ESCS.layouts[BLUEJAY_TYPES.EFM8];

            if (layoutName in blheliLayouts) {
              make = blheliLayouts[layoutName].name;
            } else if (layoutName in blheliSLayouts) {
              make = blheliSLayouts[layoutName].name;
            } else if (layoutName in bluejayLayouts) {
              make = bluejayLayouts[layoutName].name;
            }
          } else if (isArm) {
            bootloaderRevision = flash.settings.BOOT_LOADER_REVISION;
          } else {
            const blheliAtmelLayouts = BLHELI_ESCS.layouts[BLHELI_TYPES.ATMEL];
            if (layoutName in blheliAtmelLayouts) {
              make = blheliAtmelLayouts[layoutName].name;
            }
          }

          flash.bootloaderRevision = bootloaderRevision;
          flash.layoutSize = layoutSize;
          flash.layout = layout;
          flash.make = make;

          break;
        } catch (e) {
          if(retry < maxRetry) {
            retry += 1;
            continue ;
          }
          console.log(`ESC ${target + 1} read settings failed ${e.message}`, e);

          return null;
        }
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

  async initFlash(target) {
    return this.addCommand(this.commands.cmd_DeviceInitFlash, [target], 500);
  }

  async writeSettings(target, esc, settings) {
    const flash = await this.addCommand(
      this.commands.cmd_DeviceInitFlash, [target], 500
    );

    if (flash) {
      const blheli = new Blheli();
      const newSettings = blheli.settingsArray(settings, esc.layout, esc.layoutSize);
      if(newSettings.length !== esc.settingsArray.length) {
        throw new Error('byteLength of buffers do not match');
      }

      if(compare(newSettings, esc.settingsArray)) {
        this.addLogMessage(`No changes - not updating ESC ${target + 1}`);
        return;
      } else {
        let readbackSettings = null;
        if(esc.isSiLabs) {
          await this.pageErase(BLHELI_SILABS_EEPROM_OFFSET / BLHELI_SILABS_PAGE_SIZE);
          await this.write(BLHELI_SILABS_EEPROM_OFFSET, newSettings);
          readbackSettings = (await this.read(BLHELI_SILABS_EEPROM_OFFSET, BLHELI_LAYOUT_SIZE)).params;
        } else if (esc.isArm) {
          await this.write(OPEN_ESC_EEPROM_OFFSET, newSettings);
          readbackSettings = (await this.read(OPEN_ESC_EEPROM_OFFSET, OPEN_ESC_LAYOUT_SIZE)).params;
        } else {
          // write only changed bytes for Atmel
          for (var pos = 0; pos < newSettings.byteLength; pos += 1) {
            var offset = pos;

            // find the longest span of modified bytes
            while (newSettings[pos] !== esc.settingsArray[pos]) {
              pos += 1;
            }

            // byte unchanged, continue
            if (offset === pos) {
              continue;
            }

            // write span
            await this.writeEEprom(offset, newSettings.subarray(offset, pos));
            readbackSettings = (await this.readEEprom(0, BLHELI_LAYOUT_SIZE)).params;
          }
        }

        if(!compare(newSettings, readbackSettings)) {
          throw new Error('Failed to verify settings');
        }

        this.addLogMessage(`Updating ESC ${target + 1} - finished`);
        return;
      }
    }

    this.addLogMessage(`Updating ESC ${target + 1} - failed`);
  }

  async writeHex(target, esc, hex, force, cbProgress) {
    const {
      interfaceMode, signature,
    } = esc.meta;

    this.progressCallback = cbProgress;

    let flashOffset = 0;
    let firmwareStart = 0;
    let flashSize = (() => {
      let mcu = null;

      switch(interfaceMode) {
        case this.modes.SiLC2: {
          return BLHELI_SILABS.FLASH_SIZE;
        }

        case this.modes.SiLBLB: {
          mcu = findMCU(signature, BLUEJAY_ESCS.signatures[BLUEJAY_TYPES.EFM8]) ||
                findMCU(signature, BLHELI_ESCS.signatures[BLHELI_TYPES.BLHELI_S_SILABS]) ||
                findMCU(signature, BLHELI_ESCS.signatures.SiLabs);
        } break;

        case this.modes.AtmBLB:
        case this.modes.AtmSK: {
          mcu = findMCU(signature, BLHELI_ESCS.signatures.Atmel);
        } break;

        case this.modes.ARMBLB: {
          mcu = findMCU(signature, BLHELI_ESCS.signatures.Arm);
        } break;

        default: {
          throw new Error(`unknown interfaceMode ${interfaceMode}`);
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

    if(esc.isArm) {
      // TODO: This still needs implementation
      throw new Error('Can not flash ARM yet.');
    } else if(!esc.isAtmel) {
      try {
        const parsed = parseHex(hex);
        const flash = fillImage(parsed, flashSize, flashOffset);

        // Check pseudo-eeprom page for BLHELI signature
        const mcu = buf2ascii(
          flash.subarray(BLHELI_SILABS.EEPROM_OFFSET)
            .subarray(BLHELI_LAYOUT.MCU.offset)
            .subarray(0, BLHELI_LAYOUT.MCU.size));

        if(!isValidFlash(mcu, flash)) {
          throw new Error('Invalid hex file');
        }

        if (firmwareStart) {
          flash.firmwareStart = firmwareStart;
        }

        const startTimestamp = Date.now();

        const message = await this.initFlash(target);
        const interfaceMode = message.params[3];

        switch (interfaceMode) {
          case this.modes.SiLBLB: {
            /**
             * The size of the Flash is larger than the pages we write.
             * that is why we need to calculate the total Bytes by page size
             * and actual pages we write, which in this case is 14.
             *
             * We then double that since we are also tracking the bytes read back
             * and update the progress bar accordingly.
             */
            this.totalBytes = BLHELI_SILABS_PAGE_SIZE * 14 * 2;
            this.bytesWritten = 0;

            const message = await this.read(BLHELI_SILABS.EEPROM_OFFSET, BLHELI_LAYOUT_SIZE);

            // checkESCAndMCU
            const escSettingArrayTmp = message.params;
            const target_layout = escSettingArrayTmp.subarray(
              BLHELI_LAYOUT.LAYOUT.offset,
              BLHELI_LAYOUT.LAYOUT.offset + BLHELI_LAYOUT.LAYOUT.size);

            const settings_image = flash.subarray(BLHELI_SILABS_EEPROM_OFFSET);
            const fw_layout = settings_image.subarray(
              BLHELI_LAYOUT.LAYOUT.offset,
              BLHELI_LAYOUT.LAYOUT.offset + BLHELI_LAYOUT.LAYOUT.size);

            if (!compare(target_layout, fw_layout)) {
              var target_layout_str = buf2ascii(target_layout).trim();
              if (target_layout_str.length === 0) {
                target_layout_str = 'EMPTY';
              }

              if(!force) {
                this.addLogMessage('Layout mismatch, override not enabled - aborted');
                return esc;
              }
            }

            const target_mcu = escSettingArrayTmp.subarray(
              BLHELI_LAYOUT.MCU.offset,
              BLHELI_LAYOUT.MCU.offset + BLHELI_LAYOUT.MCU.size);
            const fw_mcu = settings_image.subarray(
              BLHELI_LAYOUT.MCU.offset,
              BLHELI_LAYOUT.MCU.offset + BLHELI_LAYOUT.MCU.size);
            if (!compare(target_mcu, fw_mcu)) {
              var target_mcu_str = buf2ascii(target_mcu).trim();
              if (target_mcu_str.length === 0) {
                target_mcu_str = 'EMPTY';
              }

              if(!force) {
                this.addLogMessage('MCU mismatch, override not enabled - aborted');
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
            await this.writePages(0x02, 0x0D, BLHELI_SILABS_PAGE_SIZE, flash);
            await this.verifyPages(0x02, 0x0D, BLHELI_SILABS_PAGE_SIZE, flash);

            // write & verify first page
            await this.writePage(0x00, BLHELI_SILABS_PAGE_SIZE, flash);
            await this.verifyPage(0x00, BLHELI_SILABS_PAGE_SIZE, flash);

            // erase second page
            await this.erasePage(0x01);

            // write & verify second page
            await this.writePage(0x01, BLHELI_SILABS_PAGE_SIZE, flash);
            await this.verifyPage(0x01, BLHELI_SILABS_PAGE_SIZE, flash);

            // erase EEPROM
            await this.erasePage(0x0D);

            // write & verify EEPROM
            await this.writePage(0x0D, BLHELI_SILABS_PAGE_SIZE, flash);
            await this.verifyPage(0x0D, BLHELI_SILABS_PAGE_SIZE, flash);

          } break;

          default: throw new Error(`Flashing with ${interfaceMode} is not yet implemented`);
        }

        const elapsedSec = (Date.now() - startTimestamp) / 1000;
        const rounded = Math.round(elapsedSec * 10) / 10;
        this.addLogMessage(`Flashed ESC ${target + 1} - ${rounded}s`);

        /**
         * Migrate settings from the previous firmware if possible.
         */
        const newEsc = await this.getInfo(target);
        const newSettings = Object.assign({}, newEsc.settings);
        const oldSettings = esc.settings;

        if(newSettings.MODE === oldSettings.MODE) {
          for (var prop in newSettings) {
            // TODO: Setting migration should only be attempted if flashing TO
            //       Bluejay.
            if (newSettings[prop] && oldSettings[prop] &&
                bluejayCanMigrate(prop, oldSettings, newSettings) &&
                newEsc.settings.NAME === 'Bluejay'
            ) {
              console.log('Migrating settings');
              newSettings[prop] = oldSettings[prop];
            }
          }
        }

        await this.writeSettings(target, newEsc, newSettings);
        newEsc.settings = newSettings;

        return newEsc;
      } catch(e) {
        console.log(e);
      }

    } else {
      throw new Error('Can not flash Atmel yet.');
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
    settings.set(ascii2buf('**FLASH*FAILED**'), BLHELI_LAYOUT.NAME.offset);
    const response = await this.write(BLHELI_SILABS_EEPROM_OFFSET, settings);

    const verifySafeguard = async (resolve, reject) => {
      const message = await this.read(response.address, BLHELI_LAYOUT_SIZE);

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
    return this.addCommand(this.commands.cmd_DevicePageErase, [page], 0);
  }

  read(address, bytes) {
    return this.addCommand(
      this.commands.cmd_DeviceRead, [bytes === 256 ? 0 : bytes], address, 5000
    );
  }

  readEEprom(address, bytes) {
    return this.addCommand(
      this.commands.cmd_DeviceReadEEprom, [bytes === 256 ? 0 : bytes], address
    );
  }

  write(address, data) {
    return this.addCommand(this.commands.cmd_DeviceWrite, data, address);
  }

  writeEEprom(address, data) {
    // Writing EEprom is real slow on Atmel, hence increased timeout
    return this.addCommand(this.commands.cmd_DeviceWriteEEprom, data, address, 10000);
  }

  reset(target) {
    return this.addCommand(this.commands.cmd_DeviceReset, [target], 0);
  }

  exit() {
    if (this.interval) {
      clearInterval(this.interval);
      this.commandQueue = [];
    }

    return this.addCommand(this.commands.cmd_InterfaceExit);
  }

  testAlive() {
    return this.addCommand(this.commands.cmd_InterfaceTestAlive);
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
