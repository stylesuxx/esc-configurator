import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Checkbox from '../Input/Checkbox';
import Overlay from '../Overlay';

import './style.scss';

function AppSettings({
  settings,
  onClose,
  onUpdate,
}) {
  const { t } = useTranslation('settings');

  const handleCheckboxChange = useCallback((e) => {
    const name = e.target.name;
    const value = e.target.checked;

    onUpdate(name, value);
  }, [onUpdate]);

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
      }

      default: {
        return null;
      }
    }
  });

  return (
    <div className="settings">
      <Overlay
        headline={t('settingsHeader')}
        onClose={onClose}
      >
        <div>
          {settingElements}
        </div>
      </Overlay>
    </div>
  );
}

AppSettings.propTypes = {
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  settings: PropTypes.shape().isRequired,
};

export default AppSettings;
