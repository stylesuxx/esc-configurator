import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import './style.scss';

function Overlay({
  children,
  headline,
  onClose,
}) {
  const { t } = useTranslation('settings');

  return (
    <div className="overlay">
      <div
        className="backdrop"
        onClick={onClose}
      />

      <div className="overlay__wrapper">
        <div
          className="overlay__close"
          onClick={onClose}
          type="button"
        >
          {t('closeText')}
        </div>

        <h3>
          {headline}
        </h3>

        {children}
      </div>
    </div>
  );
}
Overlay.defaultProps = { children: null };
Overlay.propTypes = {
  children: PropTypes.element,
  headline: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Overlay;
