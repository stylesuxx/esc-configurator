import { useTranslation } from 'react-i18next';
import React from 'react';

import './style.scss';

function CountWarning() {
  const { t } = useTranslation('common');

  return (
    <div className="gui-box grey missing-esc">
      <div className="gui-box-titlebar">
        <div className="spacer-box-title">
          {t('escMissingHeader')}
        </div>
      </div>

      <div className="spacer-box">
        <p>
          {t('escMissingText')}
        </p>

        <ul>
          <li
            dangerouslySetInnerHTML={{ __html: t('escMissing1') }}
          />

          <li
            dangerouslySetInnerHTML={{ __html: t('escMissing2') }}
          />

          <li
            dangerouslySetInnerHTML={{ __html: t('escMissing3') }}
          />
        </ul>

        <p
          dangerouslySetInnerHTML={{ __html: t('escMissingHint') }}
        />
      </div>
    </div>
  );
}

export default CountWarning;
