import PropTypes from 'prop-types';
import React from 'react';

import Button from '@mui/material/Button';

function GenericButton({
  className,
  disabled,
  onClick,
  text,
}) {
  return (
    <Button
      className={className}
      disabled={disabled}
      onClick={onClick}
      variant="contained"
    >
      {text}
    </Button>
  );
}

GenericButton.defaultProps = {
  className: null,
  disabled: false,
};
GenericButton.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};

export default GenericButton;
