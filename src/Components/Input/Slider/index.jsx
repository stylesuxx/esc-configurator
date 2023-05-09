import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useCallback,
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
  disableValue,
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
  const { t } = useTranslation('common');

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
  const updateValue = useCallback((value) => {
    value = Math.floor((value - offset) / factor);
    setCurrentValue(value);
  }, [offset, factor]);

  // Makes no sense to test, component has its own test, we just assume that
  // the slider actually slides.
  /* istanbul ignore next */
  const handleUpdate = useCallback((value) => {
    value = Math.floor((value - offset) / factor);

    // Timout needed for individual settings
    setTimeout(() => {
      onChange(name, value);
    }, 100);
  }, [onChange, offset, factor, name]);

  const format = useCallback((value) => {
    let label = `${value}${suffix}`;

    if (value === disableValue) {
      label = t("disabled");
    }

    return label;
  }, [suffix, disableValue, t]);

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
            value={inSync ? getDisplayValue() : min}
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
  disableValue: null,
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
  disableValue: PropTypes.number,
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
