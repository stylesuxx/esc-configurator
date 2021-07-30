import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useEffect,
  useState,
} from 'react';

import {
  getMasterSettings,
  getMaster,
  getAllSettings,
  isMulti,
} from '../../../utils/helpers/Settings';

import Checkbox from '../../Input/Checkbox';
import Select from '../../Input/Select';
import Slider from '../../Input/Slider';
import Number from '../../Input/Number';

import './style.scss';

function CommonSettings({
  availableSettings,
  directInput,
  disabled,
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

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if(settings) {
      onSettingsUpdate(settings);
    }
  }, [settings]);

  function handleCheckboxChange(e) {
    const newSettings = { ...availableSettings };
    const {
      name,
      checked,
    } = e.target;
    newSettings[name] = checked ? 1 : 0;
    setSettings(newSettings);
  }

  function handleSelectChange(e) {
    const newSettings = { ...availableSettings };
    const {
      name,
      value,
    } = e.target;
    newSettings[name] = value;
    setSettings(newSettings);
  }

  function handleNumberChange(name, value) {
    const newSettings = { ...availableSettings };

    newSettings[name] = value;
    setSettings(newSettings);
  }

  if (!settingsDescriptions) {
    const unsupportedNames = ['JESC'];
    const version = `${availableSettings.MAIN_REVISION}.${availableSettings.SUB_REVISION}`;

    let unsupportedText = (
      <p
        dangerouslySetInnerHTML={{
          __html: t('common:versionUnsupported', {
            version: version,
            name: availableSettings.NAME,
            layout: availableSettings.LAYOUT_REVISION,
          }),
        }}
      />
    );

    if (unsupportedNames.includes(availableSettings.NAME)) {
      unsupportedText = (
        <p
          dangerouslySetInnerHTML={{ __html: t('common:useDedicatedConfigurator', { name: availableSettings.NAME }) }}
        />
      );
    }

    return (
      <div className="gui-box grey">
        <div className="gui-box-titlebar">
          <div className="spacer-box-title">
            {t('unsupportedFirmware')}
          </div>
        </div>

        <div className="spacer-box">
          {unsupportedText}
        </div>
      </div>
    );
  }

  if (!allMulti) {
    return (
      <h3>
        {t('multiOnly')}
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

    // Check all settings against each other
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
      const settingOverride = overrides.find((override) => override.name === description.name);
      if(settingOverride) {
        setting = settingOverride;
      }
    }
    const value = availableSettings[setting.name];
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
            disabled={disabled}
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

CommonSettings.defaultProps = {
  directInput: false,
  disabled: false,
};

CommonSettings.propTypes = {
  availableSettings: PropTypes.shape({
    LAYOUT_REVISION: PropTypes.number.isRequired,
    MAIN_REVISION: PropTypes.number.isRequired,
    NAME: PropTypes.string.isRequired,
    SUB_REVISION: PropTypes.number.isRequired,
  }).isRequired,
  directInput: PropTypes.bool,
  disabled: PropTypes.bool,
  escs: PropTypes.arrayOf(PropTypes.shape({
    meta: PropTypes.shape({ available: PropTypes.bool.isRequired }).isRequired,
    settings: PropTypes.shape({ MODE: PropTypes.number.isRequired }).isRequired,
  })).isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default React.memo(CommonSettings);
