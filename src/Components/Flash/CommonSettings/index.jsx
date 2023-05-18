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
} from '../../../utils/helpers/Settings';

import { getSource } from '../../../utils/helpers/General';

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
  const source = getSource(master.firmwareName);
  const groupOrder = source ? source.getGroupOrder() : [];
  const settingsDescriptions = source ? source.getCommonSettings(master.layoutRevision) : null;

  const reference = getMasterSettings(escs);
  const allSettings = getAllSettings(escs);

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
    console.log(name, newSettings[name]);
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
            layout: master.layoutRevision,
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

  let { overrides } = settingsDescriptions;
  if (overrides) {
    overrides = overrides[revision];
  }

  const base = settingsDescriptions.base;
  const groups = { 'general': [] };

  for(let i = 0; i < base.length; i += 1) {
    const item = base[i];

    if (item.group) {
      if(!groups[item.group]) {
        groups[item.group] = [];
      }

      groups[item.group].push(item);
    } else {
      groups['general'].push(item);
    }
  }

  // Order available groups by source order. Append unknown groups at the end
  const groupKeys = Object.keys(groups);
  const orderedGroupKeys = groupOrder.filter((group) => groupKeys.includes(group));
  for(let i = 0; i < groupKeys.length; i += 1) {
    const key = groupKeys[i];
    if(!orderedGroupKeys.includes(key)) {
      orderedGroupKeys.push(key);
    }
  }

  // Order items in groups based on their order value
  for( let i = 0; i < orderedGroupKeys.length; i += 1) {
    const group = orderedGroupKeys[i];
    const items = groups[group];

    let orderedItems = items.filter((item) => Object.prototype.hasOwnProperty.call(item, "order"));
    const unorderedItems = items.filter((item) => !Object.prototype.hasOwnProperty.call(item, "order"));
    orderedItems.sort((a, b) => a.order - b.order );

    groups[group] = [...orderedItems, ...unorderedItems];
  }

  const groupedSettingElements = orderedGroupKeys.map((group) => {
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

      /* istanbul ignore next */
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

        /* istanbul ignore next */
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
