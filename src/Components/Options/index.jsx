import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation, 
} from 'react-i18next';

function Options({
  improveChecked, onChange, 
}) {
  const { t } = useTranslation('common');

  function handleChange(e) {
    onChange(e.target.name, e.target.checked);
  }

  return (
    <div className="statistics">
      <label>
        <input
          name="tracking"
          onChange={handleChange}
          type="checkbox"
          typedefaultChecked={improveChecked}
        />

        <span>
          {t('optionsImproveConfigurator')}
        </span>

      </label>
    </div>
  );
}

Options.propTypes = {
  improveChecked: PropTypes.bool.isRequired,
  onChange: PropTypes.bool.isRequired,
};

export default Options;
