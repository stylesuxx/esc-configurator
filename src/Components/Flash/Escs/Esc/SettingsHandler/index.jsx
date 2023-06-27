import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import Settings from './Settings';

function SettingsHandler({
  descriptions,
  disabled,
  onUpdate,
  settings,
}) {
  const handleCheckboxChange = useCallback((e) => {
    const {
      name, checked,
    } = e.target;
    const newSettings = { ...settings };
    newSettings[name] = checked ? 1 : 0;

    onUpdate(newSettings);
  }, [onUpdate, settings]);

  const handleSelectChange = useCallback((e) => {
    const {
      name, value,
    } = e.target;
    const newSettings = { ...settings };
    newSettings[name] = value;

    onUpdate(newSettings);
  }, [onUpdate, settings]);

  const handleNumberChange = useCallback((name, value) => {
    const newSettings = { ...settings };
    newSettings[name] = value;

    onUpdate(newSettings);
  }, [onUpdate, settings]);

  return (
    <Settings
      descriptions={descriptions}
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
  disabled: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired,
  settings: PropTypes.shape({}).isRequired,
};

export default SettingsHandler;
