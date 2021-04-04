import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import React, {
  useMemo,
  useRef,
} from 'react';
import PropTypes from 'prop-types';

import 'react-toastify/dist/ReactToastify.min.css';


import PortPicker from '../PortPicker';
import Log from '../Log';
import Statusbar from '../Statusbar';
import CookieConsent from '../CookieConsent';
import MainContent from '../MainContent';
import AppSettings from '../AppSettings';

import { useInterval } from '../../utils/helpers/React';

import changelogEntries from '../../changelog.json';
import './style.scss';

function App({
  actions,
  appSettings,
  configs,
  connected,
  escs,
  flashTargets,
  language,
  languages,
  onAllMotorSpeed,
  onCancelFirmwareSelection,
  onCookieAccept,
  onFlashUrl,
  onIndividualSettingsUpdate,
  onLanguageSelection,
  onLocalSubmit,
  onReadEscs,
  onResetDefaultls,
  onSaveLog,
  onSelectFirmwareForAll,
  onSettingsUpdate,
  onSingleFlash,
  onSingleMotorSpeed,
  onWriteSetup,
  progress,
  serial,
  settings,
  stats,
}) {
  const { t } = useTranslation('common');
  const statusbarRef = useRef();

  /* istanbul ignore next */
  useInterval(async() => {
    if(serial.open && !actions.isReading && !serial.fourWay) {
      if(serial.port.getBatteryState) {
        const batteryState = await serial.port.getBatteryState();
        statusbarRef.current.updateBatteryState(batteryState);
      }
    } else {
      statusbarRef.current.updateBatteryState(null);
    }
  }, 1000);

  /* istanbul ignore next */
  useInterval(async() => {
    if(serial.port && serial.port.getUtilization) {
      const utilization = await serial.port.getUtilization();
      statusbarRef.current.updateUtilization(utilization);
    }
  }, 1000);

  const languageElements = languages.map((item) => (
    <option
      key={item.value}
      value={item.value}
    >
      {item.label}
    </option>
  ));

  const memoizedPortPicker = useMemo(() => (
    <PortPicker
      hasPort={serial.connected}
      hasSerial={serial.hasSerial}
      onChangePort={serial.actions.handleChangePort}
      onConnect={serial.actions.handleConnect}
      onDisconnect={serial.actions.handleDisconnect}
      onSetBaudRate={serial.actions.handleSetBaudRate}
      onSetPort={serial.actions.handleSetPort}
      open={serial.open}
      ports={serial.portNames}
    />
  ), [serial]);

  const memoizedStatusBar = useMemo(() => (
    <Statusbar
      packetErrors={stats.packetErrors}
      ref={statusbarRef}
      version={stats.version}
    />
  ), [stats]);

  return (
    <div className="App">
      <div id="main-wrapper">
        <div className="header-wrapper">
          <div className="headerbar">
            <div id="logo" />

            {memoizedPortPicker}

            <div className="language-select ">
              <div className="dropdown dropdown-dark">
                <select
                  className="dropdown-select"
                  defaultValue={language}
                  onChange={onLanguageSelection}
                >
                  {languageElements}
                </select>
              </div>

              <div className="button-dark">
                <button
                  onClick={appSettings.actions.handleOpen}
                  type="button"
                >
                  {t('settings')}
                </button>
              </div>

            </div>
          </div>

          <div className="clear-both" />

          <Log messages={serial.log} />
        </div>

        <MainContent
          actions={actions}
          appSettings={appSettings.settings}
          changelogEntries={changelogEntries}
          configs={configs}
          connected={connected}
          escs={escs}
          flashTargets={flashTargets}
          fourWay={serial.fourWay}
          onAllMotorSpeed={onAllMotorSpeed}
          onCancelFirmwareSelection={onCancelFirmwareSelection}
          onFlashUrl={onFlashUrl}
          onIndividualSettingsUpdate={onIndividualSettingsUpdate}
          onLocalSubmit={onLocalSubmit}
          onReadEscs={onReadEscs}
          onResetDefaultls={onResetDefaultls}
          onSaveLog={onSaveLog}
          onSelectFirmwareForAll={onSelectFirmwareForAll}
          onSettingsUpdate={onSettingsUpdate}
          onSingleFlash={onSingleFlash}
          onSingleMotorSpeed={onSingleMotorSpeed}
          onWriteSetup={onWriteSetup}
          open={serial.open}
          progress={progress}
          settings={settings}
        />

        {memoizedStatusBar}
      </div>

      <CookieConsent
        onCookieAccept={onCookieAccept}
      />

      {appSettings.show &&
        <AppSettings
          onClose={appSettings.actions.handleClose}
          onUpdate={appSettings.actions.handleUpdate}
          settings={appSettings.settings}
        />}

      <ToastContainer />
    </div>
  );
}

App.defaultProps = {
  serial: {
    port: {
      getBatteryState: null,
      getUtilization: null,
    },
  },
};

App.propTypes = {
  actions: PropTypes.shape({ isReading: PropTypes.bool.isRequired }).isRequired,
  appSettings: PropTypes.shape({
    actions: PropTypes.shape({
      handleClose: PropTypes.func.isRequired,
      handleOpen: PropTypes.func.isRequired,
      handleUpdate: PropTypes.func.isRequired,
    }).isRequired,
    settings: PropTypes.shape({}).isRequired,
    show: PropTypes.bool.isRequired,
  }).isRequired,
  configs: PropTypes.shape({}).isRequired,
  connected: PropTypes.number.isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  flashTargets: PropTypes.arrayOf(PropTypes.number).isRequired,
  language: PropTypes.string.isRequired,
  languages: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onAllMotorSpeed: PropTypes.func.isRequired,
  onCancelFirmwareSelection: PropTypes.func.isRequired,
  onCookieAccept: PropTypes.func.isRequired,
  onFlashUrl: PropTypes.func.isRequired,
  onIndividualSettingsUpdate: PropTypes.func.isRequired,
  onLanguageSelection: PropTypes.func.isRequired,
  onLocalSubmit: PropTypes.func.isRequired,
  onReadEscs: PropTypes.func.isRequired,
  onResetDefaultls: PropTypes.func.isRequired,
  onSaveLog: PropTypes.func.isRequired,
  onSelectFirmwareForAll: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
  onSingleFlash: PropTypes.func.isRequired,
  onSingleMotorSpeed: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
  progress: PropTypes.arrayOf(PropTypes.number).isRequired,
  serial: PropTypes.shape({
    actions: PropTypes.shape({
      handleChangePort: PropTypes.func.isRequired,
      handleConnect: PropTypes.func.isRequired,
      handleDisconnect: PropTypes.func.isRequired,
      handleSetBaudRate: PropTypes.func.isRequired,
      handleSetPort: PropTypes.func.isRequired,
    }).isRequired,
    connected: PropTypes.bool.isRequired,
    fourWay: PropTypes.bool.isRequired,
    hasSerial: PropTypes.bool.isRequired,
    log: PropTypes.arrayOf(PropTypes.any).isRequired,
    open: PropTypes.bool.isRequired,
    port: PropTypes.shape({
      getBatteryState:PropTypes.func,
      getUtilization:PropTypes.func,
    }),
    portNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  settings: PropTypes.shape({}).isRequired,
  stats: PropTypes.shape({
    packetErrors: PropTypes.number.isRequired,
    version: PropTypes.string.isRequired,
  }).isRequired,
};

export default App;
