import PropTypes from 'prop-types';
import React from 'react';

import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MuiCheckbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

import Info from '../Info';

function Checkbox({
  name,
  value,
  label,
  disabled,
  onChange,
  inSync,
  hint,
  help,
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
            size="small"
            sx={{
              paddingTop: 0,
              paddingBottom: 0,
            }}
          />
        }
        label={formattedLabel}
      />

      { help &&
        <FormHelperText>
          {help}
        </FormHelperText>}
    </div>
  );
}

Checkbox.defaultProps = {
  disabled: false,
  help: null,
  hint: null,
  inSync: true,
  value: 0,
};

Checkbox.propTypes = {
  disabled: PropTypes.bool,
  help: PropTypes.string,
  hint: PropTypes.string,
  inSync: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
};

export default Checkbox;
