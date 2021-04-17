import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import Checkbox from '../../../../Input/Checkbox';
import Select from '../../../../Input/Select';
import Slider from '../../../../Input/Slider';
import Number from '../../../../Input/Number';

function Settings({
  allSettings,
  descriptions,
  directInput,
  disabled,
  handleCheckboxChange,
  handleNumberChange,
  handleSelectChange,
  overrides,
  reference,
  settings,
}) {
  const {
    t,
    i18n,
  } = useTranslation(['common', 'hints']);

  const settingElements = descriptions.map((setting) => {
    if (setting.visibleIf && !setting.visibleIf(settings)) {
      return null;
    }

    // Check all settings against each other
    let inSync = true;
    if(reference) {
      for(let i = 0; i < allSettings.length; i += 1) {
        const current = allSettings[i];
        if(reference[setting.name] !== current[setting.name]) {
          inSync = false;
          break;
        }
      }
    }

    if (overrides) {
      const settingOverride = overrides.find((override) => override.name === setting.name);
      if(settingOverride) {
        setting = settingOverride;
      }
    }

    const value = settings[setting.name];
    const hint = i18n.exists(`hints:${setting.name}`) ? t(`hints:${setting.name}`) : null;

    switch (setting.type) {
      case 'bool': {
        return (
          <Checkbox
            disabled={disabled}
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
            disabled={disabled}
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
              disabled={disabled}
              factor={setting.factor}
              hint={hint}
              inSync={inSync}
              key={setting.name}
              label={t(setting.label)}
              max={setting.max}
              min={setting.min}
              name={setting.name}
              offset={setting.offset}
              onChange={handleNumberChange}
              round={false}
              step={1}
              value={value}
            />
          );
        }

        return (
          <Slider
            disabled={disabled}
            factor={setting.factor}
            hint={hint}
            inSync={inSync}
            key={setting.name}
            label={t(setting.label)}
            max={setting.max}
            min={setting.min}
            name={setting.name}
            offset={setting.offset}
            onChange={handleNumberChange}
            round={false}
            step={setting.step}
            suffix={setting.suffix}
            value={value}
          />
        );
      }

      default: return null;
    }
  });

  return settingElements;
}
Settings.defaultProps = {
  allsettings: [],
  directInput: false,
  disabled: false,
  overrides: [],
  reference: null,
};
Settings.propTypes = {
  allSettings: PropTypes.arrayOf(PropTypes.shape({})),
  descriptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  directInput: PropTypes.bool,
  disableld: PropTypes.bool,
  handleCheckboxChange: PropTypes.func.isRequired,
  handleNumberChange: PropTypes.func.isRequired,
  handleSelectChange: PropTypes.func.isRequired,
  overrides: PropTypes.PropTypes.shape({}),
  reference: PropTypes.PropTypes.shape({}),
  settings: PropTypes.PropTypes.shape({}).isRequired,
};

export default Settings;
