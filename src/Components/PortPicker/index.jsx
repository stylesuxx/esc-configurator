import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation,
} from 'react-i18next';
import './list-style.css';
import './style.scss';

function PortPicker({
  hasPort,
  open,
  onSetPort,
  onSetBaudRate,
  onConnect,
  onDisconnect,
}) {
  const { t } = useTranslation('common');

  /*
  // TODO: The web Serial API also supports multiple ports - each one had to be
  //       given permission to use, but once allowed we could list all allowed
  //       ports here.
  const portOptions = ports.map((item, index) => {
    const info = item.getInfo();
    console.log(info);
    return (
      <option key={index}>xx</option>
    );
  });
  */

  const rates = [115200, 57600, 38400, 28800, 19200, 14400, 9600, 4800, 2400, 1200];
  const rateElements = rates.map((rate) => (
    <option
      key={rate}
      value={rate}
    >
      {rate}
    </option>
  ));

  function ConnectionButton() {
    if (open) {
      return (
        <>
          <div className="connect_b">
            <a
              className="connect active"
              href="#"
              onClick={onDisconnect}
            />
          </div>

          <a className="connect-state">
            {t('disconnect')}
          </a>
        </>
      );
    }

    return (
      <>
        <div className="connect_b">
          <a
            className="connect"
            href="#"
            onClick={onConnect}
          />
        </div>

        <a className="connect-state">
          {t('connect')}
        </a>
      </>
    );
  }

  function changeBaudRate(e) {
    onSetBaudRate(e.target.value);
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
        {/*
        <div className="dropdown dropdown-dark">
          <select
            className="dropdown-select"
            id="port"
            title={t('port')}
          >
            {portOptions}
          </select>
        </div>
        */}

        <div className="dropdown dropdown-dark">
          <select
            className="dropdown-select"
            defaultValue="115200"
            id="baud"
            onChange={changeBaudRate}
            title={t('baudRate')}
          >
            {rateElements}
          </select>
        </div>
      </div>

      <div
        className="connect_controls"
        id="connect-button-wrapper"
      >
        <ConnectionButton />
      </div>
    </div>
  );
}

PortPicker.propTypes = {
  hasPort: PropTypes.bool.isRequired,
  onConnect: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func.isRequired,
  onSetBaudRate: PropTypes.func.isRequired,
  onSetPort: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default PortPicker;
