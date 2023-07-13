import React, {
  useState,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';

import entries from '../../changelog.json';
import Content from './Content';

import './style.scss';

function Changelog() {
  const { t } = useTranslation('common');

  const [state, setState] = useState({
    expanded: false,
    title: t('defaultChangelogTitle'),
  });

  const toggleExpanded = useCallback(() => {
    const newExpanded = !state.expanded;
    setState({
      expanded: newExpanded,
      title: newExpanded ? t('changelogClose') : t('defaultChangelogTitle'),
    });
  }, [t, state.expanded]);

  return (
    <div className={`changelog ${state.expanded ? "expanded" : ""}`}>
      <div
        className="button"
        onClick={toggleExpanded}
        type="button"
      >
        {state.title}
      </div>

      <div className="changelog__wrapper">
        <div className="changelog__title">
          {t('defaultChangelogHead')}
        </div>

        <div className="changelog__content">
          <Content entries={entries} />
        </div>
      </div>
    </div>
  );
}

export default Changelog;
