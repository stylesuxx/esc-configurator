import { useTranslation } from 'react-i18next';
import React from 'react';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Card from '@mui/material/Card';

function Warning() {
  const { t } = useTranslation('common');

  return (
    <Card elevation={5}>
      <Alert severity="warning">
        <AlertTitle>
          {t('noteTitle')}
        </AlertTitle>

        <p dangerouslySetInnerHTML={{ __html: t('notePropsOff') }} />

        <p dangerouslySetInnerHTML={{ __html: t('noteConnectPower') }} />
      </Alert>
    </Card>
  );
}

export default Warning;
