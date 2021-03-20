import React from 'react';
import bluejay from './images/bluejay_logo.png';
import './style.scss';

import {
  useTranslation,
} from 'react-i18next';

function Home() {
  const { t } = useTranslation('common');

  return (
    <div id="tab-landing">
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

            <div
              align="center"
              dangerouslySetInnerHTML={{ __html: t('betaWarning') }}
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

                <ul>
                  <li>
                    <a
                      href="https://github.com/bitdump/BLHeli"
                      rel="noreferrer"
                      target="_blank"
                    >
                      BLHELI_S
                    </a>
                  </li>

                  <li>
                    <a
                      href="https://github.com/mathiasvr/bluejay"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Bluejay
                    </a>
                  </li>

                  <li>
                    <a
                      href="https://github.com/AlkaMotors/AM32-MultiRotor-ESC-firmware"
                      rel="noreferrer"
                      target="_blank"
                    >
                      AM32
                    </a>
                  </li>
                </ul>
              </div>

              <div className="summary-section">
                <h3>
                  BLHELI_S
                </h3>

                <section>
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: t('blhelisText') }} />
                  </div>
                </section>
              </div>

              <div className="summary-section">
                <h3>
                  Bluejay
                </h3>

                <section>
                  <img
                    alt="Bluejay"
                    src={bluejay}
                  />

                  <div>
                    <div dangerouslySetInnerHTML={{ __html: t('bluejayText') }} />
                  </div>
                </section>
              </div>

              <div className="summary-section">
                <h3>
                  AM32
                </h3>

                <section>
                  <div dangerouslySetInnerHTML={{ __html: t('blheli32ToAM32') }} />
                </section>
              </div>
            </div>
          </div>

          <div className="column third_right text3">
            <div className="wrap">
              <h2>
                {t('homeContributionHeader')}
              </h2>

              <div dangerouslySetInnerHTML={{ __html: t('homeContributionText') }} />

              <div className="summary-section">
                <h3>
                  {t('whatsNextHeader')}
                </h3>

                <section>
                  <div dangerouslySetInnerHTML={{ __html: t('whatsNextText') }} />
                </section>
              </div>
            </div>
          </div>
        </div>

        <div className="content_foot" />
      </div>
    </div>
  );
}

export default Home;
