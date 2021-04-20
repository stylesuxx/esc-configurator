import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useInterval } from '../../utils/helpers/React';

import './style.scss';

function Statusbar({
  getUtilization,
  packetErrors,
  version,
}) {
  const { t } = useTranslation('common');

  const [utilization, setUtilization] = useState({
    up: 0,
    down: 0,
  });

  useInterval(() => {
    if(getUtilization) {
      const utilization = getUtilization;
      setUtilization(utilization);
    }
  }, 1000);

  return (
    <div className="status-bar">
      <span>
        {`${t('statusbarPortUtilization')} D: ${utilization.down}% U: ${utilization.up}%`}
      </span>

      <span>
        {`${t('statusbarPacketError')} ${packetErrors}`}
      </span>

      <span className="status-bar__version">
        {version}
      </span>
    </div>
  );
}
Statusbar.defaultProps = { getUtilization: null };
Statusbar.propTypes = {
  getUtilization: PropTypes.func,
  packetErrors: PropTypes.number.isRequired,
  version: PropTypes.string.isRequired,
};

export default Statusbar;
