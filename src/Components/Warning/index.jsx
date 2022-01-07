import { useTranslation } from 'react-i18next';
import React from 'react';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

function Warning() {
  const { t } = useTranslation('common');

  return (
    <Alert severity="warning">
      <AlertTitle>
        {t('noteTitle')}
      </AlertTitle>

      <p dangerouslySetInnerHTML={{ __html: t('notePropsOff') }} />

      <p dangerouslySetInnerHTML={{ __html: t('noteConnectPower') }} />
    </Alert>
  );
}

export default Warning;
