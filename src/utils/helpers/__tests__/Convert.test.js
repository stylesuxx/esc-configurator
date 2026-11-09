import Convert from '../Convert';
import { source } from '../../../sources/Bluejay';
import { source as am32Source } from '../../../sources/AM32';
import bluejaySettingsArrayObject from './bluejaySettingsArray.json';

const EEPROM = source.getEeprom();
const AM32_EEPROM = am32Source.getEeprom();

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
  const layout = AM32_EEPROM.LAYOUT;
  const layoutSize = AM32_EEPROM.LAYOUT_SIZE;

  /**
   * AM32 2.19+ stores settings in areas our layout does not describe (0x2F) or
   * still describes as the firmware name (0x05 - 0x10). Writing a melody may
   * not change any of them.
   *
   * Values are the AM32 factory defaults, 0x05 being max_ramp = 160 which is a
   * non breaking space and would get eaten by the string round trip.
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
  const layout = AM32_EEPROM.LAYOUT;
  const layoutSize = AM32_EEPROM.LAYOUT_SIZE;
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
