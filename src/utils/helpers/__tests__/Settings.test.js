import {
  getMasterSettings,
  getIndividualSettingsDescriptions,
  getIndividualSettings,
  canMigrate,
} from '../Settings';

import escs from './escs.json';
import { source as bluejaySource } from '../../../sources/Bluejay';
import am32Source from '../../../sources/AM32';

const AM32_SETTINGS_DESCRIPTIONS = am32Source.getSettingsDescriptions();
const BLUEJAY_SETTINGS_DESCRIPTIONS = bluejaySource.getSettingsDescriptions();

test('get master settings object', () => {
  const settings = getMasterSettings(escs);
  const keys = Object.keys(settings);

  expect(settings).not.toEqual({});
  expect(keys.length).toEqual(43);
});

test('get master settings object for empty array', () => {
  const settings = getMasterSettings([]);

  expect(settings).toEqual({});
});

test('get individual setting descriptions', () => {
  const settings = getIndividualSettingsDescriptions(escs[0]);

  expect(settings).not.toEqual([]);
  expect(settings.length).toEqual(6);
});

test('get individual setting descriptions with empty object', () => {
  const settings = getIndividualSettingsDescriptions({});

  expect(settings).toEqual([]);
});

test('get individual settings', () => {
  const settings = getIndividualSettings(escs[0]);
  const keys = Object.keys(settings);

  expect(settings).not.toEqual({});
  expect(keys.length).toEqual(6);
});

test('get individual settings with empty object', () => {
  const settings = getIndividualSettings({});

  expect(settings).toEqual({});
});

test('can migrate empty settings', () => {
  const result = canMigrate('INVALID', {}, {}, {}, {});

  expect(result).not.toBeTruthy();
});

test('can migrate wrong modes', () => {
  const result = canMigrate('INVALID', { MODE: 1 }, { MODE: 2 }, {}, {});

  expect(result).not.toBeTruthy();
});

test('can migrate invalid setting', () => {
  const individualSettingsDescriptions = escs[1].individualSettingsDescriptions;
  const settingsDescriptions = escs[1].settingsDescriptions;
  const result = canMigrate('INVALID', escs[0], escs[1], settingsDescriptions, individualSettingsDescriptions);

  expect(result).not.toBeTruthy();
});

test('can migrate valid setting', () => {
  const settingsDescriptions = BLUEJAY_SETTINGS_DESCRIPTIONS.COMMON;
  const individualSettingsDescriptions = BLUEJAY_SETTINGS_DESCRIPTIONS.INDIVIDUAL;
  const result = canMigrate('MOTOR_DIRECTION', escs[0].settings, escs[1].settings, settingsDescriptions, individualSettingsDescriptions);

  expect(result).toBeTruthy();
});

test('can migrate from different platforms', () => {
  const settingsDescriptions = AM32_SETTINGS_DESCRIPTIONS.COMMON;
  const individualSettingsDescriptions = AM32_SETTINGS_DESCRIPTIONS.INDIVIDUAL;
  const result = canMigrate('MOTOR_DIRECTION', escs[0].settings, escs[1].settings, settingsDescriptions, individualSettingsDescriptions);

  expect(result).not.toBeTruthy();
});

test('no multi valid', () => {
  const settingsDescriptions = {
    1: {
      base: [
        { name: 'MOTOR_DIRECTION' },
      ],
    },
    2: {
      base: [
        { name: 'MOTOR_DIRECTION' },
      ],
    },
  };

  const individualSettingsDescriptions = {
    1: {},
    2: {},
  };

  const from = {
    MODE: 1,
    LAYOUT_REVISION: 1,
  };

  const to = {
    MODE: 1,
    LAYOUT_REVISION: 2,
  };

  const result = canMigrate('MOTOR_DIRECTION', from, to, settingsDescriptions, individualSettingsDescriptions);
  expect(result).toBeTruthy();
});

test('no multi invalid', () => {
  const settingsDescriptions = {
    1: {
      base: [
        { name: 'MOTOR_DIRECTION' },
      ],
    },
    2: {},
  };

  const individualSettingsDescriptions = {
    1: {},
    2: {},
  };

  const from = {
    MODE: 1,
    LAYOUT_REVISION: 1,
  };

  const to = {
    MODE: 1,
    LAYOUT_REVISION: 2,
  };

  const result = canMigrate('MOTOR_DIRECTION', from, to, settingsDescriptions, individualSettingsDescriptions);
  expect(result).toBeFalsy();
});

test('individual settings valid', () => {
  const settingsDescriptions = {
    1: { base: [] },
    2: { base: [] },
  };

  const individualSettingsDescriptions = {
    1: {
      base: [
        { name: 'MOTOR_DIRECTION' },
      ],
    },
    2: {
      base: [
        { name: 'MOTOR_DIRECTION' },
      ],
    },
  };
  const from = {
    MODE: 1,
    LAYOUT_REVISION: 1,
  };

  const to = {
    MODE: 1,
    LAYOUT_REVISION: 2,
  };

  const result = canMigrate('MOTOR_DIRECTION', from, to, settingsDescriptions, individualSettingsDescriptions);
  expect(result).toBeTruthy();
});

test('individual settings invalid', () => {
  const settingsDescriptions = {
    1: { base: [] },
    2: { base: [] },
  };

  const individualSettingsDescriptions = {
    1: {
      base: [
        { name: 'MOTOR_DIRECTION' },
      ],
    },
    2: { base: [] },
  };
  const from = {
    MODE: 1,
    LAYOUT_REVISION: 1,
  };

  const to = {
    MODE: 1,
    LAYOUT_REVISION: 2,
  };

  const result = canMigrate('MOTOR_DIRECTION', from, to, settingsDescriptions, individualSettingsDescriptions);
  expect(result).toBeFalsy();
});
