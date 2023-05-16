import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import CompatibilityWarning from './CompatibilityWarning';

import './style.scss';
import { useSelector } from 'react-redux';
import {
  selectConnected,
  selectHasSerial,
  selectOpen,
  selectPortNames,
  setBaudRate,
} from '../../Containers/App/serialSlice';
import { useDispatch } from 'react-redux';

function BaudRates({
  handleChange,
  disabled,
}) {
  const { t } = useTranslation('common');
  const baudRates = [115200, 57600, 38400, 28800, 19200, 14400, 9600, 4800, 2400, 1200];

  const rateElements = baudRates.map((rate) => (
    <option
      key={rate}
      value={rate}
    >
      {rate}
    </option>
  ));

  return (
    <select
      className="dropdown__select"
      defaultValue="115200"
      disabled={disabled}
      id="baud"
      name={t('baudRate')}
      onChange={handleChange}
      title={t('baudRate')}
    >
      {rateElements}
    </select>
  );
}
BaudRates.propTypes = {
  disabled: PropTypes.bool.isRequired,
  handleChange: PropTypes.func.isRequired,
};

function PermissionOverlay({
  handleSetPort,
  show,
}) {
  const { t } = useTranslation('common');

  if(!show) {
    return(
      <div id="serial-permission-overlay">
        <button
          onClick={handleSetPort}
          type="button"
        >
          {t('serialPermission')}
        </button>
      </div>
    );
  }

  return null;
}
PermissionOverlay.propTypes = {
  handleSetPort: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

function Ports({
  disabled,
  ports,
  handleChange,
}) {
  const { t } = useTranslation('common');

  const portOptions = ports.map((name, index) => (
    <option
      key={name}
      value={index}
    >
      {name}
    </option>
  ));

  return(
    <select
      className="dropdown__select"
      disabled={disabled}
      id="port"
      name={t('port')}
      onChange={handleChange}
      title={t('port')}
    >
      {portOptions}
    </select>
  );
}
Ports.propTypes = {
  disabled: PropTypes.bool.isRequired,
  handleChange: PropTypes.func.isRequired,
  ports: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

function PortPicker({
  isIdle,
  onSetPort,
  onConnect,
  onDisconnect,
  onChangePort,
}) {
  const { t } = useTranslation('common');

  const dispatch = useDispatch();

  const hasPort = useSelector(selectConnected);
  const hasSerial = useSelector(selectHasSerial);
  const open = useSelector(selectOpen);
  const ports = useSelector(selectPortNames);

  const handleBaudRateChange = useCallback((e) => {
    dispatch(setBaudRate(e.target.value));
  }, [dispatch]);

  const handlePortChange = useCallback((e) => {
    onChangePort(e.target.value);
  }, [onChangePort]);

  if(!hasSerial) {
    return <CompatibilityWarning />;
  }

  return (
    <div className="port-picker">
      <PermissionOverlay
        handleSetPort={onSetPort}
        show={hasPort}
      />

      <div id="portsinput">
        <div
          className={`dropdown dark ${open ? 'disabled' : ''}`}
          disabled={open}
        >
          <Ports
            disabled={open}
            handleChange={handlePortChange}
            ports={ports}
          />
        </div>

        <div
          className={`dropdown dark ${open ? 'disabled' : ''}`}
          disabled={open}
        >
          <BaudRates
            disabled={open}
            handleChange={handleBaudRateChange}
          />
        </div>

        <div className="button button--dark">
          <button
            disabled={open}
            onClick={onSetPort}
            type="button"
          >
            {t('openPortSelection')}
          </button>
        </div>
      </div>

      <div id="connect-button-wrapper">
        <button
          className={`${open ? 'active' : ''}`}
          disabled={!isIdle}
          name="connect"
          onClick={open ? onDisconnect : onConnect}
          type="button"
        >
          <span className="icon connect" />

          <span className="connect-state">
            {open ? t('disconnect') : t('connect')}
          </span>
        </button>
      </div>
    </div>
  );
}
PortPicker.defaultProps = { isIdle: false };
PortPicker.propTypes = {
  isIdle: PropTypes.bool,
  onChangePort: PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func.isRequired,
  onSetPort: PropTypes.func.isRequired,
};

export default React.memo(PortPicker);
