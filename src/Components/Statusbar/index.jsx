import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  useTranslation,
} from 'react-i18next';

import './style.scss';

const Statusbar = forwardRef(({
  packetErrors,
  version,
}, ref) => {
  const [utilization, setUtilization] = useState({
    up: 0,
    down: 0,
  });
  const [batteryState, setBatteryState] = useState();

  useImperativeHandle(ref, () => ({
    updateBatteryState(state) {
      if(state && state.cellCount > 0) {
        setBatteryState(`${state.cellCount}S @ ${state.voltage}V`);
      } else {
        setBatteryState(null);
      }
    },
    updateUtilization(utilization) {
      setUtilization(utilization);
    }
  }));

  const { t } = useTranslation('common');
  const upString = `U: ${utilization.up}%`;
  const downString = `D: ${utilization.down}% `;

  return (
    <div id="status-bar">
      <div>
        <span>
          {t('statusbarPortUtilization')}
        </span>

        {' '}

        <span>
          {downString}
        </span>

        <span>
          {upString}
        </span>
      </div>

      <div>
        <span>
          {t('statusbarPacketError')}
        </span>

        {' '}

        <span>
          {packetErrors}
        </span>
      </div>

      {batteryState &&
        <div>
          <span>
            {t('battery')}
          </span>

          {' '}

          <span>
            {batteryState}
          </span>
        </div>}

      <div className="version">
        {version}
      </div>
    </div>
  );
});

Statusbar.propTypes = {
  packetErrors: PropTypes.number.isRequired,
  version: PropTypes.string.isRequired,
};

export default Statusbar;
