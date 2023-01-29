import 'react-toastify/dist/ReactToastify.min.css';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import AppSettings from '../AppSettings';
import CookieConsent from '../CookieConsent';
import LanguageSelection from '../LanguageSelection';
import Log from '../Log';
import MainContent from '../MainContent';
import MelodyEditor from '../../Components/MelodyEditor';
import PortPicker from '../PortPicker';
import Statusbar from '../Statusbar';

import changelogEntries from '../../changelog.json';
import './style.scss';

function App({
  actions,
  appSettings,
  configs,
  escs,
  language,
  melodies,
  msp,
  onAllMotorSpeed,
  onClearLog,
  onCookieAccept,
  onSaveLog,
  onSingleMotorSpeed,
  serial,
  stats,
}) {
  const { t } = useTranslation('common');
  const isIdle = !Object.values(actions).some((element) => element);

  return (
    <div>
      <div className="main">
        <header className="main__header">
          <div className="main__bar">
            <div className="main__logo" />

            <PortPicker
              hasPort={serial.connected}
              hasSerial={serial.hasSerial}
              isIdle={isIdle}
              onChangePort={serial.actions.handleChangePort}
              onConnect={serial.actions.handleConnect}
              onDisconnect={serial.actions.handleDisconnect}
              onSetBaudRate={serial.actions.handleSetBaudRate}
              onSetPort={serial.actions.handleSetPort}
              open={serial.open}
              ports={serial.portNames}
            />

            <div className="main__settings">
              <LanguageSelection
                current={language.current}
                languages={language.available}
                onChange={language.actions.handleChange}
              />

              <div className="button button--dark">
                <button
                  onClick={appSettings.actions.handleOpen}
                  type="button"
                >
                  {t('settings')}
                </button>
              </div>

            </div>
          </div>

          <Log messages={serial.log} />
        </header>

        <MainContent
          actions={actions}
          appSettings={appSettings.settings}
          changelogEntries={changelogEntries}
          configs={configs}
          connected={escs.connected}
          escs={escs.individual}
          flashTargets={escs.targets}
          fourWay={serial.fourWay}
          mspFeatures={msp.features}
          onAllMotorSpeed={onAllMotorSpeed}
          onCancelFirmwareSelection={escs.actions.handleCancelFirmwareSelection}
          onClearLog={onClearLog}
          onCommonSettingsUpdate={escs.actions.handleCommonSettingsUpdate}
          onFirmwareDump={escs.actions.handleFirmwareDump}
          onFlashUrl={escs.actions.handleFlashUrl}
          onIndividualSettingsUpdate={escs.actions.handleIndividualSettingsUpdate}
          onLocalSubmit={escs.actions.handleLocalSubmit}
          onOpenMelodyEditor={melodies.actions.handleOpen}
          onReadEscs={escs.actions.handleReadEscs}
          onResetDefaultls={escs.actions.handleResetDefaultls}
          onSaveLog={onSaveLog}
          onSelectFirmwareForAll={escs.actions.handleSelectFirmwareForAll}
          onSettingsUpdate={escs.actions.handleMasterUpdate}
          onSingleFlash={escs.actions.handleSingleFlash}
          onSingleMotorSpeed={onSingleMotorSpeed}
          onWriteSetup={escs.actions.handleWriteSetup}
          open={serial.open}
          port={serial.port}
          radioOn={msp.radioOn}
          settings={escs.master}
        />

        <Statusbar
          getUtilization={serial.port ? serial.port.getUtilization : undefined}
          packetErrors={stats.packetErrors}
          version={stats.version}
        />
      </div>

      {appSettings.show &&
        <AppSettings
          onClose={appSettings.actions.handleClose}
          onUpdate={appSettings.actions.handleUpdate}
          settings={appSettings.settings}
        />}

      {melodies.show &&
        <MelodyEditor
          customMelodies={melodies.customMelodies}
          defaultMelodies={melodies.defaultMelodies}
          dummy={melodies.dummy}
          melodies={melodies.escs}
          onClose={melodies.actions.handleClose}
          onDelete={melodies.actions.handleDelete}
          onSave={melodies.actions.handleSave}
          onWrite={melodies.actions.handleWrite}
          writing={actions.isWriting}
        />}

      <CookieConsent onCookieAccept={onCookieAccept} />

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
  actions: PropTypes.shape({
    isConnecting: PropTypes.bool.isRequired,
    isFlashing: PropTypes.bool.isRequired,
    isReading: PropTypes.bool.isRequired,
    isWriting: PropTypes.bool.isRequired,
  }).isRequired,
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
  escs: PropTypes.shape({
    actions: PropTypes.shape({
      handleMasterUpdate: PropTypes.func.isRequired,
      handleCommonSettingsUpdate: PropTypes.func.isRequired,
      handleFirmwareDump: PropTypes.func.isRequired,
      handleIndividualSettingsUpdate: PropTypes.func.isRequired,
      handleResetDefaultls: PropTypes.func.isRequired,
      handleReadEscs: PropTypes.func.isRequired,
      handleWriteSetup: PropTypes.func.isRequired,
      handleSingleFlash: PropTypes.func.isRequired,
      handleSelectFirmwareForAll: PropTypes.func.isRequired,
      handleCancelFirmwareSelection: PropTypes.func.isRequired,
      handleLocalSubmit: PropTypes.func.isRequired,
      handleFlashUrl: PropTypes.func.isRequired,
    }),
    connected: PropTypes.number.isRequired,
    individual: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    master: PropTypes.shape({}).isRequired,
    targets: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  language: PropTypes.shape({
    actions: PropTypes.shape({ handleChange: PropTypes.func.isRequired }).isRequired,
    available: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    current: PropTypes.string.isRequired,
  }).isRequired,
  melodies: PropTypes.shape({
    actions: PropTypes.shape({
      handleSave: PropTypes.func.isRequired,
      handleOpen: PropTypes.func.isRequired,
      handleWrite: PropTypes.func.isRequired,
      handleClose: PropTypes.func.isRequired,
      handleDelete: PropTypes.func.isRequired,
    }),
    customMelodies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    defaultMelodies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    dummy: PropTypes.bool.isRequired,
    escs: PropTypes.arrayOf(PropTypes.string).isRequired,
    show: PropTypes.bool.isRequired,
  }).isRequired,
  msp: PropTypes.shape({
    features: PropTypes.shape({}).isRequired,
    radioOn: PropTypes.func.isRequired,
  }).isRequired,
  onAllMotorSpeed: PropTypes.func.isRequired,
  onClearLog: PropTypes.func.isRequired,
  onCookieAccept: PropTypes.func.isRequired,
  onSaveLog: PropTypes.func.isRequired,
  onSingleMotorSpeed: PropTypes.func.isRequired,
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
  stats: PropTypes.shape({
    packetErrors: PropTypes.number.isRequired,
    version: PropTypes.string.isRequired,
  }).isRequired,
};

export default App;
