import Hardware from './Hardware';

const mcus = {
  "E8B1": {
    "name": "EFM8BB10x",
    "signature": "0xE8B1",
    "page_size": 512,
    "flash_size": 8192,
    "bootloader_address": "0x1C00",
    "eeprom_offset": "0x1A00",
  },
  "E8B2": {
    "name": "EFM8BB21x",
    "signature": "0xE8B2",
    "page_size": 512,
    "flash_size": 8192,
    "bootloader_address": "0x1C00",
    "eeprom_offset": "0x1A00",
  },
  "E8B5": {
    "name": "EFM8BB51x",
    "signature": "0xE8B5",
    "page_size": 2048,
    "flash_size": 63485,
    "bootloader_address": "0xF000",
    "eeprom_offset": "0x3000",
  },
};

class Silabs extends Hardware {}
Silabs.mcus = mcus;

export default Silabs;
