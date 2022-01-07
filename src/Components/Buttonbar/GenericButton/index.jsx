import PropTypes from 'prop-types';
import React from 'react';

import Button from '@mui/material/Button';

function GenericButton({
  className,
  disabled,
  fullWidth,
  onClick,
  sx,
  text,
  variant,
}) {
  return (
    <Button
      className={className}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      sx={sx}
      variant={variant}
    >
      {text}
    </Button>
  );
}

GenericButton.defaultProps = {
  className: null,
  disabled: false,
  fullWidth: false,
  sx: null,
  variant: 'contained',
};
GenericButton.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.shape({}),
  text: PropTypes.string.isRequired,
  variant: PropTypes.string,
};

export default GenericButton;
