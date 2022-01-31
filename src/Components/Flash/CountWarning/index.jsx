import { useTranslation } from 'react-i18next';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import './style.scss';

function CountWarning() {
  const { t } = useTranslation('common');
  const lines = [1, 2, 3, 4, 5].map((index) => {
    const line = `escMissing${index}`;
    return (
      <ReactMarkdown
        components={{ p: 'li' }}
        key={line}
      >
        {t(line)}
      </ReactMarkdown>
    );
  });


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
          {lines}
        </ul>

        <ReactMarkdown>
          {t('escMissingHint')}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default CountWarning;
