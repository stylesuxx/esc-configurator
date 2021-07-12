import React from 'react';
import PropTypes from 'prop-types';

function LanguageSelection({
  languages,
  current,
  onChange,
}) {
  const languageElements = languages.map((item) => (
    <option
      key={item.value}
      value={item.value}
    >
      {item.label}
    </option>
  ));

  return (
    <div className="dropdown dark">
      <select
        className="dropdown__select"
        defaultValue={current}
        onChange={onChange}
      >
        {languageElements}
      </select>
    </div>
  );
}

LanguageSelection.propTypes = {
  current: PropTypes.string.isRequired,
  languages: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default LanguageSelection;
