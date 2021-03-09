import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation,
} from 'react-i18next';

import './style.css';

function Buttonbar({
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

  return (
    <div className="content_toolbar">
      <div className="btn log_btn">
        <a
          href="#"
          onClick={onSaveLog}
        >
          {t('escButtonSaveLog')}
        </a>
      </div>

      <div className="btn">
        <a
          className={canRead ? "" : "disabled"}
          href="#"
          onClick={onReadSetup}
        >
          {t('escButtonRead')}
        </a>
      </div>

      <div className="btn">
        <a
          className={canWrite ? "" : "disabled"}
          href="#"
          onClick={onWriteSetup}
        >
          {t('escButtonWrite')}
        </a>
      </div>

      <div className="btn">
        <a
          className={canFlash ? "" : "disabled"}
          href="#"
          onClick={onSeletFirmwareForAll}
        >
          {t('escButtonFlashAll')}
        </a>
      </div>

      <div className={canResetDefaults ? "btn" : "hidden"}>
        <a
          className={canResetDefaults ? "" : "disabled"}
          href="#"
          onClick={onResetDefaults}
        >
          {t('resetDefaults')}
        </a>
      </div>
    </div>
  );
}

Buttonbar.propTypes = {
  canFlash: PropTypes.bool.isRequired,
  canRead: PropTypes.bool.isRequired,
  canResetDefaults: PropTypes.bool.isRequired,
  canWrite: PropTypes.bool.isRequired,
  onReadSetup: PropTypes.func.isRequired,
  onResetDefaults: PropTypes.func.isRequired,
  onSaveLog: PropTypes.func.isRequired,
  onSeletFirmwareForAll: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
};

export default Buttonbar;
