import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

import Home from '../Home';
import Flash from '../Flash';
import Buttonbar from '../Buttonbar';
import FirmwareSelector from '../FirmwareSelector';
import Changelog from '../../Components/Changelog';
import MotorControl from '../../Components/MotorControl';

import './style.scss';

function WarningWrapper() {
  const { t } = useTranslation('common');

  return (
    <div className="note">
      <p>
        <span>
          <strong>
            {t('note')}
          </strong>
        </span>

        <ReactMarkdown components={{ p: 'span' }}>
          {t('notePropsOff')}
        </ReactMarkdown>

        <br />

        <span>
          <strong>
            {t('note')}
          </strong>

          {t('noteConnectPower')}
        </span>
      </p>
    </div>
  );
}

function MainContent({
  appSettings,
  open,
  escs,
  settings,
  progress,
  mspFeatures,
  onIndividualSettingsUpdate,
  onCancelFirmwareSelection,
  onClearLog,
  onCommonSettingsUpdate,
  onOpenMelodyEditor,
  onSelectFirmwareForAll,
  onSettingsUpdate,
  onReadEscs,
  onResetDefaultls,
  onSingleFlash,
  onWriteSetup,
  onFirmwareDump,
  onFlashUrl,
  onSaveLog,
  configs,
  flashTargets,
  onLocalSubmit,
  changelogEntries,
  actions,
  onAllMotorSpeed,
  onSingleMotorSpeed,
  connected,
  fourWay,
  port,
}) {
  const { t } = useTranslation('common');
  const {
    isSelecting,
    isFlashing,
    isReading,
    isWriting,
  } = actions;

  const unsupportedNames = ['JESC', 'BLHeli_M', 'BLHeli_32'];
  const unsupported = unsupportedNames.includes(settings.NAME);

  const canWrite = (escs.length > 0) && !isSelecting && settings && !isFlashing && !isReading && !isWriting && !unsupported;
  const canFlash = (escs.length > 0) && !isSelecting && !isWriting && !isFlashing && !isReading;
  const canRead = !isReading && !isWriting && !isSelecting && !isFlashing;
  const showMelodyEditor = escs.length > 0 && escs[0].individualSettings.STARTUP_MELODY ? true : false;

  const FlashWrapper = useCallback(() => {
    if(fourWay) {

      return (
        <Flash
          availableSettings={settings}
          canFlash={canFlash}
          directInput={appSettings.directInput.value}
          disableCommon={appSettings.disableCommon.value}
          enableAdvanced={appSettings.enableAdvanced.value}
          escCount={connected}
          escs={escs}
          flashProgress={progress}
          onCommonSettingsUpdate={onCommonSettingsUpdate}
          onFirmwareDump={onFirmwareDump}
          onFlash={onSingleFlash}
          onIndividualSettingsUpdate={onIndividualSettingsUpdate}
          onSettingsUpdate={onSettingsUpdate}
          unsupported={unsupported}
        />
      );
    }

    return null;
  }, [
    fourWay,
    settings,
    canFlash,
    appSettings,
    connected,
    escs,
    progress,
    onCommonSettingsUpdate,
    onFirmwareDump,
    onSingleFlash,
    onIndividualSettingsUpdate,
    onSettingsUpdate,
    unsupported,
  ]);

  const MotorControlWrapper = useCallback(() => {
    if(!fourWay && !actions.isReading) {
      return (
        <MotorControl
          getBatteryState={port.getBatteryState}
          motorCount={connected}
          onAllUpdate={onAllMotorSpeed}
          onSingleUpdate={onSingleMotorSpeed}
          startValue={mspFeatures['3D'] ? 1500 : 1000}
        />
      );
    }

    return null;
  }, [
    fourWay,
    actions.isReading,
    port.getBatteryState,
    connected,
    onAllMotorSpeed,
    onSingleMotorSpeed,
    mspFeatures,
  ]);

  if (!open) {
    return (
      <>
        <Home
          onOpenMelodyEditor={onOpenMelodyEditor}
        />

        <Changelog entries={changelogEntries} />
      </>
    );
  }

  if (isSelecting) {
    const targetIndex = flashTargets[0];
    const esc = escs.find((esc) => esc.index === targetIndex);
    let warning = null;
    if(esc && esc.actualMake) {
      warning = (
        <>
          <ReactMarkdown>
            {t('mistaggedLine1')}
          </ReactMarkdown>

          <ReactMarkdown>
            {t('mistaggedLine2')}
          </ReactMarkdown>

          <table>
            <tr>
              <td>
                {t('mistaggedTagged')}
              </td>

              <td>
                {esc.make}
              </td>
            </tr>

            <tr>
              <td>
                {t('mistaggedDetected')}
              </td>

              <td>
                {esc.actualMake}
              </td>
            </tr>
          </table>

          <ReactMarkdown>
            {t('mistaggedLine3')}
          </ReactMarkdown>

          <ReactMarkdown>
            {t('mistaggedLine4')}
          </ReactMarkdown>
        </>
      );
    }

    return (
      <div id="content">
        <div className="tab toolbar_fixed_bottom">
          <div className="content_wrapper">
            <FirmwareSelector
              configs={configs}
              esc={esc}
              onCancel={onCancelFirmwareSelection}
              onLocalSubmit={onLocalSubmit}
              onSubmit={onFlashUrl}
              showUnstable={appSettings.unstableVersions.value}
              warning={warning}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="content">
        <div className="tab toolbar_fixed_bottom">
          <div className="content_wrapper">
            <WarningWrapper />

            <FlashWrapper />

            <MotorControlWrapper />
          </div>
        </div>
      </div>

      <Buttonbar
        canFlash={canFlash}
        canRead={canRead}
        canResetDefaults={canWrite}
        canWrite={canWrite}
        onClearLog={onClearLog}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadSetup={onReadEscs}
        onResetDefaults={onResetDefaultls}
        onSaveLog={onSaveLog}
        onSeletFirmwareForAll={onSelectFirmwareForAll}
        onWriteSetup={onWriteSetup}
        showMelodyEditor={showMelodyEditor}
      />
    </>
  );
}

MainContent.defaultProps = {
  appSettings: {
    directInput: { value: false },
    disableCommon: { value: false },
    enableAdvanced: { value: false },
    unstableVersions: { value: false },
  },
  changelogEntries: [],
  connected: 0,
  escs: [],
  flashTargets: [],
  fourWay: false,
  mspFeatures: { '3D': false },
  open: false,
  port: { getBatteryState: null },
  progress: [],
  settings: {},
};

MainContent.propTypes = {
  actions: PropTypes.shape({
    isFlashing: PropTypes.bool.isRequired,
    isReading: PropTypes.bool.isRequired,
    isSelecting: PropTypes.bool.isRequired,
    isWriting: PropTypes.bool.isRequired,
  }).isRequired,
  appSettings: PropTypes.shape({
    directInput: PropTypes.shape(),
    disableCommon: PropTypes.shape(),
    enableAdvanced: PropTypes.shape(),
    unstableVersions: PropTypes.shape(),
  }),
  changelogEntries: PropTypes.arrayOf(PropTypes.shape()),
  configs: PropTypes.shape({
    escs: PropTypes.shape().isRequired,
    pwm: PropTypes.shape().isRequired,
    versions: PropTypes.shape().isRequired,
  }).isRequired,
  connected: PropTypes.number,
  escs: PropTypes.arrayOf(PropTypes.shape()),
  flashTargets: PropTypes.arrayOf(PropTypes.number),
  fourWay: PropTypes.bool,
  mspFeatures: PropTypes.shape({ '3D': PropTypes.bool }),
  onAllMotorSpeed: PropTypes.func.isRequired,
  onCancelFirmwareSelection: PropTypes.func.isRequired,
  onClearLog: PropTypes.func.isRequired,
  onCommonSettingsUpdate: PropTypes.func.isRequired,
  onFirmwareDump: PropTypes.func.isRequired,
  onFlashUrl: PropTypes.func.isRequired,
  onIndividualSettingsUpdate: PropTypes.func.isRequired,
  onLocalSubmit: PropTypes.func.isRequired,
  onOpenMelodyEditor: PropTypes.func.isRequired,
  onReadEscs: PropTypes.func.isRequired,
  onResetDefaultls: PropTypes.func.isRequired,
  onSaveLog: PropTypes.func.isRequired,
  onSelectFirmwareForAll: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
  onSingleFlash: PropTypes.func.isRequired,
  onSingleMotorSpeed: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
  open: PropTypes.bool,
  port: PropTypes.shape({ getBatteryState:PropTypes.func }),
  progress: PropTypes.arrayOf(PropTypes.number),
  settings: PropTypes.shape(),
};

export default MainContent;
