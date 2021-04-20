import PropTypes from 'prop-types';
import React from 'react';

import './style.scss';

function GenericButton({
  disabled,
  onClick,
  text,
}) {
  return (
    <div className="generic-button">
      <button
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {text}
      </button>
    </div>
  );
}
GenericButton.defaultProps = { disabled: false };
GenericButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default GenericButton;
