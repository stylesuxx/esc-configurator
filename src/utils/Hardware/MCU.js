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
  }

  getFlashSize() {
    return this.mcu.flash_size;
  }

  getFlashOffset() {
    return parseInt(this.mcu.flash_offset, 16);
  }

  getEepromOffset() {
    return parseInt(this.mcu.eeprom_offset, 16);
  }

  getPageSize() {
    return this.mcu.page_size;
  }

  getBootloaderAddress() {
    if(this.mcu.bootloader_address) {
      return parseInt(this.mcu.bootloader_address, 16);
    }

    throw new Error("MCU does not have bootloader address");
  }

  getFirmwareStart() {
    if(this.mcu.firmware_start) {
      return parseInt(this.mcu.firmware_start, 16);
    }

    throw new Error("MCU does not have firmware start address");
  }

  getLockByteAddress() {
    if(this.mcu.lockbyte_address) {
      return parseInt(this.mcu.lockbyte_address, 16);
    }

    throw new Error("MCU does not have lock byte address");
  }
}

export default MCU;
