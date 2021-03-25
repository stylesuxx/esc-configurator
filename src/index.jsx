import React, {
  Suspense,
} from 'react';
import ReactDOM from 'react-dom';
import App from './Containers/App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import {
  I18nextProvider,
} from 'react-i18next';
import i18next from 'i18next';

import CommonEn from './translations/en/common.json';
import HintsEn from './translations/en/hints.json';
import SettingsEn from './translations/en/settings.json';
import LogEn from './translations/en/log.json';

import CommonDe from './translations/de/common.json';
import HintsDe from './translations/de/hints.json';
import SettingsDe from './translations/de/settings.json';
import LogDe from './translations/de/log.json';

i18next.init({
  interpolation: { excapeValue: false },
  lng: 'en',
  resources: {
    en: {
      common: CommonEn,
      hints: HintsEn,
      log: LogEn,
      settings: SettingsEn,
    },
    de: {
      common: CommonDe,
      hints: HintsDe,
      log: LogDe,
      settings: SettingsDe,
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <Suspense fallback="loading">
        <App />
      </Suspense>
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

/*
 * If you want your app to work offline and load faster, you can change
 * unregister() to register() below. Note this comes with some pitfalls.
 * Learn more about service workers: https://cra.link/PWA
 */
serviceWorkerRegistration.register();

/*
 * If you want to start measuring performance in your app, pass a function
 * to log results (for example: reportWebVitals(console.log))
 * or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
 */
reportWebVitals();
