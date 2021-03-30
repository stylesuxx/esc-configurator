import PropTypes from 'prop-types';
import React from 'react';

import Esc from './Esc';

function Escs({
  canFlash,
  directInput,
  escs,
  flashProgress,
  onFlash,
  onSettingsUpdate,
}) {
  function EscElements() {
    return escs.map((esc) => (
      <Esc
        canFlash={canFlash}
        directInput={directInput}
        esc={esc}
        index={esc.index}
        key={esc.index}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        progress={flashProgress[esc.index]}
      />
    ));
  }

  return (
    <EscElements />
  );
}

Escs.defaultProps = {
  directInput: false,
  escs: [],
  flashProgress: [],
};

Escs.propTypes = {
  canFlash: PropTypes.bool.isRequired,
  directInput: PropTypes.bool,
  escs: PropTypes.arrayOf(PropTypes.shape()),
  flashProgress: PropTypes.arrayOf(PropTypes.number),
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Escs;
