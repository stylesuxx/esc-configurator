import Hardware from './Hardware';

const mcus = {
  "1F06": {
    "name": "STM32F051",
    "signature": "0x1f06",
    "page_size": 1024,
    "flash_size": 65536,
    "flash_offset": "0x08000000",
    "firmware_start": "0x1000",
  },
};

class Arm extends Hardware {}
Arm.mcus = mcus;

export default Arm;
