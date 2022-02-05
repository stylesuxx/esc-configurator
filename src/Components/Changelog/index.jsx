import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useState,
  useCallback,
} from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Content from './Content';

import './style.scss';

function Changelog({ entries }) {
  const { t } = useTranslation('common');

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
    <div className={`changelog ${state.expanded ? "expanded" : ""}`}>
      <Typography
        className="button"
        onClick={toggleExpanded}
      >
        {state.title}
      </Typography>

      <Box
        className="wrapper"
        sx={{
          p: 1,
          borderLeft: '5px solid #71B238',
          overflowY: 'auto',
          height: 1,
        }}
      >
        <Typography variant="h6">
          {t('defaultChangelogHead')}
        </Typography>

        <Content entries={entries} />
      </Box>
    </div>
  );
}

Changelog.propTypes = { entries: PropTypes.arrayOf(PropTypes.shape()).isRequired };

export default Changelog;
