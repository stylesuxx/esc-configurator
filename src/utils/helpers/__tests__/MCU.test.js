import MCU from '../MCU';
import { MODES } from '../../FourWayConstants';

test('should throw with unknown interface mode', () => {
  expect(() => new MCU(null, null)).toThrow();
});

test('should throw with unknown signature', () => {
  expect(() => new MCU(MODES.SiLBLB, null)).toThrow();
});

test('should return details with BLHeli_S based MCU', () => {
  let mcu = null;
  expect(() => mcu = new MCU(MODES.SiLBLB, 0xE8B2)).not.toThrow();

  const flashSize = mcu.getFlashSize();
  const flashOffset = mcu.getFlashOffset();
  const firmwareStart = mcu.getFirmwareStart();

  expect(flashSize).toEqual(8192);
  expect(flashOffset).toEqual(0);
  expect(firmwareStart).toEqual(0);
});

test('should return details with AM32 based MCU', () => {
  let mcu = null;
  expect(() => mcu = new MCU(MODES.ARMBLB, 0x1f06)).not.toThrow();

  const flashSize = mcu.getFlashSize();
  const flashOffset = mcu.getFlashOffset();
  const firmwareStart = mcu.getFirmwareStart();

  expect(flashSize).toEqual(65536);
  expect(flashOffset).toEqual(134217728);
  expect(firmwareStart).toEqual(4096);
});
