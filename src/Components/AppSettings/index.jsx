import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';

import Checkbox from '../Input/Checkbox';
import Overlay from '../Overlay';

function AppSettings({
  settings,
  onClose,
  onUpdate,
  open,
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
    <Overlay
      headline={t('settingsHeader')}
      maxWidth='sm'
      onClose={onClose}
      open={open}
    >
      <FormControl
        fullWidth
        variant="standard"
      >
        <Stack
          spacing={1}
        >
          {settingElements}
        </Stack>
      </FormControl>
    </Overlay>
  );
}

AppSettings.propTypes = {
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  settings: PropTypes.shape().isRequired,
};

export default AppSettings;
