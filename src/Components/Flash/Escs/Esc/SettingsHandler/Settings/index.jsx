import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Checkbox from '../../../../../Input/Checkbox';
import Select from '../../../../../Input/Select';
import Slider from '../../../../../Input/Slider';
import Number from '../../../../../Input/Number';

import { selectSettingsObject } from '../../../../../AppSettings/settingsSlice';

function Settings({
  descriptions,
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

  const { directInput } = useSelector(selectSettingsObject);

  const settingElements = descriptions.map((setting) => {
    if (setting.visibleIf && !setting.visibleIf(settings)) {
      return null;
    }

    const value = settings[setting.name];
    /* istanbul ignore next */
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
              factor={setting.factor || setting.displayFactor}
              hint={hint}
              key={setting.name}
              label={t(setting.label)}
              max={setting.max}
              min={setting.min}
              name={setting.name}
              offset={setting.offset || setting.displayOffset}
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
            factor={setting.factor || setting.displayFactor}
            hint={hint}
            key={setting.name}
            label={t(setting.label)}
            max={setting.max}
            min={setting.min}
            name={setting.name}
            offset={setting.offset || setting.displayOffset}
            onChange={handleNumberChange}
            round={false}
            step={setting.step}
            suffix={setting.suffix}
            value={value}
          />
        );
      }

      /* istanbul ignore next */
      default: return null;
    }
  });

  return settingElements;
}

Settings.defaultProps = { disabled: false };
Settings.propTypes = {
  descriptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  disableld: PropTypes.bool,
  handleCheckboxChange: PropTypes.func.isRequired,
  handleNumberChange: PropTypes.func.isRequired,
  handleSelectChange: PropTypes.func.isRequired,
  settings: PropTypes.PropTypes.shape({}).isRequired,
};

export default Settings;
