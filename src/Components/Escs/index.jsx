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
  if(escs.length === 0) {
    return null;
  }

  const escElements = escs.map((esc, index) => (
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

  return (
    <div>
      {escElements}
    </div>
  );
}

Escs.propTypes = {
  canFlash: PropTypes.bool.isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  flashProgress: PropTypes.arrayOf(PropTypes.number).isRequired,
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Escs;
