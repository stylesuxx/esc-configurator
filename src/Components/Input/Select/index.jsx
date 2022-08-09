import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import Info from '../Info';

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
  const Select = useCallback(() => {
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
  }, [options, disabled, name, onChange, inSync, value, label]);

  return (
    <FormControl
      fullWidth
      variant="standard"
    >
      <Grid
        alignItems="center"
        container
        spacing={2}
      >
        <Grid
          item
          xs={6}
        >
          <FormControl
            fullWidth
            variant="standard"
          >
            <Select />
          </FormControl>
        </Grid>

        <Grid
          item
          xs={6}
        >
          <Typography id={`${name}-select-label`} >
            {label}

            <Info
              hint={hint}
              inSync={inSync}
              name={name}
            />
          </Typography>
        </Grid>
      </Grid>
    </FormControl>
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
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  })).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

export default Select;
