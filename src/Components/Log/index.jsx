import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useState,
} from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import './style.scss';

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
    <div
      className={expanded ? 'expanded' : ''}
      id="log"
    >
      <Box
        className="logswitch"
        sx={{
          p: 2,
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
          variant="body2"
        >
          {expanded ? t('hideLog') : t('showLog')}
        </Typography>
      </Box>

      <div id="scrollicon" />

      <Box
        className="wrapper"
        sx={{
          p: 2,
          paddingTop: '4px',
          paddingBottom: '4px',
        }}
      >
        {messageElements}
      </Box>
    </div>
  );
}

Log.propTypes = { messages: PropTypes.arrayOf(PropTypes.any).isRequired };

export default React.memo(Log);
