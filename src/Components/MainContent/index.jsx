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
  isReading,
  isWriting,
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
  isSelecting,
  isFlashing,
  flashTargets,
  onLocalSubmit,
  changelogEntries,
}) {
  const canWrite = (escs.length > 0) && !isSelecting && settings && !isFlashing && !isReading;
  const canFlash = (escs.length > 0) && !isSelecting && !isWriting && !isFlashing && !isReading;
  const canRead = !isReading && !isWriting && !isSelecting && !isFlashing;
  const canResetDefaults = false;

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
    const esc = escs[flashTargets[0]];
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
        canResetDefaults={canResetDefaults}
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
  changelogEntries: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  configs: PropTypes.shape({
    escs: PropTypes.shape().isRequired,
    pwm: PropTypes.shape().isRequired,
    versions: PropTypes.shape().isRequired,
  }).isRequired,
  escs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  flashTargets: PropTypes.arrayOf(PropTypes.number).isRequired,
  isFlashing: PropTypes.bool.isRequired,
  isReading: PropTypes.bool.isRequired,
  isSelecting: PropTypes.bool.isRequired,
  isWriting: PropTypes.bool.isRequired,
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
