import React, {
  Component,
} from 'react';
import dateFormat from 'dateformat';
import TagManager from 'react-gtm-module';
import i18next from 'i18next';

import changelogEntries from '../../changelog.json';

import PortPicker from '../../Components/PortPicker';
import Log from '../../Components/Log';
import Statusbar from '../../Components/Statusbar';
import CookieConsent from '../../Components/CookieConsent';
import MainContent from '../../Components/MainContent';

import Serial from '../../utils/Serial';

import sources from '../../sources';

import {
  getMasterSettings,
} from '../../utils/helpers/Settings';

import {
  delay,
} from '../../utils/helpers/General';

import './style.scss';

import settings from '../../settings.json';
const {
  version,
  corsProxy,
} = settings;

class App extends Component {

  constructor() {
    super();

    // Action handlers passed down to components and triggered by them.
    this.handleSetPort = this.handleSetPort.bind(this);
    this.handleConnect = this.handleConnect.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
    this.handleSetBaudRate = this.handleSetBaudRate.bind(this);
    this.serialConnectHandler = this.serialConnectHandler.bind(this);
    this.serialDisconnectHandler = this.serialDisconnectHandler.bind(this);
    this.addLogMessage = this.addLogMessage.bind(this);
    this.handleReadEscs = this.handleReadEscs.bind(this);
    this.handleWriteSetup = this.handleWriteSetup.bind(this);
    this.handleSelectFirmwareForAll = this.handleSelectFirmwareForAll.bind(this);
    this.handleFlashUrl = this.handleFlashUrl.bind(this);
    this.handleResetDefaultls = this.handleResetDefaultls.bind(this);
    this.handleSettingsUpdate = this.handleSettingsUpdate.bind(this);
    this.handleSingleFlash = this.handleSingleFlash.bind(this);
    this.handleCancelFirmwareSelection = this.handleCancelFirmwareSelection.bind(this);
    this.handleIndividualSettingsUpdate = this.handleIndividualSettingsUpdate.bind(this);
    this.handlePacketErrors = this.handlePacketErrors.bind(this);
    this.handleLocalSubmit = this.handleLocalSubmit.bind(this);
    this.handleSaveLog = this.handleSaveLog.bind(this);
    this.handleCookieAccept = this.handleCookieAccept.bind(this);
    this.handleLanguageSelection = this.handleLanguageSelection.bind(this);
    this.handleChangePort = this.handleChangePort.bind(this);

    this.state = {
      checked: false,
      hasSerial: false,
      connected: false,
      open: false,
      baudRate: 115200,
      serialLog: [],
      settings: {},
      escs: [],
      flashTargets: [],
      progress: [],
      packetErrors: 0,
      serial: {
        availablePorts: [],
        chosenPort: null,
      },
      configs: {
        versions: {},
        escs: {},
        pwm: {},
        platforms: {},
      },
      actions: {
        isReading: false,
        isWriting: false,
        isSelecting: false,
        isFlashing: false,
      },
      language: 'en',
    };
  }

  async componentDidMount() {
    const that = this;
    this.onMount(async() => {
      const hasSerial = 'serial' in navigator;

      const language = localStorage.getItem('language');
      if(language) {
        i18next.changeLanguage(language);
        this.setState({ language });
      }

      // Redefine the console and tee logs
      var console = (function(old) {
        return Object.assign({}, old, {
          debug: (text, ...args) => {
            const msg = [text, args.join(' ')].join(' ');
            that.log.push(msg);
            old.debug(text, ...args);
          },
        });
      }(window.console));
      window.console = console;

      if (hasSerial) {
        navigator.serial.removeEventListener('connect', that.serialConnectHandler);
        navigator.serial.removeEventListener('disconnect', that.serialDisconnectHandler);

        navigator.serial.addEventListener('connect', that.serialConnectHandler);
        navigator.serial.addEventListener('disconnect', that.serialDisconnectHandler);

        // Fetch the configs only once.
        this.setState({ configs: await this.fetchConfigs() });

        await that.serialConnectHandler();
      } else {
        this.setState({ checked: true });
      }
    });
  }

  shouldComponentUpdate() {
    return true;
  }

