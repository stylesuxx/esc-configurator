import React, {
  Component,
} from 'react';
import dateFormat from 'dateformat';

import {
  CookieBanner
} from '@palmabit/react-cookie-law';

import Home from '../../Components/Home';
import Flash from '../../Components/Flash';
import PortPicker from '../../Components/PortPicker';
import Log from '../../Components/Log';
import Buttonbar from '../../Components/Buttonbar';
import FirmwareSelector from '../../Components/FirmwareSelector';
import Statusbar from '../../Components/Statusbar';

import Serial from '../../utils/Serial';

import sources from '../../sources';

import {
  getMasterSettings,
} from '../../utils/Settings';

import './style.css';

import settings from '../../settings.json';
const {
  version,
  corsProxy,
} = settings;

class App extends Component {

  constructor() {
    super();

    this.handleSetPort = this.handleSetPort.bind(this);
    this.handleConnect = this.handleConnect.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
    this.handleSetBaudRate = this.handleSetBaudRate.bind(this);
    this.serialConnectHandler = this.serialConnectHandler.bind(this);
    this.serialDisconnectHandler = this.serialDisconnectHandler.bind(this);
    this.addLogMessage = this.addLogMessage.bind(this);

    // Action handlers passed down to components and triggered by them.
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
      individualSettings: [],
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

        const configs = await that.fetchConfigs();

        await this.setState({
          checked: true,
          hasSerial: true,
          configs,
        });

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

  handleIndividualSettingsUpdate(index, settings) {
    const  { individualSettings } = this.state;
    individualSettings[index] = settings;

    this.setState({ individualSettings });
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

    const reader = new FileReader();
    reader.onload = async (e) => {
      console.debug(`Flashing local file`);

      const text = (e.target.result);
      this.flash(text, force);
    };
    reader.readAsText(e.target.files[0]);
  }

  async handleReadEscs(e) {
    e.preventDefault();
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
        await this.delay(500);
        const escs = await serial.enable4WayInterface();

        connected = 0;
        if(escs) {
          connected = escs.connectedESCs;
        }

        await this.delay(250);
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

    this.setState({
      open,
      serialLog,
      escs: escFlash,
      settings: getMasterSettings(escFlash),
      isReading: false,
      lastConnected: connected,
      progress,
    });
  }

  async handleWriteSetup(e) {
    e.preventDefault();

    const {
      serial,
      escs,
      settings,
      individualSettings,
    } = this.state;

    await this.setState({ isWriting: true });
    for(let i = 0; i < escs.length; i += 1) {
      console.debug(`Writing settings to ESC ${i} `);

      const esc = escs[i];
      const currentEscSettings = esc.settings;
      const customSettings = individualSettings[i];
      const mergedSettings = Object.assign({}, settings, currentEscSettings, customSettings);
      await serial.fourWayWriteSettings(i, esc, mergedSettings);
    }

    this.setState({ isWriting: false });
  }

  handleSingleFlash(index) {
    this.setState({
      flashTargets: [index],
      isSelecting: true,
    });
  }

  handleSelectFirmwareForAll(e) {
    e.preventDefault();
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

    for(let i = 0; i < flashTargets.length; i += 1) {
      console.debug(`Flashing ESC ${i}`);

      const target = flashTargets[i];
      const newProgress = progress;
      const esc = escs[target];
      newProgress[target] = 0;

      const updateProgress = async(progress) => {
        newProgress[target] = progress;
        await this.setState({ progress: newProgress });
      };

      // await this.setState({ progress: newProgress });

      const result = await serial.fourWayWriteHex(target, esc, text, force, updateProgress);
      escs[target] = result;

      newProgress[target] = 0;
      await this.setState({
        progress: newProgress,
        escs,
      });
    }

    await this.setState({
      isSelecting: false,
      isFlashing: false,
    });
  }

  async serialConnectHandler() {
    /**
     * If we are here, the user has already given permission to access the
     * device - mark  conncted
     */
    const ports = await navigator.serial.getPorts();
    if(ports.length > 0) {
      this.addLogMessage('Plugged in');

      const serial = new Serial(ports[0]);

      this.setState({
        connected: true,
        serial,
      });
    }
  }

  serialDisconnectHandler() {
    const { serial } = this.state;
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
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', process.env.REACT_APP_GTAG_ID);
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
        </div>
      );
    }

