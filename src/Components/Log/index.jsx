import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import './style.scss';

function Log({ messages }) {
  const { t } = useTranslation('common');
  const [ expanded, setExpanded] = useState(false);

  const messageElements = messages.slice(0).reverse()
    .map((message, index) => (
      <div key={index}>
        {message}
      </div>
    ));

  function toggleExpanded() {
    setExpanded(!expanded);
  }

  return (
    <div
      className={expanded ? 'expanded' : ''}
      id="log"
    >
      <div className="logswitch">
        <button
          id="showlog"
          onClick={toggleExpanded}
          type="button"
        >
          {expanded ? t('hideLog') : t('showLog')}
        </button>
      </div>

      <div id="scrollicon" />

      <div className="wrapper">
        {messageElements}
      </div>
    </div>
  );
}

Log.propTypes = { messages: PropTypes.arrayOf(PropTypes.any).isRequired };

export default React.memo(Log);
