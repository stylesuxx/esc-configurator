import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';

import SettingsHandler from './SettingsHandler';

import './style.scss';
import { getSource } from '../../../../utils/helpers/General';

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

  const source = getSource(esc.firmwareName);
  const commonSettingsDescriptions = source ? source.getCommonSettings(esc.layoutRevision) : null;
  const descriptions = source ? source.getIndividualSettings(esc.layoutRevision) : null;

  const commonSettings = esc.settings;
  const settings = esc.individualSettings;

  const name = esc.displayName ? esc.displayName : 'Unsupported/Unrecognized';
  const title = `ESC ${(index + 1)}: ${name}`;

  const [progress, setProgress] = useState(0);

  useImperativeHandle(ref, () => ({
    setProgress(progress) {
      setProgress(progress);
    },
  }));

  const updateSettings = useCallback(() => {
    onSettingsUpdate(index, settings);
  }, [onSettingsUpdate, index, settings]);

  const updateCommonSettings = useCallback((settings) => {
    onCommonSettingsUpdate(index, settings);
  }, [onCommonSettingsUpdate, index]);

  const handleFirmwareFlash = useCallback(() => {
    onFlash(index);
  }, [onFlash, index]);

  const handleFirmwareDump = useCallback(() => {
    onFirmwareDump(index);
  }, [onFirmwareDump, index]);

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

            {progress === 100 &&
              <div className="progress-text">
                {t('resettingDevice')}
              </div>}

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
