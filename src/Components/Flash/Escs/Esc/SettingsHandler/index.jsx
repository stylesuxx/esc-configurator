import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Settings from './Settings';

function SettingsHandler({
  descriptions,
  directInput,
  disabled,
  onUpdate,
  settings,
}) {
  const handleCheckboxChange = useCallback((e) => {
    const {
      name, checked,
    } = e.target;
    settings[name] = checked ? 1 : 0;

    onUpdate(settings);
  }, [onUpdate, settings]);

  const handleSelectChange = useCallback((e) => {
    const {
      name, value,
    } = e.target;
    settings[name] = value;

    onUpdate(settings);
  }, [onUpdate, settings]);

  const handleNumberChange = useCallback((name, value) => {
    settings[name] = value;

    onUpdate(settings);
  }, [onUpdate, settings]);

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
  descriptions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  directInput: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  settings: PropTypes.shape({}).isRequired,
};
export default SettingsHandler;
