import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect
} from 'react';
import {
  useTranslation,
} from 'react-i18next';


function Statusbar({
  packetErrors,
  getUtilization,
  version,
}) {
  const [utilization, setUtilization] = useState({
    up: 0,
    down: 0,
  });
  const [timeout, setTimeout] = useState(null);

  useEffect(() => {
    if(getUtilization) {
      if(!timeout) {
        const to = setInterval(() => {
          const current = getUtilization();
          setUtilization(current);
        }, 1000);

        setTimeout(to);
      }
    } else {
      if(timeout) {
        clearTimeout(timeout);
        setTimeout(null);
      }
    }
  }, []);

  const { t } = useTranslation('common');
  const upString = `U: ${utilization.up}%`;
  const downString = `D: ${utilization.down}% `;

  return (
    <div id="status-bar">
      <div>
        <span>
          {t('statusbarPortUtilization')}
        </span>

        <span className="port_usage_down">
          {downString}
        </span>

        <span className="port_usage_up">
          {upString}
        </span>
      </div>

      <div>
        <span>
          {t('statusbarPacketError')}
        </span>

        <span className="packet-error">
          {packetErrors}
        </span>
      </div>

      <div className="version">
        {version}
      </div>
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
