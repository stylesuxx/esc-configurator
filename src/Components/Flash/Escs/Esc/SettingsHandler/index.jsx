import PropTypes from 'prop-types';
import React from 'react';

import Settings from './Settings';

function SettingsHandler({
  descriptions,
  directInput,
  disabled,
  onUpdate,
  settings,
}) {
  function handleCheckboxChange(e) {
    const {
      name, checked,
    } = e.target;
    settings[name] = checked ? 1 : 0;

    onUpdate(settings);
  }

  function handleSelectChange(e) {
    const {
      name, value,
    } = e.target;
    settings[name] = value;

    onUpdate(settings);
  }

  function handleNumberChange(name, value) {
    settings[name] = value;

    onUpdate(settings);
  }

  return (
    <Settings
      descriptions={descriptions}
      directInput={directInput}
      disabled={disabled}
      handleCheckboxChange={handleCheckboxChange}
      handleNumberChange={handleNumberChange}
      handleSelectChange={handleSelectChange}
      settings={settings}
    />
  );
}

SettingsHandler.propTypes = {
  descriptions: PropTypes.arrayOf().isRequired,
  directInput: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  settings: PropTypes.arrayOf().isRequired,
};
export default SettingsHandler;
