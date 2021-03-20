import React from 'react';
import PropTypes from 'prop-types';

import Home from '../Home';
import Flash from '../Flash';
import Buttonbar from '../Buttonbar';
import FirmwareSelector from '..//FirmwareSelector';
import Changelog from '../../Components/Changelog';

import './style.scss';

function MainContent({
  open,
  escs,
  settings,
  progress,
  onIndividualSettingsUpdate,
  onCancelFirmwareSelection,
  onSelectFirmwareForAll,
  onSettingsUpdate,
  onReadEscs,
  onResetDefaultls,
  onSingleFlash,
  onWriteSetup,
  onFlashUrl,
  onSaveLog,
  configs,
  flashTargets,
  onLocalSubmit,
  changelogEntries,
  actions,
}) {
  const {
    isSelecting,
    isFlashing,
    isReading,
    isWriting,
  } = actions;
  const canWrite = (escs.length > 0) && !isSelecting && settings && !isFlashing && !isReading && !isWriting;
  const canFlash = (escs.length > 0) && !isSelecting && !isWriting && !isFlashing && !isReading;
  const canRead = !isReading && !isWriting && !isSelecting && !isFlashing;

  if (!open) {
    return (
      <>
        <div id="content">
          <Home />
        </div>

        <Changelog
          entries={changelogEntries}
        />
      </>
    );
  }

  if (isSelecting) {
    const targetIndex = flashTargets[0];
    const esc = escs.find((esc) => esc.index === targetIndex);
    return (
      <div id="content">
        <div className="tab toolbar_fixed_bottom">
          <div className="content_wrapper">
            <FirmwareSelector
              configs={configs}
              escHint={esc.settings.LAYOUT}
              onCancel={onCancelFirmwareSelection}
              onLocalSubmit={onLocalSubmit}
              onSubmit={onFlashUrl}
              signatureHint={esc.meta.signature}
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
            <Flash
              availableSettings={settings}
              canFlash={canFlash}
              escs={escs}
              flashProgress={progress}
              onFlash={onSingleFlash}
              onIndividualSettingsUpdate={onIndividualSettingsUpdate}
              onSettingsUpdate={onSettingsUpdate}
            />
          </div>
        </div>
      </div>

      <Buttonbar
        canFlash={canFlash}
        canRead={canRead}
        canResetDefaults={canWrite}
        canWrite={canWrite}
        onReadSetup={onReadEscs}
        onResetDefaults={onResetDefaultls}
        onSaveLog={onSaveLog}
        onSeletFirmwareForAll={onSelectFirmwareForAll}
        onWriteSetup={onWriteSetup}
      />
    </>
  );
}

MainContent.propTypes = {
  actions: PropTypes.shape({
    isFlashing: PropTypes.bool.isRequired,
    isReading: PropTypes.bool.isRequired,
    isSelecting: PropTypes.bool.isRequired,
    isWriting: PropTypes.bool.isRequired,
  }).isRequired,
  changelogEntries: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  configs: PropTypes.shape({
    escs: PropTypes.shape().isRequired,
    pwm: PropTypes.shape().isRequired,
    versions: PropTypes.shape().isRequired,
  }).isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  flashTargets: PropTypes.arrayOf(PropTypes.number).isRequired,
  onCancelFirmwareSelection: PropTypes.func.isRequired,
  onFlashUrl: PropTypes.func.isRequired,
  onIndividualSettingsUpdate: PropTypes.func.isRequired,
  onLocalSubmit: PropTypes.func.isRequired,
  onReadEscs: PropTypes.func.isRequired,
  onResetDefaultls: PropTypes.func.isRequired,
  onSaveLog: PropTypes.func.isRequired,
  onSelectFirmwareForAll: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
  onSingleFlash: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  progress: PropTypes.arrayOf(PropTypes.number).isRequired,
  settings: PropTypes.shape().isRequired,
};

export default MainContent;
