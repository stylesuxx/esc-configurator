import PropTypes from 'prop-types';
import React from 'react';

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
          defaultValue={inSync ? value : -1}
          name={name}
          onChange={onChange}
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

Select.defaultProps = { inSync: true };

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
  options: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
};

export default Select;
