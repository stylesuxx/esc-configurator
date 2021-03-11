import PropTypes from 'prop-types';
import React from 'react';

import Esc from '../Esc';

function Escs({
  escs,
  flashProgress,
  canFlash,
  onFlash,
  onSettingsUpdate,
}) {
  function EscElements() {
    return escs.map((esc, index) => (
      <Esc
        canFlash={canFlash}
        esc={esc}
        index={index}
        key={index}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        progress={flashProgress[index]}
      />
    ));
  }

  return (
    <EscElements />
  );
}

Escs.defaultProps = { escs: [] };

Escs.propTypes = {
  canFlash: PropTypes.bool.isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape()),
  flashProgress: PropTypes.arrayOf(PropTypes.number).isRequired,
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Escs;
