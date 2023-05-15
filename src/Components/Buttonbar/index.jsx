import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

import GenericButton from './GenericButton';

import {
  prod,
  show,
  selectSupported,
} from '../MelodyEditor/melodiesSlice';

import './style.scss';

function Buttonbar({
  onClearLog,
  onReadSetup,
  onWriteSetup,
  onSeletFirmwareForAll,
  onResetDefaults,
  onSaveLog,
  canRead,
  canWrite,
  canFlash,
  canResetDefaults,
}) {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const showMelodyEditor = useSelector(selectSupported);

  const handleOpenMelodyEditor = useCallback(() => {
    dispatch(prod());
    dispatch(show());
  }, [dispatch]);

  return (
    <div className="button-bar">
      <div className="buttons-bottom mobile-show">
        {showMelodyEditor &&
          <GenericButton
            disabled={!canRead}
            onClick={handleOpenMelodyEditor}
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
            onClick={handleOpenMelodyEditor}
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
  onReadSetup: PropTypes.func.isRequired,
  onResetDefaults: PropTypes.func.isRequired,
  onSaveLog: PropTypes.func.isRequired,
  onSeletFirmwareForAll: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
};

export default Buttonbar;
