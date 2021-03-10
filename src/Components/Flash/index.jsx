import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation,
} from 'react-i18next';

import Escs from '../Escs';
import CommonSettings from '../CommonSettings';

import './style.css';


/**
 * @param {Object} {escs} Parameters
 *
 * @return {Component} The Component
 */
function Flash({
  availableSettings,
  escs,
  flashProgress,
  canFlash,
  onFlash,
  onSettingsUpdate,
  onIndividualSettingsUpdate,
}) {
  const { t } = useTranslation('common');
  return (
    <div>
      <div className="note">
        <div className="note_spacer">
          <p>
            <span dangerouslySetInnerHTML={{ __html: t('notePropsOff') }} />

            <br />

            <span dangerouslySetInnerHTML={{ __html: t('noteConnectPower') }} />
          </p>
        </div>
      </div>

      <div className="configWrapper">
        <div className="leftWrapper common-config">
          {escs.length > 0 &&
            <CommonSettings
              availableSettings={availableSettings}
              escs={escs}
              onSettingsUpdate={onSettingsUpdate}
            />}
        </div>

        <div className="rightWrapper individual-config">
          <Escs
            canFlash={canFlash}
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
  escs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  flashProgress: PropTypes.arrayOf(PropTypes.number).isRequired,
  onFlash: PropTypes.func.isRequired,
  onIndividualSettingsUpdate: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Flash;
