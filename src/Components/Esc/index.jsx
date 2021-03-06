import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation,
} from 'react-i18next';

import Checkbox from '../Checkbox';
import Select from '../Select';
import Slider from '../Slider';

import './style.css';

function Esc({
  index,
  esc,
  canFlash,
  progress,
  onSettingsUpdate,
  onFlash,
}) {
  const { t } = useTranslation('common');

  const settings = esc.settings;
  const currentSettings = settings;
  const settingsDescriptions = esc.individualSettingsDescriptions;
  let name = (settings.NAME).trim();
  const revision = `${settings.MAIN_REVISION}.${settings.SUB_REVISION}`;

  let make = '';
  if (esc.make) {
    make = `${esc.make}, `;
  }

  if (name.length > 0) {
    name = `, ${name}`;
  }

  let bootloader = '';
  if (esc.bootloaderRevision !== null) {
    bootloader = ` (bootloader verseion ${esc.bootloaderRevision})`;
  }

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

  function handleSliderChange(name, value) {
    currentSettings[name] = value;

    updateSettings();
  }

  const rows = settingsDescriptions.base.map((setting) => {
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
        return (
          <Slider
            factor={setting.factor}
            key={setting.name}
            label={t(setting.label)}
            max={setting.max}
            min={setting.min}
            name={setting.name}
            offset={setting.offset}
            onChange={handleSliderChange}
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

  const title = `ESC ${(index + 1)}: ${make} ${revision}${name}${bootloader}`;

  function FlashBox() {
    return(
      <div className="half">
        <div className="default_btn half flash_btn">
          <progress
            className={progress > 0 ? 'progress' : 'hidden'}
            max="100"
            min="0"
            value={progress}
          />

          <a
            className={canFlash ? '' : 'disabled'}
            href="#"
            onClick={flashFirmware}
          >
            {t('escButtonFlash')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="gui_box grey">
      <div className="gui_box_titlebar">
        <div className="spacer_box_title">
          {title}
        </div>
      </div>

      <div className="spacer_box">
        {rows}

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
  esc: PropTypes.shape().isRequired,
  index: PropTypes.number.isRequired,
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
  progress: PropTypes.number,
};

export default Esc;
