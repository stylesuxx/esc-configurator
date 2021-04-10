import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';

import './style.scss';

const Statusbar = forwardRef(({
  packetErrors,
  version,
}, ref) => {
  const { t } = useTranslation('common');

  const [utilization, setUtilization] = useState({
    up: 0,
    down: 0,
  });

  useImperativeHandle(ref, () => ({
    updateUtilization(utilization) {
      setUtilization(utilization);
    },
  }));

  return (
    <div id="status-bar">
      <span>
        {`${t('statusbarPortUtilization')} D: ${utilization.down}% U: ${utilization.up}%`}
      </span>

      <span>
        {`${t('statusbarPacketError')} ${packetErrors}`}
      </span>

      <span className="version">
        {version}
      </span>
    </div>
  );
});
Statusbar.propTypes = {
  packetErrors: PropTypes.number.isRequired,
  version: PropTypes.string.isRequired,
};

export default Statusbar;
