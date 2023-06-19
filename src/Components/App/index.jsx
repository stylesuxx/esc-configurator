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
  escs,
  onAllMotorSpeed,
  onMelodyWrite,
  onSingleMotorSpeed,
  serial,
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
              onChangePort={serial.actions.handleChangePort}
              onConnect={serial.actions.handleConnect}
              onDisconnect={serial.actions.handleDisconnect}
              onSetPort={serial.actions.handleSetPort}
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
          onAllMotorSpeed={onAllMotorSpeed}
          onFirmwareDump={escs.actions.handleFirmwareDump}
          onFlashUrl={escs.actions.handleFlashUrl}
          onLocalSubmit={escs.actions.handleLocalSubmit}
          onReadEscs={escs.actions.handleReadEscs}
          onResetDefaultls={escs.actions.handleResetDefaultls}
          onSingleMotorSpeed={onSingleMotorSpeed}
          onWriteSetup={escs.actions.handleWriteSetup}
          port={serial.port}
          progressReferences={escs.progressReferences}
        />

        <Statusbar getUtilization={serial.port ? serial.port.getUtilization : undefined} />
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
  serial: {
    port: {
      getBatteryState: null,
      getUtilization: null,
    },
  },
};

App.propTypes = {
  escs: PropTypes.shape({
    actions: PropTypes.shape({
      handleFirmwareDump: PropTypes.func.isRequired,
      handleResetDefaultls: PropTypes.func.isRequired,
      handleReadEscs: PropTypes.func.isRequired,
      handleWriteSetup: PropTypes.func.isRequired,
      handleLocalSubmit: PropTypes.func.isRequired,
      handleFlashUrl: PropTypes.func.isRequired,
    }),
    progressReferences: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  }).isRequired,
  onAllMotorSpeed: PropTypes.func.isRequired,
  onMelodyWrite: PropTypes.func.isRequired,
  onSingleMotorSpeed: PropTypes.func.isRequired,
  serial: PropTypes.shape({
    actions: PropTypes.shape({
      handleChangePort: PropTypes.func.isRequired,
      handleConnect: PropTypes.func.isRequired,
      handleDisconnect: PropTypes.func.isRequired,
      handleSetPort: PropTypes.func.isRequired,
    }).isRequired,
    port: PropTypes.shape({
      getBatteryState:PropTypes.func,
      getUtilization:PropTypes.func,
    }),
  }),
};

export default App;
