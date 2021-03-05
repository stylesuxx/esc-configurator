import React, {
  Component,
} from 'react';
import dateFormat from 'dateformat';

import Home from '../../Components/Home';
import Flash from '../../Components/Flash';
import PortPicker from '../../Components/PortPicker';
import Log from '../../Components/Log';
import Buttonbar from '../../Components/Buttonbar';
import FirmwareSelector from '../../Components/FirmwareSelector';

import Serial from '../../utils/Serial';
import {
  BLHELI_TYPES,
} from '../../utils/Blheli';
import {
  BLHELI_VERSIONS_REMOTE,
} from '../../utils/sources/Blheli';
import {
  BLUEJAY_VERSIONS_REMOTE,
} from '../../utils/sources/Bluejay';
import {
  OPEN_ESC_VERSIONS_REMOTE,
} from '../../utils/sources/OpenEsc';

import {
  getMasterSettings,
} from '../../utils/Settings';

import './style.css';

class App extends Component {
  constructor() {
    super();

    this.setPort = this.setPort.bind(this);
    this.openPort = this.openPort.bind(this);
    this.closePort = this.closePort.bind(this);
    this.setBaudRate = this.setBaudRate.bind(this);
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
      versions: {},
      individualSettings: [],
    };
  }

  async componentDidMount() {
    const that = this;
    this.onMount(async() => {
      const hasSerial = 'serial' in navigator;
      if (hasSerial) {
        navigator.serial.removeEventListener('connect', that.serialConnectHandler);
        navigator.serial.removeEventListener('disconnect', that.serialDisconnectHandler);

        navigator.serial.addEventListener('connect', that.serialConnectHandler);
        navigator.serial.addEventListener('disconnect', that.serialDisconnectHandler);
        const versions = await that.fetchVersions();

        await this.setState({
          checked: true,
          hasSerial: true,
          versions,
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

  onMount(cb){
    cb();
  }

  async addLogMessage(message) {
    const { serialLog } = this.state;
    serialLog.push(this.formatLogMessage(message));

    await this.setState({ serialLog });
  }

  async fetchJson(url) {
    const response = await fetch(url);
    if(!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  async fetchVersions() {
    const versions = {
      blheli: await this.fetchJson(BLHELI_VERSIONS_REMOTE),
      bluejay: await this.fetchJson(BLUEJAY_VERSIONS_REMOTE),
      openEsc: await this.fetchJson(OPEN_ESC_VERSIONS_REMOTE),
    };

    // TODO: only bluejay
    versions.blheli[BLHELI_TYPES.BLHELI_S_SILABS] = {};

    return versions;
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
    try {
      for (let i = 0; i < connected; i += 1) {
        progress[i] = 0;
        await this.delay(500);
        const settings = await serial.fourWayGetInfo(i);
        if(settings) {
          escFlash.push(settings);
        }

        await this.delay(250);
        await serial.fourWayReset(i);
      }
      open = true;
      // console.log(escFlash);
      // console.log(JSON.stringify(escFlash));

      serialLog.push(this.formatLogMessage('Done reading ESC\'s'));
    } catch(e) {
      console.log(e);
      serialLog.push(this.formatLogMessage('Failed reading ESC\'s'));
    }

    // await serial.fourWayExit();
    // await this.delay(1000);

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
      const esc = escs[i];
      const customSettings = individualSettings[i];
      const mergedSettings = Object.assign({}, settings, customSettings);
      await serial.fourWayWriteSettings(i, esc, mergedSettings);
    }

    this.setState({ isWriting: false });
  }

  handleSingleFlash(index) {
    console.log('Flash', index);
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

  async handleFlashUrl(url) {
    const {
      flashTargets, serial, escs, progress,
    } = this.state;
    // Improve: * The original code had some functionality to cache hex files
    //            this might be useful to re-implement in some way using the
    //            local storage. Caching could be done based on URL.

    /*
    const arrayBufferToHex = (buffer) => {
      const array = new Uint8Array (buffer)
      return array.map((b) => b.toString (16).padStart (2, "0")).join ("");
    };
    */

    await this.setState({
      isSelecting: false,
      isFlashing: true,
    });

    try {
      // Proxy is needed to bypass CORS on github
      const proxy = 'https://thingproxy.freeboard.io/fetch/' + url;
      const response = await fetch(proxy);
      const text = await response.text();

      // TODO: In case of ATMEL an eep needs to be fetched

      for(let i = 0; i < flashTargets.length; i += 1) {
        const target = flashTargets[i];
        const newProgress = progress;
        const esc = escs[target];
        newProgress[target] = 1;

        const updateProgress = async(progress) => {
          newProgress[target] = progress;
          await this.setState({ progress: newProgress });
        };

        await this.setState({ progress: newProgress });

        const result = await serial.fourWayWriteHex(target, esc, text , updateProgress);
        escs[target] = result;
        console.log('After flashing', result);

        newProgress[target] = 0;
        await this.setState({
          progress: newProgress,
          escs,
        });
      }
    } catch(e) {
      console.log('File could not be fetched', e);
    }

    await this.setState({
      isSelecting: false,
      isFlashing: false,
    });
  }

  async serialConnectHandler() {
    /*
     * If we are here, the user has already given permission to access the
     * device - mark  conncted
     */
    const ports = await navigator.serial.getPorts();
    if(ports.length > 0) {
      this.addLogMessage('Connected');

      const serial = new Serial(ports[0]);

      this.setState({
        connected: true,
        serial,
      });
    }
  }

  serialDisconnectHandler() {
    this.addLogMessage('Disconnected');
    this.closePort();
  }

  async setPort() {
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
      console.log(e);
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  setBaudRate(rate) {
    this.setState({ baudRate: rate });
  }

  async openPort() {
    const {
      serial,
      baudRate,
      serialLog,
    } = this.state;

    try {
      await serial.open(baudRate);
      serial.setLogCallback(this.addLogMessage);
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

    this.setState({
      open: true,
      serialLog,
    });
  }

  async closePort() {
    const { serial } = this.state;
    if(serial) {
      serial.close();
    }

    this.addLogMessage('Closed port');

    this.setState({
      open: false,
      escs: [],
      lastConnected: 0,
    });
  }

  render() {
    const {
      checked, hasSerial, connected, open, serialLog,
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
          versions, flashTargets, escs,
        } = this.state;
        const esc = escs[flashTargets[0]];
        console.log(esc);

        return (
          <div className="tab-esc toolbar_fixed_bottom">
            <div className="content_wrapper">
              <FirmwareSelector
                escHint={esc.settings.LAYOUT}
                onCancel={this.handleCancelFirmwareSelection}
                onSubmit={this.handleFlashUrl}
                signatureHint={esc.meta.signature}
                versions={versions}
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

              <a
                href="#"
                i18n_title="optionsTitle"
                id="options"
              />

              <PortPicker
                connect={this.openPort}
                disconnect={this.closePort}
                hasPort={connected}
                open={open}
                setBaudRate={this.setBaudRate}
                setPort={this.setPort}
              />
            </div>

            <div className="clear-both" />

            <Log
              messages={serialLog}
            />
          </div>

          {/*
          <div className="tab_container">
            <div id="tabs">
              <ul className="mode-disconnected">
                <li className="tab_landing">
                  <a
                    href="#"
                    i18n="tabLanding"
                    className="tabicon ic_welcome"
                    i18n_title="tabLanding">
                  </a>
                </li>
              </ul>
              <ul className="mode-connected">
                <li className="tab_esc">
                  <a
                    href="#"
                    i18n="tabESC"
                    className="tabicon ic_cli"
                    i18n_title="tabESC"></a>
                </li>
              </ul>
            </div>

            <div className="clear-both"></div>
          </div>
          */}

          <div id="content">
            <MainContent />
          </div>

          <div id="status-bar">
            <div>
              <span i18n="statusbarPortUtilization" />

              <span className="port_usage_down">
                D: 0%
              </span>

              <span className="port_usage_up">
                U: 0%
              </span>
            </div>

            <div>
              <span i18n="statusbarPacketError" />

              <span className="packet-error">
                0
              </span>
            </div>

            <div className="version">
              {/* configuration version generated here */}
            </div>
          </div>

          <div id="cache">
            <div className="data-loading">
              <p i18n="waitingForData" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
