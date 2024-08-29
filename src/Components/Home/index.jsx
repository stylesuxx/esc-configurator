import React, {
  useCallback,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import {
  dummy as melodyEditorDummy,
  show as showMelodyEditor,
} from '../MelodyEditor/melodiesSlice';

import bluejay from './images/bluejay_logo.png';
import './style.scss';

function Install() {
  const { t } = useTranslation('common');

  const deferredPrompt = useRef(null);
  const [showInstall, setShowInstall]  = useState(false);

  window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt.current = e;
    setShowInstall(true);
  });

  const handleInstallToHomescreen = useCallback(() => {
    if(deferredPrompt.current) {
      deferredPrompt.current.prompt();
    }
  }, [deferredPrompt]);

  return(
    <div className={`install-wrapper ${showInstall ? 'active' : ''}`}>
      <div className="install">
        <div className="description">
          <ReactMarkdown>
            {t('homeInstallLine1')}
          </ReactMarkdown>

          <ReactMarkdown>
            {t('homeInstallLine2')}
          </ReactMarkdown>
        </div>

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

  const disclaimerLines = [1, 2, 3, 4, 5, 6].map((index) => {
    const line = `homeDisclaimerTextLine${index}`;

    return (
      <ReactMarkdown key={line}>
        {t(line)}
      </ReactMarkdown>
    );
  });

  return(
    <div className="column third_left text1">
      <div className="wrap">
        <div className="summary-section">
          <h2>
            {t('homeDisclaimerHeader')}
          </h2>

          <div>
            {disclaimerLines}
          </div>
        </div>

        <div className="summary-section">
          <h2>
            {t('homeAttributionHeader')}
          </h2>

          <div>
            <ReactMarkdown>
              {t('homeAttributionText')}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeColumnCenter() {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const handleOpenMelodyEditor = useCallback(() => {
    dispatch(melodyEditorDummy());
    dispatch(showMelodyEditor());
  }, [dispatch]);

  return(
    <div className="column third_center text2 tab">
      <div className="wrap">
        <div className="alert">
          <strong>
            Attention Bluejay users!
          </strong>

          <br />
          If you are still on 0.20.0, please upgrade to version 0.21.0 - there have been issues with stall detection and motor protection which might result in broken ESCs and/or motors.
        </div>

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
                BLHeli_S
              </a>
            </li>

            <li>
              <a
                href="https://github.com/bird-sanctuary/bluejay"
                rel="noreferrer"
                target="_blank"
              >
                Bluejay
              </a>
            </li>

            <li>
              <a
                href="https://github.com/am32-firmware/AM32"
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
            BLHeli_S
          </h3>

          <section>
            <div>
              <ReactMarkdown>
                {t('blhelisTextLine1')}
              </ReactMarkdown>

              <ReactMarkdown>
                {t('blhelisTextLine2')}
              </ReactMarkdown>
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
              <div>
                <ReactMarkdown>
                  {t('bluejayTextLine1')}
                </ReactMarkdown>

                <ReactMarkdown>
                  {t('bluejayTextLine2')}
                </ReactMarkdown>
              </div>

              <div className="default-btn melody-editor-button">
                <button
                  onClick={handleOpenMelodyEditor}
                  type="button"
                >
                  {t('openMelodyEditor')}
                </button>
              </div>

              <div>
                <ReactMarkdown>
                  {t('bluejaySupportedHardwareLine1')}
                </ReactMarkdown>

                <ReactMarkdown>
                  {t('bluejaySupportedHardwareLine2')}
                </ReactMarkdown>
              </div>
            </div>
          </section>
        </div>

        <div className="summary-section">
          <h3>
            AM32
          </h3>

          <section>
            <div>
              <ReactMarkdown>
                {t('blheli32ToAM32Line1')}
              </ReactMarkdown>

              <ReactMarkdown>
                {t('blheli32ToAM32Line2')}
              </ReactMarkdown>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function HomeColumnRight() {
  const { t } = useTranslation('common');
  const contributionItems = [1, 2, 3, 4, 5].map((index) => {
    const line = `homeContributionItem${index}`;

    return(
      <ReactMarkdown
        components={{ p: 'li' }}
        key={line}
      >
        {t(line)}
      </ReactMarkdown>
    );
  });

  return(
    <div className="column third_right text3">
      <div className="wrap">
        <div className="summary-section">
          <h2>
            {t('homeDiscordHeader')}
          </h2>

          <div>
            {t('homeDiscordText')}
          </div>

          <a
            className="discord-link"
            href="https://discord.gg/QvSS5dk23C"
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt="Discord"
              className="discord"
              src="https://img.shields.io/discord/822952715944460368?logo=discord&logoColor=ffffff&label=%20&color=7389D8"
            />
          </a>
        </div>

        <div className="summary-section">
          <h2>
            {t('homeChinaHeader')}
          </h2>

          <ReactMarkdown components={{ p: 'div' }}>
            {t('homeChinaText')}
          </ReactMarkdown>
        </div>

        <div className="summary-section">
          <h2>
            {t('homeContributionHeader')}
          </h2>

          <div>
            <ReactMarkdown components={{ p: 'div' }}>
              {t('homeContributionText')}
            </ReactMarkdown>

            <ul>
              {contributionItems}
            </ul>
          </div>
        </div>

        <div className="summary-section">
          <h3>
            {t('whatsNextHeader')}
          </h3>

          <section>
            <ReactMarkdown components={{ p: 'div' }}>
              {t('whatsNextText')}
            </ReactMarkdown>
          </section>
        </div>
      </div>
    </div>
  );
}

function Home() {
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
              >
                <ReactMarkdown components={{ p: 'span' }}>
                  {t('homeWelcome')}
                </ReactMarkdown>
              </div>

              <Install />

              <div>
                <div align="center">
                  <ReactMarkdown components={{ p: 'div' }}>
                    {t('betaWarningLine1')}
                  </ReactMarkdown>

                  <br />

                  <ReactMarkdown components={{ p: 'div' }}>
                    {t('betaWarningLine2')}
                  </ReactMarkdown>
                </div>

                <div align="center">
                  <ReactMarkdown components={{ p: 'div' }}>
                    {t('findHelp')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          <div className="content_mid">
            <HomeColumnLeft />

            <HomeColumnCenter />

            <HomeColumnRight />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;
