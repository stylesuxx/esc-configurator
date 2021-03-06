import React from 'react';
import Changelog from '../../Components/Changelog';
import changeLogEntries from '../../changelog.json';
import bluejay from './images/bluejay.svg';
import './style.css';

import {
  useTranslation,
} from 'react-i18next';

function Home() {
  const { t } = useTranslation('common');

  const ChangelogContent = () => changeLogEntries.map((entry) => {
    const listItems = entry.items.map((item, index) => (
      <li
        key={index}
      >
        {item}
      </li>
    ));


    return (
      <div
        key={entry.title}
      >
        <span>
          {entry.title}
        </span>

        <ul>

          {listItems}
        </ul>
      </div>
    );
  });

  return (
    <div className="tab-landing">
      <div className="content_wrapper">
        <div className="content_top">
          <div
            align="center"
            className="logowrapper"
          >
            <div
              align="center"
              dangerouslySetInnerHTML={{ __html: t('homeWelcome') }}
            />
          </div>
        </div>

        <div className="content_mid">
          <div className="column third_left text1">
            <div className="wrap">
              <h2>
                {t('homeDisclaimerHeader')}
              </h2>

              <div dangerouslySetInnerHTML={{ __html: t('homeDisclamierText') }} />
            </div>
          </div>

          <div className="column third_center text2">
            <div className="wrap">

              <h2>
                {t('homeExperimental')}
              </h2>

              <div>
                {t('homeVersionInfo')}
              </div>

              <div>
                <img
                  alt="Bluejay"
                  src={bluejay}
                  width="75%"
                />
              </div>
            </div>
          </div>

          <div className="column third_right text3">
            <h2>
              {t('homeContributionHeader')}
            </h2>

            <div dangerouslySetInnerHTML={{ __html: t('homeContributionText') }} />
          </div>
        </div>

        <div className="content_foot" />
      </div>

      <Changelog>
        <ChangelogContent />
      </Changelog>
    </div>
  );
}

export default Home;
