import PropTypes from 'prop-types';
import React from 'react';

import {
  useTranslation,
} from 'react-i18next';
import {
  useState,
} from 'react';
import './style.css';

function Log({ messages }) {
  const { t } = useTranslation('common');
  const [ expanded, setExpanded] = useState(false);

  const messageElements = messages.slice(0).reverse().
    map((message, index) => (
      <div key={index}>
        {message}
      </div>
    ));

  function toggleExpanded(e) {
    e.preventDefault();

    setExpanded(!expanded);
  }

  let expandedClass = '';
  let toggleText = t('showLog');
  if (expanded) {
    expandedClass = 'expanded';
    toggleText = t('hideLog');
  }

  return (
    <div
      className={expandedClass}
      id="log"
    >
      <div className="logswitch">
        <a
          href="#"
          id="showlog"
          onClick={toggleExpanded}
        >
          {toggleText}
        </a>
      </div>

      <div id="scrollicon" />

      <div className="wrapper">
        {messageElements}
      </div>
    </div>
  );
}

Log.propTypes = { messages: PropTypes.arrayOf(PropTypes.any).isRequired };

export default Log;
