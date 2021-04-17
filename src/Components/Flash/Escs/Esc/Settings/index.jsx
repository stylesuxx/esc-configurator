import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import Checkbox from '../../../../Input/Checkbox';
import Select from '../../../../Input/Select';
import Slider from '../../../../Input/Slider';
import Number from '../../../../Input/Number';

function Settings({
  descriptions,
  directInput,
  disabled,
  handleCheckboxChange,
  handleNumberChange,
  handleSelectChange,
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

    const value = settings[setting.name];
    const hint = i18n.exists(`hints:${setting.name}`) ? t(`hints:${setting.name}`) : null;

    switch (setting.type) {
      case 'bool': {
        return (
          <Checkbox
            disabled={disabled}
            hint={hint}
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
  directInput: false,
  disabled: false,
};
Settings.propTypes = {
  descriptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  directInput: PropTypes.bool,
  disableld: PropTypes.bool,
  handleCheckboxChange: PropTypes.func.isRequired,
  handleNumberChange: PropTypes.func.isRequired,
  handleSelectChange: PropTypes.func.isRequired,
  settings: PropTypes.PropTypes.shape({}).isRequired,
};

export default Settings;
