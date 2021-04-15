import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import './style.scss';

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
  hasPort,
  hasSerial,
  open,
  onSetPort,
  onSetBaudRate,
  onConnect,
  onDisconnect,
  ports,
  onChangePort,
}) {
  const { t } = useTranslation('common');

  function handleBaudRateChange(e) {
    onSetBaudRate(e.target.value);
  }

  function handlePortChange(e) {
    onChangePort(e.target.value);
  }

  if(!hasSerial) {
    return (
      <div id="not-supported">
        <b>
          Web Serial
        </b>

        {' '}
        is not supported on your browser. Make sure you&apos;re running an up to date Chromium based browser like

        {' '}

        <a
          href="https://www.google.com/intl/de/chrome/"
          rel="noreferrer"
          target="_blank"
        >
          Chrome
        </a>

        {', '}

        <a
          href="https://vivaldi.com/download/"
          rel="noreferrer"
          target="_blank"
        >
          Vivaldi
        </a>

        {', '}

        <a
          href="https://www.microsoft.com/edge/"
          rel="noreferrer"
          target="_blank"
        >
          Edge
        </a>

        {' '}

        or any other

        {' '}

        <a
          href="https://caniuse.com/mdn-api_serial"
          rel="noreferrer"
          target="_blank"
        >
          compatible browser.
        </a>
      </div>
    );
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
PortPicker.defaultProps = {
  hasPort: false,
  hasSerial: false,
  open: false,
  ports: [],
};
PortPicker.propTypes = {
  hasPort: PropTypes.bool,
  hasSerial: PropTypes.bool,
  onChangePort: PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func.isRequired,
  onSetBaudRate: PropTypes.func.isRequired,
  onSetPort: PropTypes.func.isRequired,
  open: PropTypes.bool,
  ports: PropTypes.arrayOf(PropTypes.string),
};

export default React.memo(PortPicker);
