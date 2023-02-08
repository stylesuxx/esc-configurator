import { UnknownInterfaceError } from '../Errors';
import { MODES } from '../FourWayConstants';
import { findMCU } from '../helpers/General';

import {
  blheliAtmelSource as blheliSource,
  blheliSilabsSource,
} from '../../sources';

import Arm from "./Arm";
import Silabs from "./Silabs";

class MCU {
  /**
   * Instanciate a MCU based on interface mode and signature
   *
   * The constructor will try to guess based on provided information which type
   * of MCU this is. Arm based and SiLab EFM8 based platforms are supported.
   *
   * @param {number} interfaceMode
   * @param {number} signature
   */
  constructor(interfaceMode, signature) {
    this.interfaceMode = interfaceMode;
    this.mcu = ((interfaceMode) => {
      switch(interfaceMode) {
        case MODES.SiLBLB: {
          return (
            Silabs.getMcu(signature) ||
            findMCU(signature, blheliSilabsSource.getMcus())
          );
        }

        case MODES.SiLC2:
        case MODES.AtmBLB:
        case MODES.AtmSK: {
          return findMCU(signature, blheliSource.getMcus());
        }

        case MODES.ARMBLB: {
          return Arm.getMcu(signature);
        }

        default: {
          throw new UnknownInterfaceError(interfaceMode);
        }
      }
    })(interfaceMode);

    this.class = ((interfaceMode) => {
      switch(interfaceMode) {
        case MODES.SiLBLB: {
          return Silabs;
        }

        case MODES.ARMBLB: {
          return Arm;
        }

        default: {
          return null;
        }
      }
    })(interfaceMode);
  }

  /**
   * Get MCU name
   *
   * @returns {string}
   */
  getName() {
    return this.mcu.name;
  }

  /**
   * Get flash size in bytes
   *
   * @returns {number}
   */
  getFlashSize() {
    return this.mcu.flash_size;
  }

  /**
   * Get address of flash offset
   *
   * @returns {number}
   */
  getFlashOffset() {
    return parseInt(this.mcu.flash_offset, 16);
  }

  /**
   * Get address of EEprom offset
   *
   * @returns {number}
   */
  getEepromOffset() {
    return parseInt(this.mcu.eeprom_offset, 16);
  }

  /**
   * Get page size
   *
   * @returns {number}
   */
  getPageSize() {
    return this.mcu.page_size;
  }

  /**
   * Get bootloader address
   *
   * @returns {number}
   */
  getBootloaderAddress() {
    if(this.mcu.bootloader_address) {
      return parseInt(this.mcu.bootloader_address, 16);
    }

    throw new Error("MCU does not have bootloader address");
  }

  /**
   * Get firmware start address
   *
   * @returns {number}
   */
  getFirmwareStart() {
    if(this.mcu.firmware_start) {
      return parseInt(this.mcu.firmware_start, 16);
    }

    throw new Error("MCU does not have firmware start address");
  }

  /**
   * Get lock byte address
   *
   * @returns {number}
   */
  getLockByteAddress() {
    if(this.mcu.lockbyte_address) {
      return parseInt(this.mcu.lockbyte_address, 16);
    }

    throw new Error("MCU does not have lock byte address");
  }
}

export default MCU;
