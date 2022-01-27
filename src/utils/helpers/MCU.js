import {
  UnknownInterfaceError,
  UnknownMcuError,
} from '../Errors';
import { MODES } from '../FourWayConstants';
import { findMCU } from './General';

import {
  am32Source,
  blheliSource,
  blheliSilabsSource,
  blheliSSource,
  bluejaySource,
} from '../../sources';

class MCU {
  constructor(interfaceMode, signature) {
    this.interfaceMode = interfaceMode;
    this.mcu = ((interfaceMode) => {
      switch(interfaceMode) {
        case MODES.SiLBLB: {
          return (
            findMCU(signature, bluejaySource.getMcus()) ||
            findMCU(signature, blheliSSource.getMcus()) ||
            findMCU(signature, blheliSilabsSource.getMcus())
          );
        }

        case MODES.SiLC2:
        case MODES.AtmBLB:
        case MODES.AtmSK: {
          return findMCU(signature, blheliSource.getMcus());
        }

        case MODES.ARMBLB: {
          return findMCU(signature, am32Source.getMcus());
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
    switch(this.interfaceMode) {
      case MODES.SiLC2: {
        const blheliEeprom = blheliSource.getEeprom();

        return blheliEeprom.SILABS.FLASH_SIZE;
      }
    }

    return this.mcu.flash_size;
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
