import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation,
} from 'react-i18next';

import Checkbox from '../Input/Checkbox';
import Select from '../Input/Select';
import Slider from '../Input/Slider';
import Number from '../Input/Number';

import './style.scss';

function Esc({
  canFlash,
  directInput,
  esc,
  index,
  onFlash,
  onSettingsUpdate,
  progress,
}) {
  const { t } = useTranslation('common');

  const settings = esc.individualSettings;
  const currentSettings = settings;
  const settingsDescriptions = esc.individualSettingsDescriptions;
  const revision = settings ? `${settings.MAIN_REVISION}.${settings.SUB_REVISION}` : 'UNSUPPORTED';

  let make = '';
  if (esc.make) {
    make = `${esc.make}, `;
  }

  let name = settings ? (settings.NAME).trim() : '';
  if (name.length > 0) {
    name = `, ${name}`;
  }

  let bootloader = '';
  if (esc.bootloaderRevision !== null) {
    bootloader = ` (bootloader revision ${esc.bootloaderRevision})`;
  }

  const title = `ESC ${(index + 1)}: ${make} ${revision}${name}${bootloader}`;

  function flashFirmware() {
    onFlash(index);
  }

  function updateSettings() {
    onSettingsUpdate(index, currentSettings);
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

  let settingElements = null;
  if(settingsDescriptions) {
    settingElements = settingsDescriptions.base.map((setting) => {
      if (setting.visibleIf && !setting.visibleIf(settings)) {
        return null;
      }

      const value = settings[setting.name];

      switch (setting.type) {
        case 'bool': {
          return (
            <Checkbox
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
                factor={setting.factor}
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
              factor={setting.factor}
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
  }

  function FlashBox() {
    return(
      <div className="half flash-box">
        <div className="default-btn flash-btn">
          <progress
            className={progress > 0 ? 'progress' : 'hidden'}
            max="100"
            min="0"
            value={progress}
          />

          <button
            className={canFlash ? '' : 'disabled'}
            disabled={!canFlash}
            href="#"
            onClick={flashFirmware}
            type="button"
          >
            {t('escButtonFlash')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gui-box grey">
      <div className="gui-box-titlebar">
        <div className="spacer-box-title">
          {title}
        </div>
      </div>

      <div className="spacer-box">
        {settingElements}

        <FlashBox />
      </div>
    </div>
  );
}

Esc.defaultProps = {
  canFlash: true,
  progress: 0,
};

Esc.propTypes = {
  canFlash: PropTypes.bool,
  directInput: PropTypes.bool.isRequired,
  esc: PropTypes.shape().isRequired,
  index: PropTypes.number.isRequired,
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
  progress: PropTypes.number,
};

export default Esc;
