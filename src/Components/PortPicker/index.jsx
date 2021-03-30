import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation,
} from 'react-i18next';
import './style.scss';

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

  const portOptions = ports.map((name, index) => (
    <option
      key={name}
      value={index}
    >
      {name}
    </option>
  ));

  const rates = [115200, 57600, 38400, 28800, 19200, 14400, 9600, 4800, 2400, 1200];
  const rateElements = rates.map((rate) => (
    <option
      key={rate}
      value={rate}
    >
      {rate}
    </option>
  ));

  function changeBaudRate(e) {
    onSetBaudRate(e.target.value);
  }

  function changePort(e) {
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
    <div id="port-picker">
      { !hasPort &&
        <div id="serial-permission-overlay">
          <button
            onClick={onSetPort}
            type="button"
          >
            {t('serialPermission')}
          </button>
        </div>}

      <div id="portsinput">
        <div
          className={`dropdown dropdown-dark ${open ? 'disabled' : ''}`}
          disabled={open}
        >
          <select
            className="dropdown-select"
            disabled={open}
            id="port"
            name={t('port')}
            onChange={changePort}
            title={t('port')}
          >
            {portOptions}
          </select>
        </div>

        <div
          className={`dropdown dropdown-dark ${open ? 'disabled' : ''}`}
          disabled={open}
        >
          <select
            className="dropdown-select"
            defaultValue="115200"
            disabled={open}
            id="baud"
            name={t('baudRate')}
            onChange={changeBaudRate}
            title={t('baudRate')}
          >
            {rateElements}
          </select>
        </div>

        <div className="button-dark">
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

export default PortPicker;
