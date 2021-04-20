import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import Content from './Content';

import './style.scss';

function Changelog({ entries }) {
  const { t } = useTranslation('common');

  const [state, setState] = useState({
    expanded: false,
    title: t('defaultChangelogTitle'),
  });

  function toggleExpanded() {
    const newExpanded = !state.expanded;
    setState({
      expanded: newExpanded,
      title: newExpanded ? t('changelogClose') : t('defaultChangelogTitle'),
    });
  }

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

Changelog.propTypes = { entries: PropTypes.arrayOf(PropTypes.shape()).isRequired };

export default Changelog;
