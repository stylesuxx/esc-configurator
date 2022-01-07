import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
} from 'react';

import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MuiSlider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

import Info from '../Info';

function Slider({
  name,
  value,
  step,
  min,
  max,
  label,
  suffix,
  onChange,
  inSync,
  offset,
  factor,
  round,
  hint,
  disabled,
}) {
  const [currentValue, setCurrentValue] = useState(value);
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const getDisplayValue = () => {
    let value = factor * currentValue + offset;

    if (round !== null) {
      value = Math.round(value);
    }

    return value;
  };

  /* istanbul ignore next */
  function updateValue(e) {
    const newValue = e.target.value;
    const newValueScaled = Math.floor((newValue - offset) / factor);

    if(currentValue !== newValueScaled) {
      setCurrentValue(newValueScaled);
    }
  }

  /* istanbul ignore next */
  function handleUpdate() {
    onChange(name, currentValue);
  }

  function format(value) {
    return `${value}${suffix}`;
  }

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
          <MuiSlider
            aria-label='xxx'
            aria-labelledby={`${name}-select-label`}
            disabled={disabled}
            formatLabel={format}
            labelSuffix={suffix}
            max={max}
            min={min}
            name={name}
            onChange={updateValue}
            onChangeCommitted={handleUpdate}
            step={step}
            value={inSync ? getDisplayValue() : min}
            valueLabelDisplay="auto"
          />
        </Grid>

        <Grid
          item
          xs={6}
        >
          <Typography id={`${name}-select-label`}>
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

Slider.defaultProps = {
  disabled: false,
  factor: 1,
  hint: null,
  inSync: true,
  max: 100,
  min: 0,
  offset: 0,
  round: null,
  step: 1,
  suffix: '',
  value: 0,
};

Slider.propTypes = {
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
  round: PropTypes.bool,
  step: PropTypes.number,
  suffix: PropTypes.string,
  value: PropTypes.number,
};

export default Slider;
