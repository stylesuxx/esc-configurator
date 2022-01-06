import PropTypes from 'prop-types';
import React from 'react';

import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';

//import Info from '../Info';

//import './style.scss';

function Select({
  name,
  value,
  disabled,
  label,
  options,
  onChange,
  inSync,
  hint,
}) {
  function Select() {
    const optionElements = options.map((option) => (
      <MenuItem
        key={option.value}
        value={option.value}
      >
        {option.label}
      </MenuItem>
    ));

    return (
      <MuiSelect
        disabled={disabled}
        id={`${name}-select`}
        label={label}
        labelId={`${name}-select-label`}
        name={name}
        onChange={onChange}
        size="small"
        value={inSync ? value : -1}
      >
        <MenuItem
          className="hidden"
          disabled
          value="-1"
        />

        {optionElements}
      </MuiSelect>
    );
  }

  return (
    <div className="select">
      <FormControl
        fullWidth
        variant="standard"
      >
        <InputLabel id={`${name}-select-label`}>
          {label}
        </InputLabel>

        <Select />

        <FormHelperText>
          {hint}
        </FormHelperText>
      </FormControl>
    </div>
  );
}

Select.defaultProps = {
  disabled: false,
  hint: null,
  inSync: true,
  value: -1,
};

Select.propTypes = {
  disabled: PropTypes.bool,
  hint: PropTypes.string,
  inSync: PropTypes.bool,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  name: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

export default Select;