    const MainContent = () => {
      const {
        open,
        escs,
        isReading,
        isWriting,
        isSelecting,
        isFlashing,
        settings,
        progress,
      } = this.state;

      const canWrite = (escs.length > 0) && !isSelecting && settings && !isFlashing && !isReading;
      const canFlash = (escs.length > 0) && !isSelecting && !isWriting && !isFlashing && !isReading;
      const canRead = !isReading && !isWriting && !isSelecting && !isFlashing;
      const canResetDefaults = false;

      if (!open) {
        return <Home />;
      }

      if (isSelecting) {
        const {
          configs, flashTargets, escs,
        } = this.state;
        const esc = escs[flashTargets[0]];

        return (
          <div className="tab-esc toolbar_fixed_bottom">
            <div className="content_wrapper">
              <FirmwareSelector
                configs={configs}
                escHint={esc.settings.LAYOUT}
                onCancel={this.handleCancelFirmwareSelection}
                onLocalSubmit={this.handleLocalSubmit}
                onSubmit={this.handleFlashUrl}
                signatureHint={esc.meta.signature}
              />
            </div>
          </div>
        );
      }

      return (
        <div className="tab-esc toolbar_fixed_bottom">
          <div className="content_wrapper">
            <Flash
              availableSettings={settings}
              canFlash={canFlash}
              escs={escs}
              flashProgress={progress}
              onFlash={this.handleSingleFlash}
              onIndividualSettingsUpdate={this.handleIndividualSettingsUpdate}
              onSettingsUpdate={this.handleSettingsUpdate}
            />
          </div>

          <Buttonbar
            canFlash={canFlash}
            canRead={canRead}
            canResetDefaults={canResetDefaults}
            canWrite={canWrite}
            onReadSetup={this.handleReadEscs}
            onResetDefaults={this.handleResetDefaultls}
            onSaveLog={this.handleSaveLog}
            onSeletFirmwareForAll={this.handleSelectFirmwareForAll}
            onWriteSetup={this.handleWriteSetup}
          />
        </div>
      );
    };

    return (
      <div className="App">
        <div id="main-wrapper">
          <div className="header-wrapper">
            <div className="headerbar">
              <div id="logo">
                <div className="logo_text" />
              </div>

              {/*
              <a
                href="#"
                i18n_title="optionsTitle"
                id="options"
              />
              */}

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

          <div id="content">
            <MainContent />
          </div>

          <Statusbar
            getUtilization={serial ? serial.getUtilization : null}
            packetErrors={packetErrors}
            version={version}
          />
        </div>

        <CookieBanner
          message="This site or third-party tools used by this site make use of cookies necessary for the operation and useful for the purposes outlined in the cookie policy. By accepting, you consent to the use of cookies."
          onAccept={this.handleCookieAccept}
          privacyPolicyLinkText=""
          styles={{
            dialog: {
              bottom: 0,
              top: 'auto',
              position: 'fixed',
              width: '100%',
              paddingBottom: '20px',
              paddingTop: '20px',
              background: 'white',
              borderTop: 'solid 2px black',
            },
            message: {
              fontSize: '16px',
              marginBottom: '10px',
            },
            button: {
              padding: '7px',
              margin: '5px',
              cursor: 'pointer',
              background: 'black',
              color: 'white',
            },
            policy: {
              display: 'inline-block',
              lineHeight: '30px',
              fontSize: '14px'
            }
          }}
        />
      </div>
    );
  }
}

export default App;
