import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import CommonSettings from './CommonSettings';
import CountWarning from './CountWarning';
import Escs from './Escs';

import './style.scss';
import { useSelector } from 'react-redux';
import {
  selectConnected,
  selectIndividual,
} from '../../Containers/App/escsSlice';
import { selectSettingsObject } from '../AppSettings/settingsSlice';

function Flash({
  flashProgress,
  onFirmwareDump,
  progressReferences,
  unsupported,
}) {
  const { t } = useTranslation('common');

  const escs = useSelector(selectIndividual);
  const escCount = useSelector(selectConnected);
  const { disableCommon } = useSelector(selectSettingsObject);

  const memoizedEscs = useMemo(() => (
    <Escs
      flashProgress={flashProgress}
      onFirmwareDump={onFirmwareDump}
      progressReferences={progressReferences}
    />
  ), [flashProgress, onFirmwareDump, progressReferences]);

  return (
    <div className="flash">
      <div className="flash__wrapper">
        <div className="flash__common">
          {escs.length > 0 && !disableCommon &&
            <CommonSettings
              unsupported={unsupported}
            />}

          {disableCommon &&
            <div className="gui-box grey">
              <div className="gui-box-titlebar">
                <div className="spacer-box-title">
                  {t('commonSettingsDisabled')}
                </div>
              </div>

              <div className="spacer-box">
                {t('commonSettingsDisabledText')}
              </div>
            </div>}
        </div>

        <div className="flash__individual">
          {memoizedEscs}

          {escCount !== escs.length &&
            <CountWarning />}
        </div>
      </div>
    </div>
  );
}

Flash.propTypes = {
  flashProgress: PropTypes.arrayOf(PropTypes.number).isRequired,
  onFirmwareDump: PropTypes.func.isRequired,
  progressReferences: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  unsupported: PropTypes.bool.isRequired,
};

export default Flash;
