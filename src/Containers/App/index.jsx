import React, {
  Component,
} from 'react';
import dateFormat from 'dateformat';
import TagManager from 'react-gtm-module';

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

import './style.css';

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

    this.state = {
      lastConnected: 0,
      isReading: false,
      isWriting: false,
      isSelecting: false,
      isFlashing: false,
      checked: false,
      hasSerial: false,
      connected: false,
      open: false,
      baudRate: 115200,
      serialLog: [],
      serial: null,
      settings: {},
      escs: [],
      flashTargets: [],
      progress: [],
      packetErrors: 0,
      configs: {
        versions: {},
        escs: {},
        pwm: {},
      },
    };
  }

  async componentDidMount() {
    const that = this;
    this.onMount(async() => {
      const hasSerial = 'serial' in navigator;

      // Redefine the console and tee logs
      var console = (function(old) {
        return {
          log: (text, ...args) => {
            const msg = [text, args.join(' ')].join(' ');
            that.log.push(msg);
            old.log(text, ...args);
          },
          debug: (text, ...args) => {
            const msg = [text, args.join(' ')].join(' ');
            that.log.push(msg);
            old.debug(text, ...args);
          },
          info: (text) => {
            that.log.push(text);
            old.info(text);
          },
          warn: (text) => {
            that.log.push(text);
            old.warn(text);
          },
          error: (text) => {
            that.log.push(text);
            old.error(text);
          }
        };
      }(window.console));
      window.console = console;

      if (hasSerial) {
        navigator.serial.removeEventListener('connect', that.serialConnectHandler);
        navigator.serial.removeEventListener('disconnect', that.serialDisconnectHandler);

        navigator.serial.addEventListener('connect', that.serialConnectHandler);
        navigator.serial.addEventListener('disconnect', that.serialDisconnectHandler);


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
      configs.pwm[name] = await source.getPwm();
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

  handleResetDefaultls() {
    // TODO: Allow resetting the settings to defaults
    console.log('Reset default handler not implemented');
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

  handleLocalSubmit(e, force) {
    e.preventDefault();
    TagManager.dataLayer({ dataLayer: { event: "Flashing local file" } });

    const reader = new FileReader();
    reader.onload = async (e) => {
      console.debug(`Flashing local file`);

      const text = (e.target.result);
      this.flash(text, force);
    };
    reader.readAsText(e.target.files[0]);
  }

  async handleReadEscs() {
    TagManager.dataLayer({ dataLayer: { event: "Reading ESC's" } });

    const {
      serial, serialLog, lastConnected, progress,
    } = this.state;

    serialLog.push(this.formatLogMessage('Reading ESC\'s'));
    this.setState({
      serialLog,
      isReading: true,
    });

    // Enable 4way if
    let connected = 0;
    try {
      if(lastConnected === 0) {
        const escs = await serial.enable4WayInterface();

        connected = 0;
        if(escs) {
          connected = escs.connectedESCs;
        }

        serial.fourWayStart();
      } else {
        connected = lastConnected;
      }
    } catch(e) {
      console.debug(e);
      serialLog.push(this.formatLogMessage('Could not enable 4 way interface - reconnect flight controller'));
      this.setState({ serialLog });
    }

    const escFlash = [];
    let open = false;
    console.debug(`Getting info for ${connected} ESC's`);
    try {
      for (let i = 0; i < connected; i += 1) {
        progress[i] = 0;
        const settings = await serial.fourWayGetInfo(i);
        if(settings) {
          escFlash.push(settings);
        }
      }
      open = true;

      serialLog.push(this.formatLogMessage('Done reading ESC\'s'));
    } catch(e) {
      console.debug(e);
      serialLog.push(this.formatLogMessage('Failed reading ESC\'s'));
    }

    const masterSettings = getMasterSettings(escFlash);

    this.setState({
      open,
      serialLog,
      escs: escFlash,
      settings: masterSettings,
      isReading: false,
      lastConnected: connected,
      progress,
    });
  }

  async handleWriteSetup() {
    TagManager.dataLayer({ dataLayer: { event: "Writing Setup" } });

    const {
      serial,
      escs,
      settings,
    } = this.state;

    await this.setState({ isWriting: true });
    for(let i = 0; i < escs.length; i += 1) {
      console.debug(`Writing settings to ESC ${i} `);

      const esc = escs[i];
      const currentEscSettings = esc.settings;
      const individualEscSettings = esc.individualSettings;
      console.log(currentEscSettings, settings, individualEscSettings);
      const mergedSettings = Object.assign({}, currentEscSettings, settings, individualEscSettings);
      const newSettingsArray = await serial.fourWayWriteSettings(i, esc, mergedSettings);

      escs[i].settingsArray = newSettingsArray;
    }

    this.setState({
      isWriting: false,
      escs,
    });
  }

  handleSingleFlash(index) {
    this.setState({
      flashTargets: [index],
      isSelecting: true,
    });
  }

  handleSelectFirmwareForAll() {
    const { escs } = this.state;

    const flashTargets = [];
    for (let i = 0; i < escs.length; i += 1) {
      flashTargets.push(i);
    }

    this.setState({
      isSelecting: true,
      flashTargets,
    });
  }

  handleCancelFirmwareSelection() {
    this.setState({
      flashTargets: [],
      isSelecting: false,
    });
  }

  /**
   * Acquires the hex file from an URL. Before doing so, the local storage is
   * checked if the file already exists there, it is used, otherwise it is
   * downloaded and put into local storage for later use.
   */
  async handleFlashUrl(url, force) {
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
      await this.flash(text, force);
    } else {
      this.addLogMessage('Could not get file for flashing');
    }
  }

  async flash(text, force) {
    const {
      flashTargets, serial, escs, progress,
    } = this.state;

    await this.setState({
      isSelecting: false,
      isFlashing: true,
    });

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

      const result = await serial.fourWayWriteHex(target, esc, text, force, updateProgress);
      escs[target] = result;

      newProgress[target] = 0;
      await this.setState({ escs });
    }

    await this.setState({
      isSelecting: false,
      isFlashing: false,
      settings: getMasterSettings(escs),
      progress: newProgress,
    });
  }

  async serialConnectHandler() {
    /**
     * If we are here, the user has already given permission to access the
     * device - mark  conncted
     */
    let connected = false;
    let serial = false;
    const ports = await navigator.serial.getPorts();
    if(ports.length > 0) {
      TagManager.dataLayer({ dataLayer: { event: "Plugged in" } });
      this.addLogMessage('Plugged in');
      connected = true;

      serial = new Serial(ports[0]);
    }

    this.setState({
      checked: true,
      hasSerial: true,
      connected,
      serial,
      configs: await this.fetchConfigs(),
    });
  }

  serialDisconnectHandler() {
    const { serial } = this.state;
    TagManager.dataLayer({ dataLayer: { event: "Unplugged" } });
    this.addLogMessage('Unplugged');
    this.setState({
      connected: false,
      open: false,
      escs: [],
      lastConnected: 0,
    });

    serial.disconnect();
  }

  async handleSetPort() {
    try {
      const { serialLog } = this.state;
      const port = await navigator.serial.requestPort();
      const serial = new Serial(port);

      serialLog.push(this.formatLogMessage('Port selected'));

      this.setState({
        serialLog,
        connected: true,
        serial,
      });
    } catch (e) {
      // No port selected, do nothing
      console.debug(e);
    }
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

    const {
      serial,
      baudRate,
      serialLog,
    } = this.state;

    try {
      await serial.open(baudRate);
      serial.setLogCallback(this.addLogMessage);
      serial.setPacketErrorsCallback(this.handlePacketErrors);
      serialLog.push(this.formatLogMessage('Opened serial port'));
    } catch (e) {
      console.debug(e);

      const {
        serialLog, serial,
      } = this.state;
      try {
        serial.close();
      } catch(e) {
        console.debug(e);
      }

      serialLog.push(
        this.formatLogMessage(
          'Port already in use by another application - try re-connecting'));

      this.setState({ serialLog });

      return;
    }

    const apiVersion = await serial.getApiVersion();
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
    serialLog.push(this.formatLogMessage(apiVersionElement));

    const fcVariant = await serial.getFcVariant();
    const fcVersion = await serial.getFcVersion();
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
    serialLog.push(this.formatLogMessage(fcInfoElement));

    const buildInfo = await serial.getBuildInfo();
    const buildInfoElement = (
      <>
        Running firmware released on:

        {' '}

        <strong>
          {buildInfo.buildInfo}
        </strong>
      </>
    );
    serialLog.push(this.formatLogMessage(buildInfoElement));

    const boardInfo = await serial.getBoardInfo();
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
    serialLog.push(this.formatLogMessage(boardInfoElement));

    let uid = await serial.getUid();
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
    serialLog.push(this.formatLogMessage(uidElement));

    await this.setState({
      open: true,
      serialLog,
    });
  }

  async handleDisconnect(e) {
    e.preventDefault();
    TagManager.dataLayer({ dataLayer: { event: "Disconnect" } });

    const {
      serial,
      escs
    } = this.state;
    if(serial) {
      for(let i = 0; i < escs.length; i += 1) {
        await serial.fourWayReset(i);
      }

      serial.close();
    }

    this.addLogMessage('Closed port');

    this.setState({
      open: false,
      escs: [],
      lastConnected: 0,
    });
  }

  handleCookieAccept() {
    if(!this.gtmActive) {
      const tagManagerArgs = { gtmId: process.env.REACT_APP_GTM_ID };
      TagManager.initialize(tagManagerArgs);

      this.gtmActive = true;
    }
  }

  render() {
    const {
      checked,
      hasSerial,
      connected,
      open,
      serialLog,
      packetErrors,
      serial,
      escs,
      settings,
      isReading,
      isWriting,
      progress,
      isSelecting,
      isFlashing,
      configs,
      flashTargets,
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

    return (
      <div className="App">
        <div id="main-wrapper">
          <div className="header-wrapper">
            <div className="headerbar">
              <div id="logo">
                <div className="logo_text" />
              </div>

              <PortPicker
                hasPort={connected}
                onConnect={this.handleConnect}
                onDisconnect={this.handleDisconnect}
                onSetBaudRate={this.handleSetBaudRate}
                onSetPort={this.handleSetPort}
                open={open}
              />
            </div>

            <div className="clear-both" />

            <Log
              messages={serialLog}
            />
          </div>

          <MainContent
            changelogEntries={changelogEntries}
            configs={configs}
            escs={escs}
            flashTargets={flashTargets}
            isFlashing={isFlashing}
            isReading={isReading}
            isSelecting={isSelecting}
            isWriting={isWriting}
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
            getUtilization={serial ? serial.getUtilization : null}
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
