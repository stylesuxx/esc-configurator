import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import CommonSettings from './CommonSettings';
import Escs from './Escs';

import './style.scss';

function Flash({
  availableSettings,
  canFlash,
  directInput,
  escCount,
  escs,
  flashProgress,
  onFlash,
  onIndividualSettingsUpdate,
  onSettingsUpdate,
}) {
  const { t } = useTranslation('common');

  function CountWarning() {
    if(escCount !== escs.length) {
      return (
        <div className="gui-box grey missing-esc">
          <div className="gui-box-titlebar">
            <div className="spacer-box-title">
              {t('escMissingHeader')}
            </div>
          </div>

          <div className="spacer-box">
            <p>
              {t('escMissingText')}
            </p>

            <ul>
              <li
                dangerouslySetInnerHTML={{ __html: t('escMissing1') }}
              />

              <li
                dangerouslySetInnerHTML={{ __html: t('escMissing2') }}
              />

              <li
                dangerouslySetInnerHTML={{ __html: t('escMissing3') }}
              />
            </ul>

            <p
              dangerouslySetInnerHTML={{ __html: t('escMissingHint') }}
            />
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div id="flash-content">
      <div className="config-wrapper">
        <div className="common-config">
          {escs.length > 0 &&
            <CommonSettings
              availableSettings={availableSettings}
              directInput={directInput}
              disabled={!canFlash}
              escs={escs}
              onSettingsUpdate={onSettingsUpdate}
            />}
        </div>

        <div className="individual-config">
          <Escs
            canFlash={canFlash}
            directInput={directInput}
            escs={escs}
            flashProgress={flashProgress}
            onFlash={onFlash}
            onSettingsUpdate={onIndividualSettingsUpdate}
          />

          <CountWarning />
        </div>
      </div>
    </div>
  );
}

Flash.defaultProps = {
  canFlash: false,
  directInput: false,
};

Flash.propTypes = {
  availableSettings: PropTypes.shape().isRequired,
  canFlash: PropTypes.bool,
  directInput: PropTypes.bool,
  escCount: PropTypes.number.isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  flashProgress: PropTypes.arrayOf(PropTypes.number).isRequired,
  onFlash: PropTypes.func.isRequired,
  onIndividualSettingsUpdate: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Flash;
