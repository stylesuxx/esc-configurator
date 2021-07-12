import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';

import SettingsHandler from './SettingsHandler';

import './style.scss';

const Esc = forwardRef(({
  canFlash,
  directInput,
  disableCommon,
  enableAdvanced,
  esc,
  index,
  onCommonSettingsUpdate,
  onFirmwareDump,
  onFlash,
  onSettingsUpdate,
}, ref) => {
  const { t } = useTranslation('common');

  const commonSettings = esc.settings;
  const commonSettingsDescriptions = esc.settingsDescriptions;

  const settings = esc.individualSettings;
  const descriptions = esc.individualSettingsDescriptions;
  const name = esc.displayName ? esc.displayName : 'Unsupported/Unrecognized';
  const title = `ESC ${(index + 1)}: ${name}`;

  const [progress, setProgress] = useState(0);

  useImperativeHandle(ref, () => ({
    setProgress(progress) {
      setProgress(progress);
    },
  }));

  function updateSettings() {
    onSettingsUpdate(index, settings);
  }

  function updateCommonSettings(settings) {
    onCommonSettingsUpdate(index, settings);
  }

  function handleFirmwareFlash() {
    onFlash(index);
  }

  function handleFirmwareDump() {
    onFirmwareDump(index);
  }

  return (
    <div className="esc gui-box grey">
      <div className="gui-box-titlebar">
        <div className="spacer-box-title">
          {title}
        </div>
      </div>

      <div className="spacer-box">
        {disableCommon && commonSettingsDescriptions &&
          <SettingsHandler
            descriptions={commonSettingsDescriptions.base}
            directInput={directInput}
            disabled={!canFlash}
            onUpdate={updateCommonSettings}
            settings={commonSettings}
          />}

        {descriptions &&
          <SettingsHandler
            descriptions={descriptions.base}
            directInput={directInput}
            disabled={!canFlash}
            onUpdate={updateSettings}
            settings={settings}
          />}

        <div className="half">
          <div className="default-btn flash-btn">
            <progress
              className={progress > 0 ? 'progress' : 'hidden'}
              max="100"
              min="0"
              value={progress}
            />

            <button
              disabled={!canFlash}
              onClick={handleFirmwareFlash}
              type="button"
            >
              {t('escButtonFlash')}
            </button>

            {enableAdvanced &&
              <button
                className="firmware-dump"
                disabled={!canFlash}
                onClick={handleFirmwareDump}
                type="button"
              >
                {t('escButtonFirmwareDump')}
              </button>}
          </div>
        </div>
      </div>
    </div>
  );
});
Esc.displayName = 'Esc';
Esc.defaultProps = { canFlash: true };
Esc.propTypes = {
  canFlash: PropTypes.bool,
  directInput: PropTypes.bool.isRequired,
  disableCommon: PropTypes.bool.isRequired,
  enableAdvanced: PropTypes.bool.isRequired,
  esc: PropTypes.shape().isRequired,
  index: PropTypes.number.isRequired,
  onCommonSettingsUpdate: PropTypes.func.isRequired,
  onFirmwareDump: PropTypes.func.isRequired,
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Esc;
