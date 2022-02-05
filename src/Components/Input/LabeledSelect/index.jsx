import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';

function LabeledSelect({
  label,
  firstLabel,
  options,
  selected,
  onChange,
}) {
  const Select = useCallback(() => {
    const optionElements = options.map((item) => (
      <MenuItem
        disabled={item.disabled}
        key={item.key}
        value={item.value}
      >
        {item.name}
      </MenuItem>
    ));

    return (
      <MuiSelect
        id={`${label}-select`}
        label={label}
        labelId={`${label}-select-label`}
        name={label || firstLabel}
        onChange={onChange}
        size="small"
        value={selected || -1}
      >
        <MenuItem
          className="hidden"
          disabled
          value={-1}
        >
          {firstLabel}
        </MenuItem>

        {optionElements}
      </MuiSelect>
    );
  }, [options, label, firstLabel, onChange, selected]);

  return (
    <div className="select">
      <FormControl
        fullWidth
        variant="standard"
      >

        { label &&
          <InputLabel id={`${label}-select-label`}>
            {label}
          </InputLabel>}

        <Select />
      </FormControl>
    </div>
  );
}

LabeledSelect.defaultProps = {
  label: null,
  selected: null,
};

LabeledSelect.propTypes = {
  firstLabel: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    disabled: PropTypes.bool,
    key: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    name: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  })).isRequired,
  selected: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

export default LabeledSelect;
