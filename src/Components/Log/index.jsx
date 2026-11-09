import React, {
  useCallback,
  useState,
} from 'react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
  clear as clearLog,
  selectLog,
  selectLogTimestamped,
} from './logSlice';

import './style.scss';

function Log() {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const messages = useSelector(selectLogTimestamped);
  const log = useSelector(selectLog);
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

  const handleSaveLog = useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob([log.join("\n")], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "esc-configurator-log.txt";
    document.body.appendChild(element);
    element.click();

    dispatch(clearLog());
  }, [dispatch, log]);

  const handleClearLog = useCallback(() => {
    dispatch(clearLog());
  }, [dispatch]);

  return (
    <div
      className={expanded ? 'expanded' : ''}
      id="log"
    >
      <div className="logswitch">
        <button
          onClick={handleSaveLog}
          type="button"
        >
          {t('escButtonSaveLog')}
        </button>

        <button
          onClick={handleClearLog}
          type="button"
        >
          {t('escButtonClearLog')}
        </button>

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
