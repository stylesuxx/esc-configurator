import PropTypes from 'prop-types';
import React from 'react';

import './style.scss';

function Select({
  name,
  value,
  label,
  options,
  onChange,
  inSync,
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
        <select
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

        <span className={!inSync ? 'not-in-sync' : ''}>
          {label}
        </span>
      </label>
    </div>
  );
}

Select.defaultProps = {
  inSync: true,
  value: -1,
};

Select.propTypes = {
  inSync: PropTypes.bool,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  name: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
};

export default Select;
