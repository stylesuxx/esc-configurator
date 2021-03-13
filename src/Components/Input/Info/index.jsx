import PropTypes from 'prop-types';
import React from 'react';

import './style.scss';

function Info({ hint }) {
  return (
    <div className="info-wrapper">
      <span className="info-icon">
        ?
      </span>

      <div className="info-text">
        {hint}
      </div>
    </div>
  );
}

Info.propTypes = { hint: PropTypes.string.isRequired };

export default Info;
