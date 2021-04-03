import PropTypes from 'prop-types';
import React from 'react';

import Info from '../Info';

import './style.scss';

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
  const optionElements = options.map((option) => (
    <option
      key={option.value}
      value={option.value}
    >
      {option.label}
    </option>
  ));

  return (
    <div className="select">
      <label>
        <div className="input-wrapper">
          <select
            disabled={disabled}
            name={name}
            onChange={onChange}
            value={inSync ? value : -1}
          >
            <option
              className="hidden"
              disabled
              value="-1"
            />

            {optionElements}
          </select>
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
