import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import ReactMarkdown from 'react-markdown';

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
  unsupported,
}) {
  const {
    t,
    i18n,
  } = useTranslation(['common', 'groups', 'hints']);

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
  }, [settings, onSettingsUpdate]);

  const handleCheckboxChange = useCallback((e) => {
    const newSettings = { ...availableSettings };
    const {
      name,
      checked,
    } = e.target;
    newSettings[name] = checked ? 1 : 0;
    setSettings(newSettings);
  }, [availableSettings]);

  const handleSelectChange = useCallback((e) => {
    const newSettings = { ...availableSettings };
    const {
      name,
      value,
    } = e.target;
    newSettings[name] = value;
    setSettings(newSettings);
  }, [availableSettings]);

  const handleNumberChange = useCallback((name, value) => {
    const newSettings = { ...availableSettings };

    newSettings[name] = value;
    setSettings(newSettings);
  }, [availableSettings]);

  if (!settingsDescriptions) {
    const version = `${availableSettings.MAIN_REVISION}.${availableSettings.SUB_REVISION}`;

    let unsupportedText = (
      <>
        <p>
          {t('common:versionUnsupportedLine1', {
            version: version,
            name: availableSettings.NAME,
            layout: availableSettings.LAYOUT_REVISION,
          })}
        </p>

        <ReactMarkdown>
          {t('common:versionUnsupportedLine2')}
        </ReactMarkdown>

        <ReactMarkdown>
          {t('common:versionUnsupportedLine3')}
        </ReactMarkdown>
      </>
    );

    if (unsupported) {
      unsupportedText = (
        <p>
          { t('common:useDedicatedConfigurator', { name: availableSettings.NAME }) }
        </p>
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

  const base = settingsDescriptions.base;
  const groups = { '000_general': [] };

  for(let i = 0; i < base.length; i += 1) {
    const item = base[i];

    if (item.group) {
      if(!groups[item.group]) {
        groups[item.group] = [];
      }

      groups[item.group].push(item);
    } else {
      groups['000_general'].push(item);
    }
  }

  const groupedSettingElements = Object.keys(groups).map((group) => {
    const groupItems = groups[group];

    const settingElements = groupItems.map((description) => {
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
      const hint = i18n.exists(`hints:${setting.name}`) ? t(`hints:${setting.name}`) : null;

      // Sanitize a value if it is depended on another value
      let value = availableSettings[setting.name];
      if (description.sanitize) {
        value = description.sanitize(value, availableSettings);
        availableSettings[setting.name] = value;
      }

      let disableValue = description.disableValue || null;

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
              disableValue={disableValue}
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
      <fieldset key={group}>
        <legend>
          {t(`groups:${group}`)}
        </legend>

        { settingElements }
      </fieldset>
    );
  });

  return (
    <div className="gui-box grey">
      <div className="gui-box-titlebar">
        <div className="spacer-box-title">
          {t('commonParameters')}
        </div>
      </div>

      <div className="spacer-box">
        {groupedSettingElements}
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
    settings: PropTypes.shape({ MODE: PropTypes.number }).isRequired,
  })).isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
  unsupported: PropTypes.bool.isRequired,
};

export default React.memo(CommonSettings);
