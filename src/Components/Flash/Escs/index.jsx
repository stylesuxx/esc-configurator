import PropTypes from 'prop-types';
import React from 'react';

import Esc from './Esc';

function Escs({
  canFlash,
  directInput,
  disableCommon,
  escs,
  onCommonSettingsUpdate,
  onFlash,
  onSettingsUpdate,
}) {
  function EscElements() {
    return escs.map((esc) => (
      <Esc
        canFlash={canFlash}
        directInput={directInput}
        disableCommon={disableCommon}
        esc={esc}
        index={esc.index}
        key={esc.index}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
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
  escs: [],
};

Escs.propTypes = {
  canFlash: PropTypes.bool.isRequired,
  directInput: PropTypes.bool,
  disableCommon: PropTypes.bool,
  escs: PropTypes.arrayOf(PropTypes.shape()),
  onCommonSettingsUpdate: PropTypes.func.isRequired,
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Escs;
