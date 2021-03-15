import PropTypes from 'prop-types';
import React from 'react';

import Info from '../Info';

import './style.scss';

function Checkbox({
  name,
  value,
  label,
  onChange,
  inSync,
  hint,
}) {
  return (
    <div className="checkbox">
      <label>
        <input
          checked={value === 1}
          name={name}
          onChange={onChange}
          type="checkbox"
        />

        <span className={!inSync ? 'not-in-sync' : ''} >
          {label}

          {hint && <Info hint={hint} /> }
        </span>
      </label>
    </div>
  );
}

Checkbox.defaultProps = {
  hint: null,
  inSync: true,
  value: 0,
};

Checkbox.propTypes = {
  hint: PropTypes.string,
  inSync: PropTypes.bool,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
};

export default Checkbox;
