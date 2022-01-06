import PropTypes from 'prop-types';
import React from 'react';

import FormControlLabel from '@mui/material/FormControlLabel';
import MuiCheckbox from '@mui/material/Checkbox';

import Info from '../Info';

function Checkbox({
  name,
  value,
  label,
  disabled,
  onChange,
  inSync,
  hint,
}) {
  const formattedLabel = (
    <Info
      hint={hint}
      inSync={inSync}
      label={label}
      name={name}
    />
  );

  return (
    <div className="checkbox">
      <FormControlLabel
        control={
          <MuiCheckbox
            checked={value === 1}
            disabled={disabled}
            name={name}
            onChange={onChange}
          />
        }
        label={formattedLabel}
      />
    </div>
  );
}

Checkbox.defaultProps = {
  disabled: false,
  hint: null,
  inSync: true,
  value: 0,
};

Checkbox.propTypes = {
  disabled: PropTypes.bool,
  hint: PropTypes.string,
  inSync: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
};

export default Checkbox;
