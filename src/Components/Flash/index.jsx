import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation,
} from 'react-i18next';

import Escs from './Escs';
import CommonSettings from './CommonSettings';

import './style.scss';


/**
 * @param {Object} {escs} Parameters
 *
 * @return {Component} The Component
 */
function Flash({
  availableSettings,
  canFlash,
  directInput,
  escs,
  flashProgress,
  onFlash,
  onIndividualSettingsUpdate,
  onSettingsUpdate,
}) {
  const { t } = useTranslation('common');
  return (
    <div id="flash-content">
      <div className="note">
        <p>
          <span dangerouslySetInnerHTML={{ __html: t('notePropsOff') }} />

          <br />

          <span dangerouslySetInnerHTML={{ __html: t('noteConnectPower') }} />
        </p>
      </div>

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
        </div>
      </div>
    </div>
  );
}

Flash.propTypes = {
  availableSettings: PropTypes.shape().isRequired,
  canFlash: PropTypes.bool.isRequired,
  directInput: PropTypes.bool.isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  flashProgress: PropTypes.arrayOf(PropTypes.number).isRequired,
  onFlash: PropTypes.func.isRequired,
  onIndividualSettingsUpdate: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Flash;
