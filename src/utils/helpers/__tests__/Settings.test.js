import fs from 'fs';
import path from 'path';

import escs from './escs.json';

import bluejaySource from '../../../sources/Bluejay';
const BLUEJAY_EEPROM = bluejaySource.getEeprom();

import am32Source from '../../../sources/AM32';
const AM32_EEPROM = am32Source.getEeprom();

import {
  getMasterSettings,
  getIndividualSettingsDescriptions,
  getIndividualSettings,
  canMigrate,
} from '../Settings';

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
  const settingsDescriptions = BLUEJAY_EEPROM.SETTINGS_DESCRIPTIONS;
  const individualSettingsDescriptions = BLUEJAY_EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
  const result = canMigrate('MOTOR_DIRECTION', escs[0].settings, escs[1].settings, settingsDescriptions, individualSettingsDescriptions);

  expect(result).toBeTruthy();
});

test('can migrate from different platforms', () => {
  const settingsDescriptions = AM32_EEPROM.SETTINGS_DESCRIPTIONS;
  const individualSettingsDescriptions = AM32_EEPROM.INDIVIDUAL_SETTINGS_DESCRIPTIONS;
  const result = canMigrate('MOTOR_DIRECTION', escs[0].settings, escs[1].settings, settingsDescriptions, individualSettingsDescriptions);

  expect(result).not.toBeTruthy();
});
