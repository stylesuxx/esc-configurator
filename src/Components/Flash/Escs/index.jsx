import PropTypes from 'prop-types';
import React from 'react';

import Esc from './Esc';

function Escs({
  canFlash,
  directInput,
  disableCommon,
  enableAdvanced,
  escs,
  onCommonSettingsUpdate,
  onFirmwareDump,
  onFlash,
  onSettingsUpdate,
}) {
  function EscElements() {
    return escs.map((esc) => (
      <Esc
        canFlash={canFlash}
        directInput={directInput}
        disableCommon={disableCommon}
        enableAdvanced={enableAdvanced}
        esc={esc}
        index={esc.index}
        key={esc.index}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        ref={esc.ref}
      />
    ));
  }

  return (
    <EscElements />
  );
}

Escs.defaultProps = {
  directInput: false,
  disableCommon: false,
  enableAdvanced: false,
  escs: [],
};

Escs.propTypes = {
  canFlash: PropTypes.bool.isRequired,
  directInput: PropTypes.bool,
  disableCommon: PropTypes.bool,
  enableAdvanced: PropTypes.bool,
  escs: PropTypes.arrayOf(PropTypes.shape()),
  onCommonSettingsUpdate: PropTypes.func.isRequired,
  onFirmwareDump: PropTypes.func.isRequired,
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Escs;
