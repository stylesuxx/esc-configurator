import React from 'react';
import Changelog from '../../Components/Changelog';
import changeLogEntries from '../../changelog.json';
import bluejay from './images/bluejay.svg';
import './style.css';

function Home() {
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
              className=""
              i18n="defaultWelcomeIntro"
            />
          </div>
        </div>

        <div className="content_mid">
          <div className="column third_left text1">
            <div className="wrap">
              <h2 i18n="defaultWelcomeHead" />

              <div i18n="defaultWelcomeText" />
            </div>
          </div>

          <div className="column third_center text2">
            <div className="wrap">
              {/* <!-- <h2 i18n="defaultContributingHead"></h2>
              <div i18n="defaultContributingText"></div> --> */}

              <h2>
                This is an experimental fork to configure Bluejay firmware
              </h2>

              <div>
                Always use the most
                {' '}

                <a
                  href="https://github.com/mathiasvr/blheli-configurator/releases"
                  rel="noreferrer"
                  target="_blank"
                >
                  recent version
                </a>

                {' '}
                to avoid issues!
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
            {/* <!-- Free real estate --> */}
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
