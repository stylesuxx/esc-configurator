import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import CommonSettings from './CommonSettings';
import CountWarning from './CountWarning';
import Escs from './Escs';

import './style.scss';

function Flash({
  availableSettings,
  canFlash,
  directInput,
  disableCommon,
  enableAdvanced,
  escCount,
  escs,
  flashProgress,
  onCommonSettingsUpdate,
  onFirmwareDump,
  onFlash,
  onIndividualSettingsUpdate,
  onSettingsUpdate,
}) {
  const { t } = useTranslation('common');

  return (
    <div className="flash">
      <div className="flash__wrapper">
        <div className="flash__common">
          {escs.length > 0 && !disableCommon &&
            <CommonSettings
              availableSettings={availableSettings}
              directInput={directInput}
              disabled={!canFlash}
              escs={escs}
              onSettingsUpdate={onSettingsUpdate}
            />}

          {disableCommon &&
            <div className="gui-box grey">
              <div className="gui-box-titlebar">
                <div className="spacer-box-title">
                  {t('commonSettingsDisabled')}
                </div>
              </div>

              <div className="spacer-box">
                {t('commonSettingsDisabledText')}
              </div>
            </div>}
        </div>

        <div className="flash__individual">
          <Escs
            canFlash={canFlash}
            directInput={directInput}
            disableCommon={disableCommon}
            enableAdvanced={enableAdvanced}
            escs={escs}
            flashProgress={flashProgress}
            onCommonSettingsUpdate={onCommonSettingsUpdate}
            onFirmwareDump={onFirmwareDump}
            onFlash={onFlash}
            onSettingsUpdate={onIndividualSettingsUpdate}
          />

          {escCount !== escs.length + 1 &&
            <CountWarning />}
        </div>
      </div>
    </div>
  );
}

Flash.defaultProps = {
  canFlash: false,
  directInput: false,
  disableCommon: false,
  enableAdvanced: false,
};

Flash.propTypes = {
  availableSettings: PropTypes.shape().isRequired,
  canFlash: PropTypes.bool,
  directInput: PropTypes.bool,
  disableCommon: PropTypes.bool,
  enableAdvanced: PropTypes.bool,
  escCount: PropTypes.number.isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  flashProgress: PropTypes.arrayOf(PropTypes.number).isRequired,
  onCommonSettingsUpdate: PropTypes.func.isRequired,
  onFirmwareDump: PropTypes.func.isRequired,
  onFlash: PropTypes.func.isRequired,
  onIndividualSettingsUpdate: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Flash;
