import { MODES } from '../../FourWayConstants';

let MCU;

describe('MCU', () => {
  beforeAll(async() => {
    /**
     * require component instead of import so that we can properly
     * pre-populate the local storage
     */
    MCU = require('../MCU').default;
  });

  it('should throw with unknown interface mode', () => {
    expect(() => new MCU(null, null)).toThrow();
  });

  it('should throw without signature (Arm)', () => {
    expect(() => new MCU(MODES.ARMBLB)).toThrow();
  });

  it('should throw with unknown signature (Arm)', () => {
    expect(() => new MCU(MODES.ARMBLB, 'asdf')).toThrow();
  });

  it('should throw without signature (SiLabs)', () => {
    expect(() => new MCU(MODES.SiLBLB)).toThrow();
  });

  it('should throw with unknown signature (SiLabs)', () => {
    expect(() => new MCU(MODES.SiLBLB, 'asdf')).toThrow();
  });

  it('should return details with BLHeli_S based MCU (BB2)', () => {
    let mcu = null;
    expect(() => mcu = new MCU(MODES.SiLBLB, 0xE8B2)).not.toThrow();

    const flashSize = mcu.getFlashSize();
    const flashOffset = mcu.getFlashOffset();
    const firmwareStart = mcu.getFirmwareStart();
    const eepromOffset = mcu.getEepromOffset();
    const pageSize = mcu.getPageSize();
    const lockByteAddress = mcu.getLockByteAddress();
    const bootloaderAddress = mcu.getBootloaderAddress();
    const name = mcu.getName();

    expect(flashSize).toEqual(8192);
    expect(flashOffset).toEqual(0);
    expect(firmwareStart).toEqual(0);
    expect(eepromOffset).toEqual(6656);
    expect(pageSize).toEqual(512);
    expect(lockByteAddress).toEqual(64511);
    expect(bootloaderAddress).toEqual(7168);
    expect(name).toEqual("EFM8BB21x");
  });

  it('should return details with BLHeli_S based MCU (BB51)', () => {
    let mcu = null;
    expect(() => mcu = new MCU(MODES.SiLBLB, 0xE8B5)).not.toThrow();

    const flashSize = mcu.getFlashSize();
    const flashOffset = mcu.getFlashOffset();
    const firmwareStart = mcu.getFirmwareStart();
    const eepromOffset = mcu.getEepromOffset();
    const pageSize = mcu.getPageSize();
    const lockByteAddress = mcu.getLockByteAddress();
    const bootloaderAddress = mcu.getBootloaderAddress();
    const name = mcu.getName();

    expect(flashSize).toEqual(63485);
    expect(flashOffset).toEqual(0);
    expect(firmwareStart).toEqual(0);
    expect(eepromOffset).toEqual(12288);
    expect(pageSize).toEqual(2048);
    expect(lockByteAddress).toEqual(63487);
    expect(bootloaderAddress).toEqual(61440);
    expect(name).toEqual("EFM8BB51x");
  });

  it('should return details with BLHeli based MCU', () => {
    let mcu = null;
    expect(() => mcu = new MCU(MODES.SiLC2, 0x9307)).not.toThrow();

    const flashSize = mcu.getFlashSize();
    const flashOffset = mcu.getFlashOffset();
    const firmwareStart = mcu.getFirmwareStart();
    const pageSize = mcu.getPageSize();
    const name = mcu.getName();

    expect(flashSize).toEqual(8192);
    expect(flashOffset).toEqual(0);
    expect(firmwareStart).toEqual(0);
    expect(pageSize).toEqual(32);
    expect(name).toEqual("ATmega8(A)");
  });

  it('should return details with AM32 based MCU (STM32)', () => {
    let mcu = null;
    expect(() => mcu = new MCU(MODES.ARMBLB, 0x1f06)).not.toThrow();

    const flashSize = mcu.getFlashSize();
    const flashOffset = mcu.getFlashOffset();
    const firmwareStart = mcu.getFirmwareStart();
    const eepromOffset = mcu.getEepromOffset();
    const pageSize = mcu.getPageSize();
    const name = mcu.getName();

    expect(flashSize).toEqual(65536);
    expect(flashOffset).toEqual(134217728);
    expect(firmwareStart).toEqual(4096);
    expect(eepromOffset).toEqual(31744);
    expect(pageSize).toEqual(1024);
    expect(name).toEqual("STM32F051");
  });

  it('should return details with AM32 based MCU (ARM64K)', () => {
    let mcu = null;
    expect(() => mcu = new MCU(MODES.ARMBLB, 0x3506)).not.toThrow();

    const flashSize = mcu.getFlashSize();
    const flashOffset = mcu.getFlashOffset();
    const firmwareStart = mcu.getFirmwareStart();
    const eepromOffset = mcu.getEepromOffset();
    const pageSize = mcu.getPageSize();
    const name = mcu.getName();

    expect(flashSize).toEqual(65536);
    expect(flashOffset).toEqual(134217728);
    expect(firmwareStart).toEqual(4096);
    expect(eepromOffset).toEqual(63488);
    expect(pageSize).toEqual(1024);
    expect(name).toEqual("ARM64K");
  });

  it('should throw when fields are not available', () => {
    let mcu = null;
    expect(() => mcu = new MCU(MODES.ARMBLB, 0x3506)).not.toThrow();

    expect(() => mcu.getBootloaderAddress()).toThrow();
    expect(() => mcu.getLockByteAddress()).toThrow();

    mcu.mcu.firmware_start = null;
    expect(() => mcu.getFirmwareStart()).toThrow();
  });
});
