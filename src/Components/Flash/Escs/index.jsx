import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectIndividual } from '../../../Containers/App/escsSlice';

import Esc from './Esc';

function Escs({
  onFirmwareDump,
  progressReferences,
}) {
  const escs = useSelector(selectIndividual);

  function EscElements() {
    return escs.map((esc) => (
      <Esc
        esc={esc}
        index={esc.index}
        key={esc.index}
        onFirmwareDump={onFirmwareDump}
        ref={progressReferences[esc.index]}
      />
    ));
  }

  return (
    <EscElements />
  );
}

Escs.propTypes = {
  onFirmwareDump: PropTypes.func.isRequired,
  progressReferences: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default Escs;
