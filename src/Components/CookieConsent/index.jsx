import { CookieBanner } from '@palmabit/react-cookie-law';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

function CookieConsent({ onCookieAccept }) {
  const { t } = useTranslation('common');

  return (
    <CookieBanner
      message={t('cookieText')}
      onAccept={onCookieAccept}
      privacyPolicyLinkText=""
      styles={{
        dialog: {
          bottom: 0,
          top: 'auto',
          position: 'fixed',
          width: '100%',
          paddingBottom: '20px',
          paddingTop: '20px',
          background: 'white',
          borderTop: 'solid 2px black',
          zIndex: 2,
        },
        message: {
          fontSize: '16px',
          marginBottom: '10px',
        },
        button: {
          padding: '7px',
          margin: '5px',
          cursor: 'pointer',
          background: 'black',
          color: 'white',
        },
        policy: {
          display: 'inline-block',
          lineHeight: '30px',
          fontSize: '14px',
        },
      }}
    />
  );
}

CookieConsent.propTypes = { onCookieAccept: PropTypes.func.isRequired };

export default CookieConsent;
