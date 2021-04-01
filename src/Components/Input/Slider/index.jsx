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
  function updateValue(value) {
    value = Math.floor((value - offset) / factor);
    setCurrentValue(value);
  }

  // Makes no sense to test, component has its own test, we just assume that
  // the slider actually slides.
  /* istanbul ignore next */
  function handleUpdate(value) {
    value = Math.floor((value - offset) / factor);

    // Timout needed for individual settings
    setTimeout(() => {
      onChange(name, value);
    }, 100);
  }

  function format(value) {
    return `${value}${suffix}`;
  }

  return (
    <div className="number">
      <label>
        <div className="input-wrapper">
          <InputRange
            disabled={disabled}
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
        </div>

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
