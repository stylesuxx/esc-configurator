import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

function LabeledSelect({
  label,
  firstLabel,
  options,
  selected,
  onChange,
}) {
  const Select = useCallback(() => {
    const optionElements = options.map((item) => (
      <option
        disabled={item.disabled}
        key={item.key}
        value={item.value}
      >
        {item.name}
      </option>
    ));

    return (
      <select
        name={label || firstLabel}
        onChange={onChange}
        value={selected || -1}
      >
        <option
          className="hidden"
          disabled
          value={-1}
        >
          {firstLabel}
        </option>

        {optionElements}
      </select>
    );
  }, [options, label, firstLabel, onChange, selected]);

  return (
    <div className="select">
      <label>
        <div className="input-wrapper">
          <Select />
        </div>

        <span className="info-wrapper-wrapper">
          {label}
        </span>
      </label>
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
