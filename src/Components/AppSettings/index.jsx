import PropTypes from 'prop-types';
import React from 'react';

import Checkbox from '../Input/Checkbox';

import {
  useTranslation,
} from 'react-i18next';
import './style.scss';

function AppSettings({
  settings,
  onClose,
  onUpdate,
}) {
  const { t } = useTranslation('settings');

  function handleClose() {
    onClose();
  }

  function handleChildClick(e) {
    e.stopPropagation();
  }

  function handleCheckboxChange(e) {
    const name = e.target.name;
    const value = e.target.checked;

    onUpdate(name, value);
  }

  const settingKeys = Object.keys(settings);
  const settingElements = settingKeys.map((key) => {
    const setting = settings[key];

    switch(setting.type) {
      case 'boolean': {
        return (
          <Checkbox
            hint={t(`${key}Hint`)}
            key={key}
            label={t(key)}
            name={key}
            onChange={handleCheckboxChange}
            value={setting.value ? 1 : 0}
          />
        );
      } break;
    }
  });

  return (
    <div
      id="app-settings"
      onClick={handleClose}
    >
      <div
        className="settings-wrapper"
        onClick={handleChildClick}
      >
        <div
          className="close"
          onClick={handleClose}
        >
          {t('closeText')}
        </div>

        <h3>
          {t('settingsHeader')}
        </h3>

        <div>
          {settingElements}
        </div>
      </div>
    </div>
  );
}

AppSettings.propTypes = {
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  settings: PropTypes.shape().isRequired,
};

export default AppSettings;
