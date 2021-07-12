import {
  UnknownInterfaceError,
  UnknownMcuError,
} from '../Errors';
import { MODES } from '../FourWayConstants';
import { findMCU } from './General';

import { EEPROM as BLUEJAY_EEPROM } from '../../sources/Bluejay';
import { EEPROM as BLHELI_EEPROM } from '../../sources/Blheli';

import BLUEJAY_ESCS from '../../sources/Bluejay/escs.json';
import BLHELI_ESCS from '../../sources/Blheli/escs.json';
import AM32_ESCS from '../../sources/AM32/escs.json';

class MCU {
  constructor(interfaceMode, signature) {
    this.interfaceMode = interfaceMode;
    this.mcu = ((interfaceMode) => {
      switch(interfaceMode) {
        case MODES.SiLBLB: {
          return (
            findMCU(signature, BLUEJAY_ESCS.signatures[BLUEJAY_EEPROM.TYPES.EFM8]) ||
            findMCU(signature, BLHELI_ESCS.signatures[BLHELI_EEPROM.TYPES.BLHELI_S_SILABS]) ||
            findMCU(signature, BLHELI_ESCS.signatures.SiLabs)
          );
        }

        case MODES.AtmBLB:
        case MODES.AtmSK: {
          return findMCU(signature, BLHELI_ESCS.signatures.Atmel);
        }

        case MODES.ARMBLB: {
          return findMCU(signature, AM32_ESCS.signatures.Arm);
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
        return BLHELI_EEPROM.SILABS.FLASH_SIZE;
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
