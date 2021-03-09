import PropTypes from 'prop-types';
import React, {
  useState, useCallback,
} from 'react';
import {
  useTranslation,
} from 'react-i18next';

function Changelog({ children }) {
  const { t } = useTranslation('common');
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback((e) => {
    e.preventDefault();
    setExpanded(!expanded);
  }, [expanded]);

  let title = t('defaultChangelogTitle');
  if(expanded) {
    title = t('changelogClose');
  }

  return (
    <div
      className={expanded ? "expanded" : ""}
      id="changelog"
    >
      <div className="button">
        <a
          href="#"
          id="changelog_toggle"
          onClick={toggleExpanded}
        >
          {title}
        </a>
      </div>

      <div className="wrapper">
        <div className="title">
          {t('defaultChangelogHead')}
        </div>

        <div className="log">
          {children}
        </div>

      </div>
    </div>
  );
}

Changelog.propTypes = { children: PropTypes.element.isRequired };

export default Changelog;
