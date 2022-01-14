import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import GenericButton from './GenericButton';

import './style.scss';

function Buttonbar({
  onClearLog,
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

  return (
    <div className="button-bar">
      <div className="buttons-bottom mobile-show">
        {showMelodyEditor &&
          <GenericButton
            disabled={!canRead}
            onClick={onOpenMelodyEditor}
            text={t('escButtonOpenMelodyEditor')}
          />}
      </div>

      <div className="buttons-left">
        <GenericButton
          onClick={onSaveLog}
          text={t('escButtonSaveLog')}
        />

        <GenericButton
          onClick={onClearLog}
          text={t('escButtonClearLog')}
        />

        <div className="mobile-show">
          <GenericButton
            disabled={!canResetDefaults}
            onClick={onResetDefaults}
            text={t('resetDefaults')}
          />
        </div>
      </div>

      <div className="buttons-right">
        <GenericButton
          disabled={!canRead}
          onClick={onReadSetup}
          text={t('escButtonRead')}
        />

        <GenericButton
          disabled={!canWrite}
          onClick={onWriteSetup}
          text={t('escButtonWrite')}
        />

        <GenericButton
          disabled={!canFlash}
          onClick={onSeletFirmwareForAll}
          text={t('escButtonFlashAll')}
        />

        <GenericButton
          disabled={!canResetDefaults}
          onClick={onResetDefaults}
          text={t('resetDefaults')}
        />

        {showMelodyEditor &&
          <GenericButton
            disabled={!canRead}
            onClick={onOpenMelodyEditor}
            text={t('escButtonOpenMelodyEditor')}
          />}
      </div>
    </div>
  );
}

Buttonbar.propTypes = {
  canFlash: PropTypes.bool.isRequired,
  canRead: PropTypes.bool.isRequired,
  canResetDefaults: PropTypes.bool.isRequired,
  canWrite: PropTypes.bool.isRequired,
  onClearLog: PropTypes.func.isRequired,
  onOpenMelodyEditor: PropTypes.func.isRequired,
  onReadSetup: PropTypes.func.isRequired,
  onResetDefaults: PropTypes.func.isRequired,
  onSaveLog: PropTypes.func.isRequired,
  onSeletFirmwareForAll: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
  showMelodyEditor: PropTypes.bool.isRequired,
};

export default Buttonbar;
