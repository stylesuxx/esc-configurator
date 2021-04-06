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
  const cellLimit = 3.7;
  const [utilization, setUtilization] = useState({
    up: 0,
    down: 0,
  });
  const [batteryState, setBatteryState] = useState({
    text: null,
    danger: false,
  });

  useImperativeHandle(ref, () => ({
    updateBatteryState(state) {
      if(state && state.cellCount > 0) {
        const danger = (state.voltage / state.cellCount) < cellLimit;
        setBatteryState({
          text: `${state.cellCount}S @ ${state.voltage}V`,
          danger,
        });
      } else {
        setBatteryState({
          text: null,
          danger: false,
        });
      }
    },
    updateUtilization(utilization) {
      setUtilization(utilization);
    },
  }));

  function BatteryState() {
    if(batteryState.text) {
      return (
        <span className={batteryState.danger ? 'danger' : ''}>
          {`${t('battery')} ${batteryState.text}`}
        </span>
      );
    }

    return null;
  }

  return (
    <div id="status-bar">
      <span>
        {`${t('statusbarPortUtilization')} D: ${utilization.down}% U: ${utilization.up}%`}
      </span>

      <span>
        {`${t('statusbarPacketError')} ${packetErrors}`}
      </span>

      <BatteryState />

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
