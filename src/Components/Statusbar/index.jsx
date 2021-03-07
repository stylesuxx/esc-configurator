import PropTypes from 'prop-types';
import React from 'react';
import {
  useTranslation,
} from 'react-i18next';


function Statusbar({
  packetErrors,
  version,
}) {
  const { t } = useTranslation('common');

  return (
    <div id="status-bar">
      <div>
        <span>
          {t('statusbarPortUtilization')}
        </span>

        <span className="port_usage_down">
          D: 0%
        </span>

        <span className="port_usage_up">
          U: 0%
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

Statusbar.propTypes = {
  packetErrors: PropTypes.number.isRequired,
  version: PropTypes.string.isRequired,
};

export default Statusbar;
