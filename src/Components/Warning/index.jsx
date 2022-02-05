import { useTranslation } from 'react-i18next';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Card from '@mui/material/Card';

function Warning() {
  const { t } = useTranslation('common');

  return (
    <Card elevation={5}>
      <Alert severity="warning">
        <AlertTitle>
          {t('note')}
        </AlertTitle>

        <ReactMarkdown>
          {t('notePropsOff')}
        </ReactMarkdown>

        <ReactMarkdown>
          {t('noteConnectPower')}
        </ReactMarkdown>
      </Alert>
    </Card>
  );
}

export default Warning;
