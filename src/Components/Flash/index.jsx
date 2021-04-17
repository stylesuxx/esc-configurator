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
  escCount,
  escs,
  flashProgress,
  onFlash,
  onIndividualSettingsUpdate,
  onSettingsUpdate,
}) {
  return (
    <div className="flash">
      <div className="flash__wrapper">
        <div className="flash__common">
          {escs.length > 0 &&
            <CommonSettings
              availableSettings={availableSettings}
              directInput={directInput}
              disabled={!canFlash}
              escs={escs}
              onSettingsUpdate={onSettingsUpdate}
            />}
        </div>

        <div className="flash__individual">
          <Escs
            canFlash={canFlash}
            directInput={directInput}
            escs={escs}
            flashProgress={flashProgress}
            onFlash={onFlash}
            onSettingsUpdate={onIndividualSettingsUpdate}
          />

          {escCount !== escs.length &&
            <CountWarning />}
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
