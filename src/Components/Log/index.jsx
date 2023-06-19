import { useTranslation } from 'react-i18next';
import React, {
  useCallback,
  useState,
} from 'react';

import { useSelector } from 'react-redux';

import { selectLogTimestamped } from './logSlice';

import './style.scss';

function Log() {
  const { t } = useTranslation('common');
  const messages = useSelector(selectLogTimestamped);
  const [ expanded, setExpanded] = useState(false);

  const messageElements = messages.slice(0).reverse()
    .map((message, index) => (
      <div key={index}>
        <span className="date">
          {message.date}

          &nbsp;@&nbsp;
        </span>

        <span className="time">
          {message.time}

          &nbsp;--&nbsp;
        </span>

        {message.html}
      </div>
    ));

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

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

export default React.memo(Log);
