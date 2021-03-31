import Convert from '../Convert';
import {
  EEPROM
} from '../../../sources/Bluejay';

const settingsArray = new Uint8Array(Object.values({
  "0":0,
  "1":11,
  "2":201,
  "3":255,
  "4":51,
  "5":1,
  "6":1,
  "7":25,
  "8":255,
  "9":9,
  "10":96,
  "11":1,
  "12":255,
  "13":85,
  "14":170,
  "15":255,
  "16":255,
  "17":255,
  "18":255,
  "19":255,
  "20":255,
  "21":4,
  "22":255,
  "23":255,
  "24":255,
  "25":255,
  "26":255,
  "27":40,
  "28":80,
  "29":4,
  "30":255,
  "31":2,
  "32":255,
  "33":255,
  "34":255,
  "35":7,
  "36":255,
  "37":255,
  "38":255,
  "39":0,
  "40":0,
  "41":255,
  "42":255,
  "43":255,
  "44":255,
  "45":255,
  "46":255,
  "47":255,
  "48":255,
  "49":255,
  "50":255,
  "51":255,
  "52":255,
  "53":255,
  "54":255,
  "55":255,
  "56":255,
  "57":255,
  "58":255,
  "59":255,
  "60":255,
  "61":255,
  "62":255,
  "63":255,
  "64":35,
  "65":83,
  "66":95,
  "67":72,
  "68":95,
  "69":53,
  "70":48,
  "71":35,
  "72":32,
  "73":32,
  "74":32,
  "75":32,
  "76":32,
  "77":32,
  "78":32,
  "79":32,
  "80":35,
  "81":66,
  "82":76,
  "83":72,
  "84":69,
  "85":76,
  "86":73,
  "87":36,
  "88":69,
  "89":70,
  "90":77,
  "91":56,
  "92":66,
  "93":50,
  "94":49,
  "95":35,
  "96":66,
  "97":108,
  "98":117,
  "99":101,
  "100":106,
  "101":97,
  "102":121,
  "103":32,
  "104":40,
  "105":66,
  "106":69,
  "107":84,
  "108":65,
  "109":41,
  "110":32,
  "111":32
}));

test('modeToString', () => {
  expect(Convert.modeToString(0x55AA)).toEqual('MULTI');
});

test('settingsUint8Array', () => {
  const layout = JSON.parse(JSON.stringify(EEPROM.LAYOUT));

  const settingsObject = Convert.settingsObject(settingsArray, layout);
  const keys = Object.keys(settingsObject);
  expect(keys.length).toEqual(43);

  layout.MAIN_REVISION.size = 0;
  expect(() => Convert.settingsObject(settingsArray, layout)).toThrow();
});

test('settingsArray', () => {
  const layout = JSON.parse(JSON.stringify(EEPROM.LAYOUT));

  const settingsObject = Convert.settingsObject(settingsArray, layout);
  const settingsArrayResult = Convert.settingsArray(settingsObject, layout, EEPROM.LAYOUT_SIZE);
  expect(settingsArrayResult.length).toEqual(112);

  layout.MAIN_REVISION.size = 0;
  expect(() => Convert.settingsArray(settingsObject, layout, EEPROM.LAYOUT_SIZE)).toThrow();
});
