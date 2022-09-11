import {
  UnknownInterfaceError,
  UnknownMcuError,
} from '../Errors';
import { MODES } from '../FourWayConstants';
import { findMCU } from '../helpers/General';

import {
  am32Source,
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
    if(this.mcu.flash_size) {
      return this.mcu.flash_size;
    }

    return 0;
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
}

export default MCU;