  /**
   * All console.log output will be appended here.
   * It is not part of the state since we do not want to trigger updates
   * due to this being changed, it is only needed when the "Save Log" button
   * is clicked.
   */
  log = [];
  gtmActive = false;
  serial = null;
  lastConnected = 0;

  languages = [
    {
      label: "English",
      value: "en",
    },
    {
      label: "German",
      value: "de",
    }
  ];

  onMount(cb){
    cb();
  }

  async addLogMessage(message) {
    const { serialLog } = this.state;
    serialLog.push(this.formatLogMessage(message));

    await this.setState({ serialLog });
  }

  async fetchConfigs() {
    const { configs } = this.state;
    for(let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const name = source.getName();

      configs.versions[name] = await source.getVersions();
      configs.escs[name] = await source.getEscs();
      configs.platforms[name] = source.getPlatform();
      configs.pwm[name] = source.getPwm();
    }

    return configs;
  }

  handlePacketErrors(count) {
    const { packetErrors } = this.state;
    this.setState({ packetErrors: packetErrors + count });
  }

  handleSettingsUpdate(settings) {
    this.setState({ settings });
  }

  handleIndividualSettingsUpdate(index, individualSettings) {
    const  { escs } = this.state;
    escs[index].individualSettings = individualSettings;

    this.setState({ escs });
  }

  async handleResetDefaultls() {
    TagManager.dataLayer({ dataLayer: { event: "Restoring Defaults" } });

    const {
      escs,
      actions,
    } = this.state;

    actions.isWriting = true;
    this.setState({ actions });
    for(let i = 0; i < escs.length; i += 1) {
      console.debug(`Restoring default settings on ESC ${i} `);

      const esc = escs[i];
      const currentEscSettings = esc.settings;
      const defaultSettings = esc.defaultSettings;
      const mergedSettings = Object.assign({}, currentEscSettings, defaultSettings);
      await this.serial.fourWayWriteSettings(i, esc, mergedSettings);
    }

    actions.isWriting = false;
    this.setState({ actions });

    this.handleReadEscs();
  }

