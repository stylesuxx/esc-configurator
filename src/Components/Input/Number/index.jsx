import PropTypes from 'prop-types';
import React, {
  useState,
} from 'react';

import Info from '../Info';

import './style.scss';

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
}) {
  const [displayValue, setDisplayValue] = useState(value * factor + offset);

  function updateValue() {
    let value = displayValue;
    value = Math.round((value - offset) / factor);

    if((value + offset) < min) {
      value = (min - offset) / factor;
    }

    if((value + offset) > max) {
      value = (max - offset) / factor;
    }

    value = Math.round(value);
    if(isNaN(value)) {
      value = (min - offset) / factor;
    }

    setDisplayValue(value * factor + offset);
    onChange(name, value);
  }

  function handleChange(e) {
    let value = parseInt(e.target.value, 10);
    setDisplayValue(value);
  }

  return (
    <div className="number-text">
      <label>
        <div className="input-wrapper">
          <input
            max={max}
            min={min}
            name={name}
            onBlur={updateValue}
            onChange={handleChange}
            step={step}
            type="number"
            value={inSync ? displayValue : 0}
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

Number.defaultProps = {
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
