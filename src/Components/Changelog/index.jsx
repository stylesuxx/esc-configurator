import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useState,
  useCallback,
} from 'react';

import { useTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';

import Content from './Content';

function Changelog({ entries }) {
  const { t } = useTranslation('common');
  const theme = useTheme();

  const buttonStyle = {
    transform: 'rotate(270deg)',
    position: 'absolute',
    top: 185,
    right: '-32px',
    color: 'white',
    borderRadius: '5px 5px 0 0',
    background: theme.palette.primary.bright,
    p: '5px 10px',
    cursor: 'pointer',
  };

  const [state, setState] = useState({
    expanded: false,
    title: t('defaultChangelogTitle'),
  });

  const toggleExpanded = useCallback(() => {
    const newExpanded = !state.expanded;
    setState({
      expanded: newExpanded,
      title: newExpanded ? t('changelogClose') : t('defaultChangelogTitle'),
    });
  }, [t, state.expanded]);

  return (
    <>
      <Typography
        className="button"
        onClick={toggleExpanded}
        sx={buttonStyle}
      >
        {state.title}
      </Typography>

      <Drawer
        anchor="right"
        onClose={toggleExpanded}
        open={state.expanded}
      >
        <Box
          className="wrapper"
          sx={{
            p: 2,
            borderLeft: '5px solid',
            borderColor: theme.palette.primary.bright,
            overflowY: 'auto',
            maxWidth: 300,
          }}
        >
          <Typography
            paragraph
            variant="h6"
          >
            {t('defaultChangelogHead')}
          </Typography>

          <Content entries={entries} />
        </Box>
      </Drawer>
    </>
  );
}

Changelog.propTypes = { entries: PropTypes.arrayOf(PropTypes.shape()).isRequired };

export default Changelog;
