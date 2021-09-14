import {
  UnknownInterfaceError,
  UnknownMcuError,
} from '../Errors';
import { MODES } from '../FourWayConstants';
import { findMCU } from './General';

import {
  am32Source,
  blheliSource,
  bluejaySource,
} from '../../sources';

const blheliEscs = blheliSource.getLocalEscs();
const blheliEeprom = blheliSource.getEeprom();

const bluejayEscs = bluejaySource.getLocalEscs();
const bluejayEeprom = bluejaySource.getEeprom();

const am32Escs = am32Source.getLocalEscs();

class MCU {
  constructor(interfaceMode, signature) {
    this.interfaceMode = interfaceMode;
    this.mcu = ((interfaceMode) => {
      switch(interfaceMode) {
        case MODES.SiLBLB: {
          return (
            findMCU(signature, bluejayEscs.signatures[bluejayEeprom.TYPES.EFM8]) ||
            findMCU(signature, blheliEscs.signatures[blheliEeprom.TYPES.BLHELI_S_SILABS]) ||
            findMCU(signature, blheliEscs.signatures.SiLabs)
          );
        }

        case MODES.AtmBLB:
        case MODES.AtmSK: {
          return findMCU(signature, blheliEscs.signatures.Atmel);
        }

        case MODES.ARMBLB: {
          return findMCU(signature, am32Escs.signatures.Arm);
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
