import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
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
    .map((message, index) => (
      <Typography
        key={index}
        variant="body2"
      >
        {message}
      </Typography>
    ));

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  return (
    <Collapse
      collapsedSize={28}
      entered={{ overflowY: 'scroll' }}
      in={expanded}
      sx={{
        background: '#242424',
        maxHeight: 206,
        '&.MuiCollapse-entered': { overflowY: 'scroll' },
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
