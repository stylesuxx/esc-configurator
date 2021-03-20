import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
} from 'react';
import InputRange from 'react-input-range';

import Info from '../Info';

import 'react-input-range/lib/css/index.css';
import './style.scss';

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

  function updateValue(value) {
    value = Math.floor((value - offset) / factor);
    setCurrentValue(value);
  }

  function handleUpdate(value) {
    value = Math.floor((value - offset) / factor);
    onChange(name, value);
  }

  function format(value) {
    return `${value}${suffix}`;
  }

  return (
    <div className="number">
      <label>
        <InputRange
          formatLabel={format}
          labelSuffix={suffix}
          maxValue={max}
          minValue={min}
          name={name}
          onChange={updateValue}
          onChangeComplete={handleUpdate}
          step={step}
          value={inSync ? getDisplayValue() : 0}
        />

        <Info
          hint={hint}
          inSync={inSync}
          label={label}
          name={name}
        />
      </label>
    </div>
  );
}

Slider.defaultProps = {
  factor: 1,
  hint: null,
  inSync: true,
  max: 100,
  min: 0,
  offset: 0,
  suffix: '',
  value: 0,
};

Slider.propTypes = {
  factor: PropTypes.number,
  hint: PropTypes.string,
  inSync: PropTypes.bool,
  label: PropTypes.string.isRequired,
  max: PropTypes.number,
  min: PropTypes.number,
  name: PropTypes.string.isRequired,
  offset: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  round: PropTypes.bool.isRequired,
  step: PropTypes.number.isRequired,
  suffix: PropTypes.string,
  value: PropTypes.number,
};

export default Slider;
