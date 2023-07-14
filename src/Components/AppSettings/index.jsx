import React, {
  useCallback,
  useMemo,
} from 'react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { useTranslation } from 'react-i18next';

import Checkbox from '../Input/Checkbox';
import Overlay from '../Overlay';

import {
  hide,
  selectSettings,
  selectShow,
  update,
} from './settingsSlice';

import './style.scss';

function AppSettings() {
  const { t } = useTranslation('settings');
  const dispatch = useDispatch();

  const settings = useSelector(selectSettings);
  const show = useSelector(selectShow);

  const handleCheckboxChange = useCallback((e) => {
    const name = e.target.name;
    const value = e.target.checked;

    dispatch(update({
      name,
      value,
    }));
  }, [dispatch]);

  const onClose = useCallback((e) => {
    dispatch(hide());
  }, [dispatch]);

  const memoizedSettings = useMemo(() => {
    const settingKeys = Object.keys(settings);
    return settingKeys.map((key) => {
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
          console.debug(`Setting type "${setting.type}" is not supported`);
          return false;
        }
      }
    });
  }, [handleCheckboxChange, settings, t]);

  if(!show) {
    return false;
  }

  return (
    <div className="settings">
      <Overlay
        headline={t('settingsHeader')}
        onClose={onClose}
      >
        <div>
          {memoizedSettings}
        </div>
      </Overlay>
    </div>
  );
}

export default AppSettings;
