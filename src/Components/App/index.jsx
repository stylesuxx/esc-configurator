import 'react-toastify/dist/ReactToastify.min.css';
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import AppSettings from '../AppSettings';
import CookieConsent from '../CookieConsent';
import LanguageSelection from '../LanguageSelection';
import Log from '../Log';
import MainContent from '../MainContent';
import MelodyEditor from '../../Components/MelodyEditor';
import PortPicker from '../PortPicker';
import Statusbar from '../Statusbar';

import changelogEntries from '../../changelog.json';

import { show as showAppSettings } from '../AppSettings/settingsSlice';
import { selectShow as selectShowMelodyEditor } from '../MelodyEditor/melodiesSlice';

import './style.scss';

function App({
  actions,
  escs,
  melodies,
  onAllMotorSpeed,
  onCookieAccept,
  onSingleMotorSpeed,
  serial,
}) {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const showMelodyEditor = useSelector(selectShowMelodyEditor);

  const isIdle = !Object.values(actions).some((element) => element);

  const onAppSettingsShow = useCallback((e) => {
    dispatch(showAppSettings());
  }, [dispatch]);

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
              <LanguageSelection />

              <div className="button button--dark">
                <button
                  onClick={onAppSettingsShow}
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
          changelogEntries={changelogEntries}
          connected={escs.connected}
          escs={escs.individual}
          flashTargets={escs.targets}
          fourWay={serial.fourWay}
          onAllMotorSpeed={onAllMotorSpeed}
          onCancelFirmwareSelection={escs.actions.handleCancelFirmwareSelection}
          onCommonSettingsUpdate={escs.actions.handleCommonSettingsUpdate}
          onFirmwareDump={escs.actions.handleFirmwareDump}
          onFlashUrl={escs.actions.handleFlashUrl}
          onIndividualSettingsUpdate={escs.actions.handleIndividualSettingsUpdate}
          onLocalSubmit={escs.actions.handleLocalSubmit}
          onReadEscs={escs.actions.handleReadEscs}
          onResetDefaultls={escs.actions.handleResetDefaultls}
          onSelectFirmwareForAll={escs.actions.handleSelectFirmwareForAll}
          onSettingsUpdate={escs.actions.handleMasterUpdate}
          onSingleFlash={escs.actions.handleSingleFlash}
          onSingleMotorSpeed={onSingleMotorSpeed}
          onWriteSetup={escs.actions.handleWriteSetup}
          open={serial.open}
          port={serial.port}
          settings={escs.master}
        />

        <Statusbar getUtilization={serial.port ? serial.port.getUtilization : undefined} />
      </div>

      <AppSettings />

      {showMelodyEditor &&
        <MelodyEditor
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
  melodies: PropTypes.shape({ actions: PropTypes.shape({ handleWrite: PropTypes.func.isRequired }) }).isRequired,
  onAllMotorSpeed: PropTypes.func.isRequired,
  onCookieAccept: PropTypes.func.isRequired,
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
};

export default App;
