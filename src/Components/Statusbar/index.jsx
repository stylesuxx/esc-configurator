import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';

import './style.scss';

function BatteryState({
  danger,
  text,
}) {
  const { t } = useTranslation('common');

  if(text) {
    return (
      <span className={danger ? 'danger' : ''}>
        {`${t('battery')} ${text}`}
      </span>
    );
  }

  return null;
}
BatteryState.defaultProps = { text: undefined };
BatteryState.propTypes = {
  danger: PropTypes.bool.isRequired,
  text: PropTypes.string,
};

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

  return (
    <div id="status-bar">
      <span>
        {`${t('statusbarPortUtilization')} D: ${utilization.down}% U: ${utilization.up}%`}
      </span>

      <span>
        {`${t('statusbarPacketError')} ${packetErrors}`}
      </span>

      <BatteryState
        danger={batteryState.danger}
        text={batteryState.text}
      />

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
