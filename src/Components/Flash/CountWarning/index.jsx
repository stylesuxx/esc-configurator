import { useTranslation } from 'react-i18next';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import MainCard from '../../MainCard';

function CountWarning() {
  const { t } = useTranslation('common');
  const lines = [1, 2, 3, 4, 5].map((index) => {
    const line = `escMissing${index}`;
    return (
      <ListItem key={line}>
        <ListItemText>
          <ReactMarkdown components={{ p: 'span' }}>
            {t(line)}
          </ReactMarkdown>
        </ListItemText>
      </ListItem>
    );
  });

  return (
    <MainCard
      title={t('escMissingHeader')}
    >
      <Typography>
        {t('escMissingText')}
      </Typography>

      <List dense>
        {lines}
      </List>

      <Typography>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('escMissingHint')}
        </ReactMarkdown>
      </Typography>
    </MainCard>
  );
}

export default CountWarning;
