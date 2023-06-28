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

import { selectState } from '../../Containers/App/stateSlice';
import { show as showAppSettings } from '../AppSettings/settingsSlice';
import { selectShow as selectShowMelodyEditor } from '../MelodyEditor/melodiesSlice';

import './style.scss';

function App({
  getBatteryState,
  getUtilization,
  onAllMotorSpeed,
  onEscDump,
  onEscsFlashFile,
  onEscsFlashUrl,
  onEscsRead,
  onEscsWriteDefaults,
  onEscsWriteSettings,
  onMelodyWrite,
  onSerialConnect,
  onSerialDisconnect,
  onSerialPortChange,
  onSerialSetPort,
  onSingleMotorSpeed,
  progressReferences,
}) {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const showMelodyEditor = useSelector(selectShowMelodyEditor);
  const actions = useSelector(selectState);

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
              isIdle={isIdle}
              onChangePort={onSerialPortChange}
              onConnect={onSerialConnect}
              onDisconnect={onSerialDisconnect}
              onSetPort={onSerialSetPort}
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

          <Log />
        </header>

        <MainContent
          getBatteryState={getBatteryState}
          onAllMotorSpeed={onAllMotorSpeed}
          onFirmwareDump={onEscDump}
          onFlashUrl={onEscsFlashUrl}
          onLocalSubmit={onEscsFlashFile}
          onReadEscs={onEscsRead}
          onResetDefaultls={onEscsWriteDefaults}
          onSingleMotorSpeed={onSingleMotorSpeed}
          onWriteSetup={onEscsWriteSettings}
          progressReferences={progressReferences}
        />

        <Statusbar getUtilization={getUtilization} />
      </div>

      <AppSettings />

      {showMelodyEditor &&
        <MelodyEditor onWrite={onMelodyWrite} />}

      <CookieConsent />

      <ToastContainer />
    </div>
  );
}

App.defaultProps = {
  getBatteryState: null,
  getUtilization: null,
};

App.propTypes = {
  getBatteryState: PropTypes.func,
  getUtilization: PropTypes.func,
  onAllMotorSpeed: PropTypes.func.isRequired,
  onEscDump: PropTypes.func.isRequired,
  onEscsFlashFile: PropTypes.func.isRequired,
  onEscsFlashUrl: PropTypes.func.isRequired,
  onEscsRead: PropTypes.func.isRequired,
  onEscsWriteDefaults: PropTypes.func.isRequired,
  onEscsWriteSettings: PropTypes.func.isRequired,
  onMelodyWrite: PropTypes.func.isRequired,
  onSerialConnect: PropTypes.func.isRequired,
  onSerialDisconnect: PropTypes.func.isRequired,
  onSerialPortChange: PropTypes.func.isRequired,
  onSerialSetPort: PropTypes.func.isRequired,
  onSingleMotorSpeed: PropTypes.func.isRequired,
  progressReferences: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default App;
