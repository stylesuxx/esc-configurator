import Hardware from './Hardware';

const mcus = {
  "1F06": {
    "name": "STM32F051",
    "signature": "0x1f06",
    "page_size": 1024,
    "flash_size": 65536,
    "flash_offset": "0x08000000",
    "firmware_start": "0x1000",
    "eeprom_offset": "0x7c00",
  },
  "3506": {
    "name": "ARM64K",
    "signature": "0x3506",
    "page_size": 1024,
    "flash_size": 65536,
    "flash_offset": "0x08000000",
    "firmware_start": "0x1000",
    "eeprom_offset": "0xF800",
  },
};

class Arm extends Hardware {}
Arm.mcus = mcus;

export default Arm;
