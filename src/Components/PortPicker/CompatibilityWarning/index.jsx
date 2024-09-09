import React from 'react';

import './style.scss';

function CompatibilityWarning() {
  return (
    <div id="not-supported">
      <b>
        Web Serial
      </b>

      {' '}
      is not supported on your browser, install 
      
      {' '}
      <a
        href="https://github.com/kuba2k2/firefox-webserial"
        rel="noreferrer"
        target="_blank"
      >
        firefox webserial
      </a>
      . Or switch to an up to date Chromium based browser like

      {' '}

      <a
        href="https://www.google.com/intl/de/chrome/"
        rel="noreferrer"
        target="_blank"
      >
        Chrome
      </a>

      {', '}

      <a
        href="https://vivaldi.com/download/"
        rel="noreferrer"
        target="_blank"
      >
        Vivaldi
      </a>

      {', '}

      <a
        href="https://www.microsoft.com/edge/"
        rel="noreferrer"
        target="_blank"
      >
        Edge
      </a>

      {' '}

      or any other

      {' '}

      <a
        href="https://caniuse.com/mdn-api_serial"
        rel="noreferrer"
        target="_blank"
      >
        compatible browser.
      </a>
    </div>
  );
}

export default CompatibilityWarning;
