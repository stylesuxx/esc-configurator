import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useState,
  useCallback,
} from 'react';

import './style.scss';

function Changelog({ entries }) {
  const { t } = useTranslation('common');

  const [state, setState] = useState({
    expanded: false,
    title: t('defaultChangelogTitle'),
  });

  const ChangelogContent = () => entries.map((entry) => {
    const listItems = entry.items.map((item) => (
      <li key={item}>
        {item}
      </li>
    ));

    return (
      <div key={entry.title}>
        <span>
          {entry.title}
        </span>

        <ul>
          {listItems}
        </ul>
      </div>
    );
  });

  const toggleExpanded = useCallback(() => {
    const newExpanded = !state.expanded;
    setState({
      expanded: newExpanded,
      title: newExpanded ? t('changelogClose') : t('defaultChangelogTitle'),
    });
  });

  return (
    <div
      className={state.expanded ? "expanded" : ""}
      id="changelog"
    >
      <div
        className="button"
        onClick={toggleExpanded}
        type="button"
      >
        {state.title}
      </div>

      <div className="wrapper">
        <div className="title">
          {t('defaultChangelogHead')}
        </div>

        <div className="log">
          <ChangelogContent />
        </div>

      </div>
    </div>
  );
}

Changelog.propTypes = { entries: PropTypes.arrayOf(PropTypes.shape()).isRequired };

export default Changelog;
