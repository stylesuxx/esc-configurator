import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import './style.scss';

function Buttonbar({
  onOpenMelodyEditor,
  onReadSetup,
  onWriteSetup,
  onSeletFirmwareForAll,
  onResetDefaults,
  onSaveLog,
  canRead,
  canWrite,
  canFlash,
  canResetDefaults,
  showMelodyEditor,
}) {
  const { t } = useTranslation('common');

  function ResetDefaultButton() {
    return (
      <button
        disabled={!canResetDefaults}
        onClick={onResetDefaults}
        type="button"
      >
        {t('resetDefaults')}
      </button>
    );
  }

  return (
    <div id="button-bar">
      <div className="buttons-left">
        <div className="btn log">
          <button
            onClick={onSaveLog}
            type="button"
          >
            {t('escButtonSaveLog')}
          </button>
        </div>

        <div className="mobile-show btn">
          <ResetDefaultButton />
        </div>
      </div>

      <div className="buttons-right">
        <div className="btn">
          <button
            disabled={!canRead}
            onClick={onReadSetup}
            type="button"
          >
            {t('escButtonRead')}
          </button>
        </div>

        <div className="btn">
          <button
            disabled={!canWrite}
            onClick={onWriteSetup}
            type="button"
          >
            {t('escButtonWrite')}
          </button>
        </div>

        <div className="btn">
          <button
            disabled={!canFlash}
            onClick={onSeletFirmwareForAll}
            type="button"
          >
            {t('escButtonFlashAll')}
          </button>
        </div>

        <div className="mobile-hide btn">
          <ResetDefaultButton />
        </div>

        {showMelodyEditor &&
          <div className="btn">
            <button
              disabled={!canRead}
              onClick={onOpenMelodyEditor}
              type="button"
            >
              {t('escButtonOpenMelodyEditor')}
            </button>
          </div>}
      </div>
    </div>
  );
}

Buttonbar.propTypes = {
  canFlash: PropTypes.bool.isRequired,
  canRead: PropTypes.bool.isRequired,
  canResetDefaults: PropTypes.bool.isRequired,
  canWrite: PropTypes.bool.isRequired,
  onOpenMelodyEditor: PropTypes.func.isRequired,
  onReadSetup: PropTypes.func.isRequired,
  onResetDefaults: PropTypes.func.isRequired,
  onSaveLog: PropTypes.func.isRequired,
  onSeletFirmwareForAll: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
  showMelodyEditor: PropTypes.bool.isRequired,
};

export default Buttonbar;
