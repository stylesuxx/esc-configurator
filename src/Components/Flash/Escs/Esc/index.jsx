import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';

import Settings from './Settings';

import './style.scss';

const Esc = forwardRef(({
  canFlash,
  directInput,
  esc,
  index,
  onFlash,
  onSettingsUpdate,
}, ref) => {
  const { t } = useTranslation('common');

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

  function handleFirmwareFlash() {
    onFlash(index);
  }

  function handleCheckboxChange(e) {
    const {
      name, checked,
    } = e.target;
    settings[name] = checked ? 1 : 0;

    updateSettings();
  }

  function handleSelectChange(e) {
    const {
      name, value,
    } = e.target;
    settings[name] = value;

    updateSettings();
  }

  function handleNumberChange(name, value) {
    settings[name] = value;

    updateSettings();
  }

  return (
    <div className="esc gui-box grey">
      <div className="gui-box-titlebar">
        <div className="spacer-box-title">
          {title}
        </div>
      </div>

      <div className="spacer-box">
        {descriptions &&
          <Settings
            descriptions={descriptions.base}
            directInput={directInput}
            disabled={!canFlash}
            handleCheckboxChange={handleCheckboxChange}
            handleNumberChange={handleNumberChange}
            handleSelectChange={handleSelectChange}
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
  esc: PropTypes.shape().isRequired,
  index: PropTypes.number.isRequired,
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Esc;
