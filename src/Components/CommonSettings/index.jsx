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
import Number from '../Input/Number';

import './style.scss';

function CommonSettings({
  availableSettings,
  directInput,
  escs,
  onSettingsUpdate,
}) {
  const {
    t,
    i18n,
  } = useTranslation(['common', 'hints']);

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

  function handleNumberChange(name, value) {
    currentSettings[name] = value;

    updateSettings();
  }

  if (!settingsDescriptions) {
    console.log(availableSettings);
    const unsupported = `${availableSettings.MAIN_REVISION}.${availableSettings.SUB_REVISION}`;

    return (
      <h3
        dangerouslySetInnerHTML={{
          __html: t('common:versionUnsupported', {
            version: unsupported,
            name: availableSettings.NAME,
            layout: availableSettings.LAYOUT_REVISION,
          })
        }}
      />
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
    const hint = i18n.exists(`hints:${setting.name}`) ? t(`hints:${setting.name}`) : null;

    switch (setting.type) {
      case 'bool': {
        return (
          <Checkbox
            hint={hint}
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
            hint={hint}
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
        if(directInput) {
          return (
            <Number
              factor={setting.displayFactor}
              hint={hint}
              inSync={inSync}
              key={setting.name}
              label={t(setting.label)}
              max={setting.max}
              min={setting.min}
              name={setting.name}
              offset={setting.displayOffset}
              onChange={handleNumberChange}
              round={false}
              step={setting.step}
              value={value}
            />
          );
        }

        return (
          <Slider
            factor={setting.displayFactor}
            hint={hint}
            inSync={inSync}
            key={setting.name}
            label={t(setting.label)}
            max={setting.max}
            min={setting.min}
            name={setting.name}
            offset={setting.displayOffset}
            onChange={handleNumberChange}
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
    <div className="gui-box grey">
      <div className="gui-box-titlebar">
        <div className="spacer-box-title">
          {t('commonParameters')}
        </div>
      </div>

      <div className="spacer-box">
        {settingElements}
      </div>
    </div>
  );
}

CommonSettings.propTypes = {
  availableSettings: PropTypes.shape({
    LAYOUT_REVISION: PropTypes.number.isRequired,
    MAIN_REVISION: PropTypes.number.isRequired,
    NAME: PropTypes.string.isRequired,
    SUB_REVISION: PropTypes.number.isRequired,
  }).isRequired,
  directInput: PropTypes.bool.isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default CommonSettings;
