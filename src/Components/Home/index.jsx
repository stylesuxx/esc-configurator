import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useRef,
  useState,
} from 'react';

import bluejay from './images/bluejay_logo.png';
import './style.scss';

function Install() {
  const { t } = useTranslation('common');

  const deferredPrompt = useRef(null);
  const [showInstall, setShowInstall]  = useState(false);

  setTimeout(() => {
    setShowInstall(true);
  }, 1000);

  window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt.current = e;
    setShowInstall(true);
  });

  function handleInstallToHomescreen() {
    if(deferredPrompt.current) {
      deferredPrompt.current.prompt();
    }
  }

  return(
    <div className={`install-wrapper ${showInstall ? 'active' : ''}`}>
      <div className="install">
        <div
          className="description"
          dangerouslySetInnerHTML={{ __html: t('homeInstall') }}
        />

        <div className="default-btn">
          <button
            onClick={handleInstallToHomescreen}
            type="button"
          >
            {t('addToHomeScreen')}
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeColumnLeft() {
  const { t } = useTranslation('common');

  return(
    <div className="column third_left text1">
      <div className="wrap">
        <div className="summary-section">
          <h2>
            {t('homeDisclaimerHeader')}
          </h2>

          <div dangerouslySetInnerHTML={{ __html: t('homeDisclaimerText') }} />
        </div>

        <div className="summary-section">
          <h2>
            {t('homeAttributionHeader')}
          </h2>

          <div dangerouslySetInnerHTML={{ __html: t('homeAttributionText') }} />
        </div>
      </div>
    </div>
  );
}

function HomeColumnCenter({ onOpenMelodyEditor }) {
  const { t } = useTranslation('common');

  return(
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

              <div className="default-btn melody-editor-button">
                <button
                  onClick={onOpenMelodyEditor}
                  type="button"
                >
                  {t('openMelodyEditor')}
                </button>
              </div>
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
  );
}
HomeColumnCenter.propTypes = { onOpenMelodyEditor: PropTypes.func.isRequired };

function HomeColumnRight() {
  const { t } = useTranslation('common');

  return(
    <div className="column third_right text3">
      <div className="wrap">
        <div className="summary-section">
          <h2>
            {t('homeDiscordHeader')}
          </h2>

          <div dangerouslySetInnerHTML={{ __html: t('homeDiscordText') }} />

          <a
            className="discord-link"
            href="https://discord.gg/QvSS5dk23C"
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt="Discord"
              className="discord"
              data-canonical-src="https://img.shields.io/discord/822952715944460368.svg?label=&amp;logo=discord&amp;logoColor=ffffff&amp;color=7389D8&amp;labelColor=6A7EC2"
              src="https://camo.githubusercontent.com/74d2e4746c6f20a2cf36068cd18d092724801f7ccd17e6bdce62e94d31f9ccb2/68747470733a2f2f696d672e736869656c64732e696f2f646973636f72642f3832323935323731353934343436303336382e7376673f6c6162656c3d266c6f676f3d646973636f7264266c6f676f436f6c6f723d66666666666626636f6c6f723d373338394438266c6162656c436f6c6f723d364137454332"
            />
          </a>
        </div>

        <div className="summary-section">
          <h2>
            {t('homeChinaHeader')}
          </h2>

          <div dangerouslySetInnerHTML={{ __html: t('homeChinaText') }} />
        </div>

        <div className="summary-section">
          <h2>
            {t('homeContributionHeader')}
          </h2>

          <div dangerouslySetInnerHTML={{ __html: t('homeContributionText') }} />
        </div>

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
  );
}

function Home({ onOpenMelodyEditor }) {
  const { t } = useTranslation('common');

  return (
    <div id="content">
      <div id="tab-landing">
        <div className="content_wrapper">
          <div className="content_top">
            <div
              align="center"
              className="logowrapper"
            >
              <div
                align="center"
                className="line-1"
                dangerouslySetInnerHTML={{ __html: t('homeWelcome') }}
              />

              <Install />

              <div
                align="center"
                dangerouslySetInnerHTML={{ __html: t('betaWarning') }}
              />
            </div>
          </div>

          <div className="content_mid">
            <HomeColumnLeft />

            <HomeColumnCenter
              onOpenMelodyEditor={onOpenMelodyEditor}
            />

            <HomeColumnRight />
          </div>
        </div>
      </div>
    </div>
  );
}
Home.propTypes = { onOpenMelodyEditor: PropTypes.func.isRequired };

export default Home;
