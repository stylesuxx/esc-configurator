import Convert from '../Convert';
import { source } from '../../../sources/Bluejay';
import bluejaySettingsArrayObject from './bluejaySettingsArray.json';

const EEPROM = source.getEeprom();

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

test('bufferToAscii', () => {
  const ascii = Convert.bufferToAscii([0x0054, 0x0045, 0x0053, 0x0054]);
  expect(ascii).toEqual('TEST');
});

test('asciiToBuffer', () => {
  const buffer = Convert.asciiToBuffer('TEST');
  expect(buffer).toEqual(new Uint8Array([0x0054, 0x0045, 0x0053, 0x0054]));
});
