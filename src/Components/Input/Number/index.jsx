import PropTypes from 'prop-types';
import React, {
  useCallback,
  useState,
} from 'react';

import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';

import Info from '../Info';

function Number({
  name,
  value,
  min,
  max,
  label,
  onChange,
  inSync,
  offset,
  factor,
  step,
  hint,
  disabled,
}) {
  const calculated = Math.round(value * factor + offset);
  const [displayValue, setDisplayValue] = useState(calculated);

  const updateValue = useCallback(() => {
    let value = displayValue;
    value = Math.round((value - offset) / factor);

    if((value + offset) < min) {
      value = (min - offset) / factor;
    }

    if((value + offset) > max) {
      value = (max - offset) / factor;
    }

    if(isNaN(value)) {
      value = (min - offset) / factor;
    }

    value = Math.round(value);

    setDisplayValue(value * factor + offset);
    onChange(name, value);
  }, [displayValue, offset, factor, min, max, onChange, name]);

  const handleChange = useCallback((e) => {
    let value = parseInt(e.target.value, 10);
    setDisplayValue(value);
  }, []);

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
          <Input
            disabled={disabled}
            fullWidth
            max={max}
            min={min}
            name={name}
            onBlur={updateValue}
            onChange={handleChange}
            step={step}
            type="number"
            value={inSync ? displayValue : 0}
          />
        </Grid>

        <Grid
          item
          xs={6}
        >
          <Typography id={`${name}-select-label`} >
            <Info
              hint={hint}
              inSync={inSync}
              label={label}
              name={name}
            />
          </Typography>
        </Grid>
      </Grid>
    </FormControl>
  );
}

Number.defaultProps = {
  disabled: false,
  factor: 1,
  hint: null,
  inSync: true,
  max: 255,
  min: 1,
  offset: 0,
  step: 1,
  value: 0,
};

Number.propTypes = {
  disabled: PropTypes.bool,
  factor: PropTypes.number,
  hint: PropTypes.string,
  inSync: PropTypes.bool,
  label: PropTypes.string.isRequired,
  max: PropTypes.number,
  min: PropTypes.number,
  name: PropTypes.string.isRequired,
  offset: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  step: PropTypes.number,
  value: PropTypes.number,
};

export default Number;
