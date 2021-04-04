import PropTypes from 'prop-types';
import React from 'react';

function LabeledSelect({
  label,
  firstLabel,
  options,
  selected,
  onChange,
}) {
  const optionElements = options.map((item) => (
    <option
      key={item.key}
      value={item.value}
    >
      {item.name}
    </option>
  ));

  return (
    <div className="select">
      <label>
        <div className="input-wrapper">
          <select
            name={label}
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
        </div>

        <span className="info-wrapper-wrapper">
          {label}
        </span>
      </label>
    </div>
  );
}

LabeledSelect.defaultProps = {
  label: "",
  selected: null,
};

LabeledSelect.propTypes = {
  firstLabel: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
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
  selected: PropTypes.string,
};

export default LabeledSelect;
