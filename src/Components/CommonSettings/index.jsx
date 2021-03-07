import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation,
} from 'react-i18next';

import {
  getMaster,
  getAllSettings,
  isMulti,
} from '../../utils/Settings';

import Checkbox from '../Checkbox';
import Select from '../Select';
import Slider from '../Slider';

import './style.css';

/**
 * @param {Object} params
 *
 * @return {Component} The Component
 */
function CommonSettings({
  availableSettings,
  escs,
  onSettingsUpdate,
}) {
  const { t } = useTranslation('common');

  if(escs.length === 0) {
    return null;
  }

  const master = getMaster(escs);
  //const availableSettings = master.settings;
  const allSettings = getAllSettings(escs);
  const allMulti = isMulti(escs);

  const { settingsDescriptions } = master;
  const mainRevision = availableSettings.MAIN_REVISION;
  const subRevision = availableSettings.SUB_REVISION;
  const revision = `${mainRevision}.${subRevision}`;

  const currentSettings = availableSettings;

  function updateSettings() {
    onSettingsUpdate(currentSettings);
  }

  function handleCheckboxChange(e) {
    const {
      name, checked,
    } = e.target;
    currentSettings[name] = checked ? 1 : 0;

    updateSettings();
  }

  function handleSelectChange(e) {
    const {
      name, value,
    } = e.target;
    currentSettings[name] = value;

    updateSettings();
  }

  function handleSliderChange(name, value) {
    currentSettings[name] = value;

    updateSettings();
  }

  if (!settingsDescriptions) {
    const unsupported = `${availableSettings.MAIN_REVISION}.${
      availableSettings.SUB_REVISION}`;
    return (
      <h3>
        Version
        {unsupported}
        is unsupported
      </h3>
    );
  }


  if (!allMulti) {
    return (
      <h3>
        Only MULTI mode currently supported
      </h3>
    );
  }

  let { overrides } = settingsDescriptions;
  if (overrides) {
    overrides = overrides[revision];
  }

  const settingElements = settingsDescriptions.base.map((description) => {
    if (description.visibleIf && !description.visibleIf(availableSettings)) {
      return null;
    }

    const inSync = allSettings.reduce((escA, escB) => {
      if (escA[description.name] === escB[description.name]) {
        return true;
      }

      return -1;
    }) === -1;

    let setting = description;
    if (overrides) {
      setting = overrides.find((override) => override.name === description.name);
    }
    const value = availableSettings[setting.name];

    switch (setting.type) {
      case 'bool': {
        return (
          <Checkbox
            inSync={inSync}
            key={setting.name}
            label={t(setting.label)}
            name={setting.name}
            onChange={handleCheckboxChange}
            value={value}
          />
        );
      }

      case 'enum': {
        const { options } = setting;
        return (
          <Select
            inSync={inSync}
            key={setting.name}
            label={t(setting.label)}
            name={setting.name}
            onChange={handleSelectChange}
            options={options}
            value={value}
          />
        );
      }

      case 'number': {
        return (
          <Slider
            factor={setting.displayFactor}
            inSync={inSync}
            key={setting.name}
            label={t(setting.label)}
            max={setting.max}
            min={setting.min}
            name={setting.name}
            offset={setting.displayOffset}
            onChange={handleSliderChange}
            round={false}
            step={setting.step}
            value={value}
          />
        );
      }

      default: return null;
    }
  });

  return (
    <div className="gui_box grey">
      <div className="gui_box_titlebar">
        <div className="spacer_box_title">
          {t('commonParameters')}
        </div>
      </div>

      <div className="spacer_box">
        {settingElements}
      </div>
    </div>
  );
}

CommonSettings.propTypes = {
  availableSettings: PropTypes.shape().isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default CommonSettings;
