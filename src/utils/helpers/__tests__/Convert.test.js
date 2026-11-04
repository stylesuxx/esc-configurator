import Convert from '../Convert';
import { source } from '../../../sources/Bluejay';
import bluejaySettingsArrayObject from './bluejaySettingsArray.json';

const EEPROM = source.getEeprom();

/**
 * Minimal layout that leaves gaps (e.g. 0x2F) not described by any setting,
 * used to verify that unknown bytes survive a round trip.
 */
const SPARSE_LAYOUT = {
  BOOT_BYTE: {
    offset: 0x00,
    size: 1,
  },
  LAYOUT_REVISION: {
    offset: 0x01,
    size: 1,
  },
  NAME: {
    offset: 0x05,
    size: 12,
  },
  MOTOR_DIRECTION: {
    offset: 0x11,
    size: 1,
  },
  STARTUP_MELODY: {
    offset: 0x30,
    size: 128,
  },
};
const SPARSE_LAYOUT_SIZE = 0xB0;

// Melody missing last byte
const settingsArray = new Uint8Array(Object.values(bluejaySettingsArrayObject));

test('settingsUint8Array', () => {
  const layout = JSON.parse(JSON.stringify(EEPROM.LAYOUT));

  const settingsObject = Convert.arrayToSettingsObject(settingsArray, layout);
  const keys = Object.keys(settingsObject);
  expect(keys.length).toEqual(49);

  layout.MAIN_REVISION.size = 0;
  expect(() => Convert.arrayToSettingsObject(settingsArray, layout)).toThrow();
});

test('settingsArray', () => {
  const layout = JSON.parse(JSON.stringify(EEPROM.LAYOUT));

  const shortArray = settingsArray.subarray(0, settingsArray.length - 2);
  const settingsObject = Convert.arrayToSettingsObject(shortArray, layout);
  const settingsArrayResult = Convert.objectToSettingsArray(settingsObject, layout, EEPROM.LAYOUT_SIZE);
  expect(settingsArrayResult.length).toEqual(255);

  layout.MAIN_REVISION.size = 0;
  expect(() => Convert.objectToSettingsArray(settingsObject, layout, EEPROM.LAYOUT_SIZE)).toThrow();
});

test('settingsArray preserves bytes not covered by the layout', () => {
  const layout = SPARSE_LAYOUT;
  const layoutSize = SPARSE_LAYOUT_SIZE;

  /**
   * Firmware might store settings in areas our layout does not describe (0x2F)
   * or describes as a read only string (0x05 to 0x10). Writing a melody may
   * not change any of them.
   *
   * 0x05 is set to 160, a non breaking space, which would get eaten by the
   * string round trip.
   */
  const current = new Uint8Array(layoutSize).fill(0);
  current.set([160, 1, 0, 10, 100, 0, 100, 0, 255, 255, 255, 255], 0x05);
  current[0x2F] = 1; // auto_advance

  const settingsObject = Convert.arrayToSettingsObject(current, layout);
  const result = Convert.objectToSettingsArray(settingsObject, layout, layoutSize, current);

  expect(Array.from(result.subarray(0x05, 0x11))).toEqual([160, 1, 0, 10, 100, 0, 100, 0, 255, 255, 255, 255]);
  expect(result[0x2F]).toEqual(1);
  expect(result.length).toEqual(layoutSize);
});

test('settingsArray writes the melody while preserving unknown bytes', () => {
  const layout = SPARSE_LAYOUT;
  const layoutSize = SPARSE_LAYOUT_SIZE;
  const melodyOffset = layout.STARTUP_MELODY.offset;

  const current = new Uint8Array(layoutSize).fill(0);
  current[0x2F] = 1;

  const settingsObject = Convert.arrayToSettingsObject(current, layout);
  settingsObject.STARTUP_MELODY = [1, 2, 3, 4];

  const result = Convert.objectToSettingsArray(settingsObject, layout, layoutSize, current);

  expect(Array.from(result.subarray(melodyOffset, melodyOffset + 4))).toEqual([1, 2, 3, 4]);
  expect(result[melodyOffset + 4]).toEqual(0);
  expect(result[0x2F]).toEqual(1);
});

test('bufferToAscii', () => {
  const ascii = Convert.bufferToAscii([0x0054, 0x0045, 0x0053, 0x0054]);
  expect(ascii).toEqual('TEST');
});

test('asciiToBuffer', () => {
  const buffer = Convert.asciiToBuffer('TEST');
  expect(buffer).toEqual(new Uint8Array([0x0054, 0x0045, 0x0053, 0x0054]));
});