  handleSaveLog() {
    const element = document.createElement("a");
    const file = new Blob([this.log.join("\n")], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "esc-configurator-log.txt";
    document.body.appendChild(element);
    element.click();
  }

  formatLogMessage(html) {
    const now = new Date();
    const formatted = dateFormat(now, 'yyyy-mm-dd @ HH:MM:ss -- ');

    return (
      <div>
        <span className="date">
          {formatted}
        </span>

        {html}
      </div>
    );
  }

  handleLocalSubmit(e, force, migrate) {
    e.preventDefault();
    TagManager.dataLayer({ dataLayer: { event: "Flashing local file" } });

    const reader = new FileReader();
    reader.onload = async (e) => {
      console.debug(`Flashing local file`);

      const text = (e.target.result);
      this.flash(text, force, migrate);
    };
    reader.readAsText(e.target.files[0]);
  }

  async handleReadEscs() {
    TagManager.dataLayer({ dataLayer: { event: "Reading ESC's" } });

    const {
      progress, actions
    } = this.state;

    actions.isReading = true;
    this.setState({ actions });
    this.addLogMessage('Reading ESC\'s');

    // Enable 4way if
    let connected = 0;
    try {
      if(this.lastConnected === 0) {
        const escs = await this.serial.enable4WayInterface();

        connected = 0;
        if(escs) {
          connected = escs.connectedESCs;
        }

        this.serial.fourWayStart();
      } else {
        connected = this.lastConnected;
      }
    } catch(e) {
      console.debug(e);
      this.addLogMessage('Could not enable 4 way interface - reconnect flight controller');
    }

    const escFlash = [];
    let open = false;
    console.debug(`Getting info for ${connected} ESC's`);
    await delay(1000);
    try {
      for (let i = 0; i < connected; i += 1) {
        progress[i] = 0;
        const settings = await this.serial.fourWayGetInfo(i);
        if(settings) {
          escFlash.push(settings);
        }
      }
      open = true;

      this.addLogMessage('Done reading ESC\'s');
    } catch(e) {
      console.debug(e);
      this.addLogMessage('Failed reading ESC\'s');
    }

    const masterSettings = getMasterSettings(escFlash);

    this.lastConnected = connected;
    actions.isReading = false;
    this.setState({
      open,
      escs: escFlash,
      settings: masterSettings,
      progress,
      actions,
    });
  }

  async handleWriteSetup() {
    TagManager.dataLayer({ dataLayer: { event: "Writing Setup" } });

    const {
      escs,
      settings,
      actions,
    } = this.state;

    actions.isWriting = true;
    this.setState({ actions });
    for(let i = 0; i < escs.length; i += 1) {
      console.debug(`Writing settings to ESC ${i} `);

      const esc = escs[i];
      const currentEscSettings = esc.settings;
      const individualEscSettings = esc.individualSettings;
      const mergedSettings = Object.assign({}, currentEscSettings, settings, individualEscSettings);
      const newSettingsArray = await this.serial.fourWayWriteSettings(i, esc, mergedSettings);

      escs[i].settingsArray = newSettingsArray;
    }

    actions.isWriting = false;
    this.setState({
      actions,
      escs,
    });
  }

  handleSingleFlash(index) {
    const { actions } = this.state;
    actions.isSelecting = true;
    this.setState({
      actions,
      flashTargets: [index],
    });
  }

  handleSelectFirmwareForAll() {
    const {
      escs,
      actions,
    } = this.state;

    const flashTargets = [];
    for (let i = 0; i < escs.length; i += 1) {
      flashTargets.push(i);
    }

    actions.isSelecting = true;
    this.setState({
      flashTargets,
      actions,
    });
  }

  handleCancelFirmwareSelection() {
    const { actions } = this.state;
    actions.isSelecting = false,
    this.setState({
      flashTargets: [],
      actions,
    });
  }

  /**
   * Acquires the hex file from an URL. Before doing so, the local storage is
   * checked if the file already exists there, it is used, otherwise it is
   * downloaded and put into local storage for later use.
   */
  async handleFlashUrl(url, force, migrate) {
    TagManager.dataLayer({
      dataLayer: {
        event: "Flashing ESC's",
        hex: url,
        force,
      },
    });

    let text = null;
    if (typeof Storage !== "undefined") {
      text = localStorage.getItem(url);

      if(text) {
        console.debug('Got file from local storage');
      }
    }

    if(!text) {
      try {
        console.debug(`Fetching firmware from ${url} `);
        // TODO: In case of ATMEL an eep needs to be fetched

        // Proxy is needed to bypass CORS on github
        const proxy = `${corsProxy}${url}`;
        const response = await fetch(proxy);

        if(response.ok) {
          text = await response.text();

          if (typeof Storage !== "undefined") {
            localStorage.setItem(url, text);
            console.debug('Saved file to local storage');
          }
        }
      } catch(e) {
        console.debug('Failed fetching firmware');
      }
    }

    if(text) {
      await this.flash(text, force, migrate);
    } else {
      const error = 'Could not get file for flashing.';
      console.debug(error);
      this.addLogMessage(error);
    }
  }

  async flash(text, force, migrate) {
    const {
      flashTargets, escs, progress, actions
    } = this.state;

    actions.isSelecting = false;
    actions.isFlashing = true;
    this.setState({ actions });

    let newProgress = progress;
    for(let i = 0; i < flashTargets.length; i += 1) {
      console.debug(`Flashing ESC ${i}`);

      const target = flashTargets[i];
      const esc = escs[target];
      newProgress[target] = 0;

      const updateProgress = async(progress) => {
        newProgress[target] = progress;
        await this.setState({ progress: newProgress });
      };

      const result = await this.serial.fourWayWriteHex(target, esc, text, force, migrate, updateProgress);
      escs[target] = result;

      newProgress[target] = 0;
      await this.setState({ escs });
    }

    actions.isSelecting = false;
    actions.isFlashing = false;
    await this.setState({
      settings: getMasterSettings(escs),
      progress: newProgress,
      actions
    });
  }

  async serialConnectHandler() {
    /**
     * If we are here, the user has already given permission to access the
     * device - mark  conncted
     */
    let connected = false;
    this.serial = null;
    const ports = await navigator.serial.getPorts();
    if(ports.length > 0) {
      TagManager.dataLayer({ dataLayer: { event: "Plugged in" } });
      this.addLogMessage('Plugged in');
      connected = true;

      // Set the first  serial port as the active one
      this.serial = new Serial(ports[0]);
    }

    this.setState({
      checked: true,
      hasSerial: true,
      connected,
      serial: { availablePorts: ports },
    });
  }

  async serialDisconnectHandler() {
    TagManager.dataLayer({ dataLayer: { event: "Unplugged" } });
    this.addLogMessage('Unplugged');
    this.lastConnected = 0;

    const ports = await navigator.serial.getPorts();
    this.setState({
      connected: ports.length > 0 ? true : false,
      open: false,
      escs: [],
      serial: {
        availablePorts: ports,
        chosenPort: null,
      }
    });

    this.serial.disconnect();
  }

  async handleSetPort() {
    try {
      const port = await navigator.serial.requestPort();
      this.serial = new Serial(port);

      this.addLogMessage('Port selected');

      this.setState({
        connected: true,
        serial: { availablePorts: [port] },
      });
    } catch (e) {
      // No port selected, do nothing
      console.debug(e);
    }
  }

  handleChangePort(index) {
    const { serial } = this.state;
    serial.chosenPort = serial.availablePorts[index];
    this.serial = new Serial(serial.chosenPort);

    this.addLogMessage('Port changed');

    this.setState({ serial });
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  handleSetBaudRate(rate) {
    this.setState({ baudRate: rate });
  }

  async handleConnect(e) {
    e.preventDefault();
    TagManager.dataLayer({ dataLayer: { event: "Connect" } });

    const { baudRate } = this.state;

    try {
      await this.serial.open(baudRate);
      this.serial.setLogCallback(this.addLogMessage);
      this.serial.setPacketErrorsCallback(this.handlePacketErrors);
      this.addLogMessage('Opened serial port');
    } catch (e) {
      console.debug(e);

      try {
        this.serial.close();
      } catch(e) {
        console.debug(e);
      }

      this.addLogMessage('Port already in use by another application - try re-connecting');

      return;
    }

    const apiVersion = await this.serial.getApiVersion();
    const apiVersionElement = (
      <>
        MultiWii API version
        {' '}

        <span className="message-positive">
          received
        </span>

        {' '}
        -

        {' '}

        <strong>
          {apiVersion.apiVersion}
        </strong>
      </>
    );
    this.addLogMessage(apiVersionElement);

    const fcVariant = await this.serial.getFcVariant();
    const fcVersion = await this.serial.getFcVersion();
    const fcInfoElement = (
      <>
        Flight controller info, identifier:
        {' '}

        <strong>
          {fcVariant.flightControllerIdentifier}
        </strong>

        {' '}

        version:
        <strong>
          {fcVersion.flightControllerVersion}
        </strong>
      </>
    );
    this.addLogMessage(fcInfoElement);

    const buildInfo = await this.serial.getBuildInfo();
    const buildInfoElement = (
      <>
        Running firmware released on:

        {' '}

        <strong>
          {buildInfo.buildInfo}
        </strong>
      </>
    );
    this.addLogMessage(buildInfoElement);

    const boardInfo = await this.serial.getBoardInfo();
    const boardInfoElement = (
      <>
        Board:

        {' '}

        <strong>
          {boardInfo.boardIdentifier}
        </strong>
        ,

        {' '}

        version:
        <strong>
          {boardInfo.boardVersion}
        </strong>
      </>
    );
    this.addLogMessage(boardInfoElement);

    let uid = await this.serial.getUid();
    uid = uid.uid;
    let uidHex = 0;
    for (let i = 0; i < uid.length; i += 1) {
      uidHex += uid[i].toString(16);
    }
    const uidElement = (
      <>
        Unique device ID

        {' '}

        <span className="message-positive">
          received
        </span>

        {' '}
        -

        {' '}

        <strong>
          0x
          {uidHex}
        </strong>
      </>
    );
    this.addLogMessage(uidElement);

    await this.setState({ open: true });
  }

  async handleDisconnect(e) {
    e.preventDefault();
    TagManager.dataLayer({ dataLayer: { event: "Disconnect" } });

    const { escs } = this.state;
    if(this.serial) {
      for(let i = 0; i < escs.length; i += 1) {
        await this.serial.fourWayReset(i);
      }

      this.serial.close();
    }

    this.addLogMessage('Closed port');
    this.lastConnected = 0;

    this.setState({
      open: false,
      escs: [],
    });
  }

  handleCookieAccept() {
    if(!this.gtmActive) {
      const tagManagerArgs = { gtmId: process.env.REACT_APP_GTM_ID };
      TagManager.initialize(tagManagerArgs);

      this.gtmActive = true;
    }
  }

  handleLanguageSelection(e) {
    const language = e.target.value;
    localStorage.setItem('language', language);
    i18next.changeLanguage(language);
    this.setState({ language });
  }



  render() {
    const {
      checked,
      hasSerial,
      connected,
      open,
      serialLog,
      packetErrors,
      escs,
      settings,
      actions,
      progress,
      configs,
      flashTargets,
      language,
      serial,
    } = this.state;

    if (!checked) {
      return null;
    }

    if (!hasSerial) {
      return (
        <div id="not-supported">
          Sorry,
          {' '}

          <b>
            Web Serial
          </b>

          {' '}
          is not supported on this device,
          make sure you&apos;re running Chrome 78 or later and have enabled the

          <code>
            #enable-experimental-web-platform-features
          </code>

          {' '}
          flag in &nbsp;

          <code>
            chrome://flags
          </code>

          <br />

          <br />

          <p>
            Alternatively download the latest

            {' '}

            <a
              href="https://www.google.com/intl/de/chrome/"
              rel="noreferrer"
              target="_blank"
            >
              Chrome stable release
            </a>

            {' '}

            where this feature is already enabled by default.
          </p>
        </div>
      );
    }

    const languageElements = this.languages.map((item) => (
      <option
        key={item.value}
        value={item.value}
      >
        {item.label}
      </option>
    ));

    return (
      <div className="App">
        <div id="main-wrapper">
          <div className="header-wrapper">
            <div className="headerbar">
              <div id="logo" />

              <PortPicker
                hasPort={connected}
                onChangePort={this.handleChangePort}
                onConnect={this.handleConnect}
                onDisconnect={this.handleDisconnect}
                onSetBaudRate={this.handleSetBaudRate}
                onSetPort={this.handleSetPort}
                open={open}
                ports={serial.availablePorts}
              />

              <div className="language-select ">
                <div className="dropdown dropdown-dark">
                  <select
                    className="dropdown-select"
                    defaultValue={language}
                    onChange={this.handleLanguageSelection}
                  >
                    {languageElements}
                  </select>
                </div>
              </div>
            </div>

            <div className="clear-both" />

            <Log
              messages={serialLog}
            />
          </div>

          <MainContent
            actions={actions}
            changelogEntries={changelogEntries}
            configs={configs}
            escs={escs}
            flashTargets={flashTargets}
            onCancelFirmwareSelection={this.handleCancelFirmwareSelection}
            onFlashUrl={this.handleFlashUrl}
            onIndividualSettingsUpdate={this.handleIndividualSettingsUpdate}
            onLocalSubmit={this.handleLocalSubmit}
            onReadEscs={this.handleReadEscs}
            onResetDefaultls={this.handleResetDefaultls}
            onSaveLog={this.handleSaveLog}
            onSelectFirmwareForAll={this.handleSelectFirmwareForAll}
            onSettingsUpdate={this.handleSettingsUpdate}
            onSingleFlash={this.handleSingleFlash}
            onWriteSetup={this.handleWriteSetup}
            open={open}
            progress={progress}
            settings={settings}
          />

          <Statusbar
            getUtilization={this.serial ? this.serial.getUtilization : null}
            packetErrors={packetErrors}
            version={version}
          />
        </div>

        <CookieConsent
          onCookieAccept={this.handleCookieAccept}
        />
      </div>
    );
  }
}

export default App;
