/* istanbul ignore file */

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { store } from './store';
import settings from './settings.json';
import App from './Containers/App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';

const languages = settings.availableLanguages.map((language) => language.value);
const resources = {};
languages.forEach((language) => {
  resources[language] = {
    common: require(`./translations/${language}/common.json`),
    groups: require(`./translations/${language}/groups.json`),
    hints: require(`./translations/${language}/hints.json`),
    log: require(`./translations/${language}/log.json`),
    settings: require(`./translations/${language}/settings.json`),
  };
});

i18next.init({
  interpolation: { escapeValue: false },
  lng: settings.defaultLanguage,
  resources,
});

ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <Suspense fallback="loading">
        <Provider store={store}>
          <App />
        </Provider>
      </Suspense>
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById('root')
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
