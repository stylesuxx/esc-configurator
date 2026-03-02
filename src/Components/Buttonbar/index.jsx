import React, { useCallback } from 'react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import GenericButton from './GenericButton';

import {
  prod,
  show,
  selectSupported,
} from '../MelodyEditor/melodiesSlice';
import {
  selectCanFlash,
  selectCanRead,
  selectCanWrite,
  setSelecting,
} from '../../Containers/App/stateSlice';
import {
  selectIndividual,
  setTargets,
} from '../../Containers/App/escsSlice';

import './style.scss';

function Buttonbar({
  onReadSetup,
  onWriteSetup,
  onResetDefaults,
}) {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const showMelodyEditor = useSelector(selectSupported);

  const canFlash = useSelector(selectCanFlash);
  const canRead = useSelector(selectCanRead);
  const canWrite = useSelector(selectCanWrite);

  const escs = useSelector(selectIndividual);

  const onSeletFirmwareForAll = useCallback(() => {
    const targets = [];
    for (let i = 0; i < escs.length; i += 1) {
      const esc = escs[i];
      targets.push(esc.index);
    }

    dispatch(setSelecting(true));
    dispatch(setTargets(targets));
  }, [dispatch, escs]);

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
        <div className="mobile-show">
          <GenericButton
            disabled={!canWrite}
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
          disabled={!canWrite}
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
  onReadSetup: PropTypes.func.isRequired,
  onResetDefaults: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
};

export default Buttonbar;
