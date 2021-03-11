import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation,
} from 'react-i18next';

import {
  getMasterSettings,
  getMaster,
  getAllSettings,
  isMulti,
} from '../../utils/helpers/Settings';

import Checkbox from '../Input/Checkbox';
import Select from '../Input/Select';
import Slider from '../Input/Slider';

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

  const master = getMaster(escs);
  const reference = getMasterSettings(escs);
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

    // Check all settings against
    let inSync = true;
    for(let i = 0; i < allSettings.length; i += 1) {
      const current = allSettings[i];
      if(reference[description.name] !== current[description.name]) {
        inSync = false;
        break;
      }
    }

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
  availableSettings: PropTypes.shape({
    MAIN_REVISION: PropTypes.number.isRequired,
    SUB_REVISION: PropTypes.number.isRequired,
  }).isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default CommonSettings;
