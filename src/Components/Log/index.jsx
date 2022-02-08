import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import dateFormat from 'dateformat';
import React, {
  useCallback,
  useState,
} from 'react';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';

function Log({ messages }) {
  const { t } = useTranslation('common');
  const [ expanded, setExpanded] = useState(false);

  const messageElements = messages.slice(0).reverse()
    .map((message, index) => {
      const formattedDate = dateFormat(message.date, 'yyyy-mm-dd @ ');
      const formattedTime = dateFormat(message.date, 'HH:MM:ss -- ');

      return (
        <Typography
          key={index}
          variant="body2"
        >
          <span className="date">
            {formattedDate}
          </span>

          <span className="time">
            {formattedTime}
          </span>

          {message.html}
        </Typography>
      );
    });

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  return (
    <Collapse
      collapsedSize={28}
      in={expanded}
      sx={{
        background: '#242424',
        maxHeight: 206,
        '&.MuiCollapse-entered': { overflowY: 'auto' },
      }}
    >
      <Box
        className="logswitch"
        sx={{
          p: 3,
          paddingTop: '4px',
          position: 'absolute',
          right: 0,
          zIndex: 1,
        }}
      >
        <Typography
          className="button"
          id="showlog"
          onClick={toggleExpanded}
          sx={{
            color: 'rgba(255, 255, 255, 0.60)',
            cursor: 'pointer',
          }}
          variant="body2"
        >
          {expanded ? t('hideLog') : t('showLog')}
        </Typography>
      </Box>

      <Box
        className="wrapper"
        sx={{
          p: 2,
          paddingTop: '4px',
          paddingBottom: '4px',
          color: 'rgba(255, 255, 255, 0.60)',
        }}
      >
        {messageElements}
      </Box>
    </Collapse>
  );
}

Log.propTypes = { messages: PropTypes.arrayOf(PropTypes.any).isRequired };

export default React.memo(Log);
