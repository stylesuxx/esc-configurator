import PropTypes from 'prop-types';
import React from 'react';

function Checkbox({
  name, value, label, onChange, inSync, 
}) {
  return (
    <div className="checkbox">
      <label>
        <input
          defaultChecked={value === 1}
          name={name}
          onChange={onChange}
          type="checkbox"
        />

        <span className={!inSync ? 'not-in-sync' : ''} >
          {label}
        </span>
      </label>
    </div>
  );
}

Checkbox.defaultProps = { inSync: true };

Checkbox.propTypes = {
  inSync: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired,
};

export default Checkbox;
