import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import ErrorBoundary from '../../ErrorBoundary';

import './style.scss';

function Info({
  hint,
  inSync,
  label,
  name,
}) {
  return (
    <span className={`info-wrapper-wrapper ${!inSync ? 'not-in-sync' : ''}`} >
      {label}

      {hint &&
        <div className="info-wrapper">
          <span
            className="info-icon"
            data-for={`hint-${name}`}
            data-tip
          >
            ?
          </span>

          <ErrorBoundary>
            <ReactTooltip
              className="tooltip"
              effect="solid"
              id={`hint-${name}`}
            >
              {hint}
            </ReactTooltip>
          </ErrorBoundary>
        </div>}
    </span>
  );
}

Info.defaultProps = { hint: null };

Info.propTypes = {
  hint: PropTypes.string,
  inSync: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default Info;
