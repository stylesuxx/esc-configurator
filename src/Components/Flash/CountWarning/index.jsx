import { useTranslation } from 'react-i18next';
import React from 'react';

import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import MainCard from '../../MainCard';

function CountWarning() {
  const { t } = useTranslation('common');

  return (
    <MainCard
      title={t('escMissingHeader')}
    >
      <Typography>
        {t('escMissingText')}
      </Typography>

      <List dense>
        <ListItem>
          <ListItemText
            primary={<p dangerouslySetInnerHTML={{ __html: t('escMissing1') }} />}
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary={<p dangerouslySetInnerHTML={{ __html: t('escMissing2') }} />}
          />
        </ListItem>

        <ListItem>
          <ListItemText
            primary={<p dangerouslySetInnerHTML={{ __html: t('escMissing3') }} />}
          />
        </ListItem>
      </List>

      <Typography>
        <p
          dangerouslySetInnerHTML={{ __html: t('escMissingHint') }}
        />
      </Typography>
    </MainCard>
  );
}

export default CountWarning;
