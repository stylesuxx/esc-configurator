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

  it('should throw with unknown signature', () => {
    expect(() => new MCU(MODES.SiLBLB, null)).toThrow();
  });

  it('should return details with BLHeli_S based MCU', () => {
    let mcu = null;
    expect(() => mcu = new MCU(MODES.SiLBLB, 0xE8B2)).not.toThrow();

    const flashSize = mcu.getFlashSize();
    const flashOffset = mcu.getFlashOffset();
    const firmwareStart = mcu.getFirmwareStart();

    expect(flashSize).toEqual(8192);
    expect(flashOffset).toEqual(0);
    expect(firmwareStart).toEqual(0);
  });

  it('should return details with BLHeli based MCU', () => {
    let mcu = null;
    expect(() => mcu = new MCU(MODES.SiLC2, 0x9307)).not.toThrow();

    const flashSize = mcu.getFlashSize();
    const flashOffset = mcu.getFlashOffset();
    const firmwareStart = mcu.getFirmwareStart();

    expect(flashSize).toEqual(8192);
    expect(flashOffset).toEqual(0);
    expect(firmwareStart).toEqual(0);
  });

  it('should return details with AM32 based MCU', () => {
    let mcu = null;
    expect(() => mcu = new MCU(MODES.ARMBLB, 0x1f06)).not.toThrow();

    const flashSize = mcu.getFlashSize();
    const flashOffset = mcu.getFlashOffset();
    const firmwareStart = mcu.getFirmwareStart();

    expect(flashSize).toEqual(65536);
    expect(flashOffset).toEqual(134217728);
    expect(firmwareStart).toEqual(4096);
  });
});
