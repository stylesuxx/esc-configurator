import {
  UnknownInterfaceError,
  UnknownMcuError,
} from '../Errors';
import { MODES } from '../FourWayConstants';
import { findMCU } from '../helpers/General';

import {
  blheliSource,
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

    if(!this.mcu) {
      throw new UnknownMcuError(signature);
    }
  }

  getFlashSize() {
    return this.mcu.flash_size;
  }

  getEepromOffset() {
    if(this.mcu.eeprom_offset) {
      return parseInt(this.mcu.eeprom_offset, 16);
    }

    return 0;
  }

  getPageSize() {
    if(this.mcu.page_size) {
      return this.mcu.page_size;
    }

    return 512;
  }

  getBootloaderAddress() {
    return parseInt(this.mcu.bootloader_address, 16);
  }

  getFlashOffset() {
    if(this.mcu.flash_offset) {
      return parseInt(this.mcu.flash_offset, 16);
    }

    return 0;
  }

  getFirmwareStart() {
    if(this.mcu.firmware_start) {
      return parseInt(this.mcu.firmware_start, 16);
    }

    return 0;
  }

  getLockByteAddress() {
    if(this.mcu.lockbyte_address) {
      return parseInt(this.mcu.lockbyte_address, 16);
    }

    return 0;
  }
}

export default MCU;
