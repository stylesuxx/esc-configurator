import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { useInterval } from '../../utils/helpers/React';

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
    <Box
      className="status-barx"
      sx={{
        height: '20px',
        lineHeight: '20px',
        position: 'fixed',
        bottom: 0,
        width: 1,
        borderTop: '1px solid #7d7d79',
        background: '#bfbeb5',
      }}
    >
      <Box
        className="mui-fixed"
        sx={{
          p: 1,
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <Grid
          container
          justifyContent="space-between"
        >
          <Grid item>
            <Typography variant="body2">
              {`${t('statusbarPortUtilization')} D: ${utilization.down}% U: ${utilization.up}%`}

              &nbsp;|&nbsp;

              {`${t('statusbarPacketError')} ${packetErrors}`}
            </Typography>
          </Grid>

          <Grid item>
            <Typography variant="body2">
              {version}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
Statusbar.defaultProps = { getUtilization: null };
Statusbar.propTypes = {
  getUtilization: PropTypes.func,
  packetErrors: PropTypes.number.isRequired,
  version: PropTypes.string.isRequired,
};

export default Statusbar;
