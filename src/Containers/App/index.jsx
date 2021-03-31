import React, {
  Component,
} from 'react';
import dateFormat from 'dateformat';
import TagManager from 'react-gtm-module';
import i18next from 'i18next';

import MainApp from '../../Components/App';

import {
  serial as serialPolyfill,
} from 'web-serial-polyfill';

import Serial from '../../utils/Serial';

import sources from '../../sources';

import {
  getMasterSettings,
} from '../../utils/helpers/Settings';

import {
  delay,
} from '../../utils/helpers/General';

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
    this.handleCloseSettings = this.handleCloseSettings.bind(this);
    this.handleOpenSettings = this.handleOpenSettings.bind(this);
    this.handleUpdateSettings = this.handleUpdateSettings.bind(this);
    this.handleAllMotorSpeed = this.handleAllMotorSpeed.bind(this);
    this.handleSingleMotorSpeed = this.handleSingleMotorSpeed.bind(this);

    this.state = {
      checked: false,
      hasSerial: false,
      connected: 0,
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
        connected: false,
        fourWay: false,
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
      showSettings: false,
      appSettings: {
        directInput: {
          type: 'boolean',
          value: false,
        },
        printLogs: {
          type: 'boolean',
          value: false,
        },
      },
    };
  }

  async componentDidMount() {
    const { appSettings } = this.state;
    const that = this;
    this.onMount(async() => {
      let hasSerial = 'serial' in navigator;
      if(hasSerial) {
        this.serialApi = navigator.serial;
      }

      /**
       * If the Web Serial API is not available, we try to fall back to the
       * Web USB polyfill for serial. This allows us to have (most of) the
       * Web Serial API functionality on Android devices.
       *
       * Web USB has a couple of draw backs though:
       * - getInfo can not be called before a port has been opened, so the
       *   device names need to be mocked.
       * - event listeners are not available, meaning we can not automatically
       *   detect if a deive has been plugged in or disconnected. Connected is
       *   not a big problem, since we trigger that manually by port selection.
       *   Disconnecting is a bigger problem, since we can not clean up once
       *   the user has unplugged his device.
       */
      if(!hasSerial && navigator.usb) {
        this.serialApi = serialPolyfill;
        hasSerial = true;
        this.hasWebUsb = true;
      }

      const language = localStorage.getItem('language');
      if(language) {
        i18next.changeLanguage(language);
        this.setState({ language });
      }

      const settings = JSON.parse(localStorage.getItem('settings'));
      const currentSettings = Object.assign({}, appSettings, settings);
      this.setState({ appSettings: currentSettings });

      // Redefine the console and tee logs
      var console = (function(old) {
        return Object.assign({}, old, {
          debug: (text, ...args) => {
            const { appSettings } = that.state;
            const msg = [text, args.join(' ')].join(' ');
            that.log.push(msg);
            if(appSettings.printLogs.value) {
              console.log(text, ...args);
            }
          },
        });
      }(window.console));
      window.console = console;

      if (hasSerial) {
        /**
         * TODO: Web USB listeners are a hack as long as pulled in from my
         *       fork. Update once google updates their repository.
         */
        this.serialApi.removeEventListener('connect', that.serialConnectHandler);
        this.serialApi.removeEventListener('disconnect', that.serialDisconnectHandler);

        this.serialApi.addEventListener('connect', that.serialConnectHandler);
        this.serialApi.addEventListener('disconnect', that.serialDisconnectHandler);

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
  serialApi = null;
  hasWebUsb = false;

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

  async addLogMessage(message, params = {}) {
    const {
      serialLog,
      appSettings
    } = this.state;
    const translation = i18next.t(`log:${message}`, params);

    params.lng = 'en';
    const translationEn = i18next.t(`log:${message}`, params);

    serialLog.push(this.formatLogMessage(translation));
    this.log.push(translationEn);

    if(appSettings.printLogs.value) {
      console.log(translationEn);
    }

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
    for(let i = 0; i < escs.length; i += 1) {
      if(escs[i].index === index) {
        escs[i].individualSettings = individualSettings;

        break;
      }
    }

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
      const esc = escs[i];
      const target = esc.index;

      console.debug(`Restoring default settings on ESC ${target + 1} `);

      const currentEscSettings = esc.settings;
      const defaultSettings = esc.defaultSettings;
      const mergedSettings = Object.assign({}, currentEscSettings, defaultSettings);
      await this.serial.fourWayWriteSettings(target, esc, mergedSettings);
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
    const formattedDate = dateFormat(now, 'yyyy-mm-dd @ ');
    const formattedTime = dateFormat(now, 'HH:MM:ss -- ');

    return (
      <div>
        <span className="date">
          {formattedDate}
        </span>

        <span className="time">
          {formattedTime}
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
      progress, actions, serial
    } = this.state;

    actions.isReading = true;
    this.setState({ actions });

    // Enable 4way if
    let connected = 0;
    try {
      if(this.lastConnected === 0) {
        const escs = await this.serial.enable4WayInterface();
        connected = escs.connectedESCs;

        await this.serial.fourWayStart();

        // This delay is needed to allow the ESC's to initialize
        await delay(1200);

        serial.fourWay = true;
      } else {
        connected = this.lastConnected;
      }
    } catch(e) {
      this.addLogMessage('fourWayFailed');
      console.debug(e);
    }

    const escFlash = [];
    let open = false;

    this.addLogMessage('readEscs', { connected });

    try {
      for (let i = 0; i < connected; i += 1) {
        progress[i] = 0;
        const settings = await this.serial.fourWayGetInfo(i);
        if(settings) {
          settings.index = i;
          escFlash.push(settings);

          this.addLogMessage('readEsc', { index: i + 1 });
        } else {
          this.addLogMessage('readEscFailed', { index: i + 1 });
        }
      }
      open = true;

      this.addLogMessage('readEscsSuccess');
    } catch(e) {
      this.addLogMessage('readEscsFailed');
      console.debug(e);
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
      connected,
      serial,
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
      const esc = escs[i];
      const target = esc.index;

      console.debug(`Writing settings to ESC ${target + 1}`);

      const currentEscSettings = esc.settings;
      const individualEscSettings = esc.individualSettings;
      const mergedSettings = Object.assign({}, currentEscSettings, settings, individualEscSettings);
      const newSettingsArray = await this.serial.fourWayWriteSettings(target, esc, mergedSettings);

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
      const esc = escs[i];
      flashTargets.push(esc.index);
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
      this.addLogMessage('getFileFailed');
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
      const target = flashTargets[i];

      this.addLogMessage('flashingEsc', { index: target + 1 });

      const esc = escs.find((esc) => esc.index === target);
      newProgress[target] = 0;

      const updateProgress = async(progress) => {
        newProgress[target] = progress;
        await this.setState({ progress: newProgress });
      };

      updateProgress(0.1);

      const result = await this.serial.fourWayWriteHex(target, esc, text, force, migrate, updateProgress);
      result.index = target;

      if(result) {
        escs[i] = result;
        newProgress[target] = 0;

        await this.setState({ escs });
      } else {
        this.addLogMessage('flashingEscFailed', { index: target + 1 });
      }
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
    const ports = await this.serialApi.getPorts();
    if(ports.length > 0) {
      TagManager.dataLayer({ dataLayer: { event: "Plugged in" } });
      this.addLogMessage('pluggedIn');
      connected = true;

      // Set the first  serial port as the active one
      this.serial = new Serial(ports[0]);
    }

    this.setState({
      checked: true,
      hasSerial: true,
      serial: {
        availablePorts: ports,
        connected,
        fourWay: false,
      },
    });
  }

  async serialDisconnectHandler() {
    TagManager.dataLayer({ dataLayer: { event: "Unplugged" } });
    this.addLogMessage('unplugged');
    this.lastConnected = 0;

    const availablePorts = await this.serialApi.getPorts();
    this.setState({
      open: false,
      escs: [],
      serial: {
        availablePorts,
        chosenPort: null,
        connected: availablePorts.length > 0 ? true : false,
        fourWay: false,
      }
    });

    this.serial.disconnect();
  }

  async handleSetPort() {
    try {
      const port = await this.serialApi.requestPort();
      this.serial = new Serial(port);

      this.addLogMessage('portSelected');

      this.setState({
        serial: {
          availablePorts: [port],
          connected: true,
        },
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

    this.addLogMessage('portChanged');

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
      this.addLogMessage('portOpened');

      // Send a reset of the 4 way interface, just in case it was not cleanly
      // disconnected before.
      await this.serial.fourWayExit();
    } catch (e) {
      console.debug(e);

      try {
        this.serial.close();
      } catch(e) {
        console.debug(e);
      }

      this.addLogMessage('portUsed');

      return;
    }

    const apiVersion = await this.serial.getApiVersion();
    this.addLogMessage('mspApiVersion', { version: apiVersion.apiVersion });

    const fcVariant = await this.serial.getFcVariant();
    const fcVersion = await this.serial.getFcVersion();
    this.addLogMessage('mspFcInfo', {
      id: fcVariant.flightControllerIdentifier,
      version: fcVersion.flightControllerVersion,
    });

    const buildInfo = await this.serial.getBuildInfo();
    this.addLogMessage('mspBuildInfo', { info: buildInfo.buildInfo });

    const boardInfo = await this.serial.getBoardInfo();
    this.addLogMessage('mspBoardInfo', {
      identifier: boardInfo.boardIdentifier,
      version: boardInfo.boardVersion,
    });

    let uid = await this.serial.getUid();


    uid = uid.uid;
    let uidHex = 0;
    for (let i = 0; i < uid.length; i += 1) {
      uidHex += uid[i].toString(16);
    }
    this.addLogMessage('mspUid', { id: uidHex });

    let motorData = await this.serial.getMotorData();
    motorData = motorData.filter((motor) => motor > 0);

    await this.setState({
      open: true,
      connected: motorData.length,
    });
  }

  async handleAllMotorSpeed(speed) {
    await this.serial.spinAllMotors(speed);
  }

  async handleSingleMotorSpeed(index, speed) {
    await this.serial.spinMotor(index, speed);
  }

  async handleDisconnect(e) {
    e.preventDefault();
    TagManager.dataLayer({ dataLayer: { event: "Disconnect" } });

    const {
      escs,
      serial,
    } = this.state;
    if(this.serial) {
      for(let i = 0; i < escs.length; i += 1) {
        await this.serial.fourWayReset(i);
      }

      this.serial.close();
    }

    this.addLogMessage('closedPort');
    this.lastConnected = 0;

    serial.fourWay = false;

    this.setState({
      open: false,
      escs: [],
      actions: {
        isReading: false,
        isWriting: false,
        isSelecting: false,
        isFlashing: false,
      },
      serial,
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

  handleCloseSettings() {
    this.setState({ showSettings: false });
  }

  handleOpenSettings() {
    this.setState({ showSettings: true });
  }

  handleUpdateSettings(name, value) {
    const { appSettings } = this.state;

    appSettings[name].value = value;
    localStorage.setItem('settings', JSON.stringify(appSettings));
    this.setState({ appSettings });
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
      showSettings,
      appSettings,
    } = this.state;

    if (!checked) {
      return null;
    }

    const portNames = serial.availablePorts.map((item) => {
      const info = item.getInfo();
      const name = `${info.usbVendorId}:${info.usbProductId}`;

      return name;
    });

    return (
      <MainApp
        actions={actions}
        appSettings={appSettings}
        configs={configs}
        connected={connected}
        escs={escs}
        flashTargets={flashTargets}
        fourWay={serial.fourWay}
        hasPort={serial.connected}
        hasSerial={hasSerial}
        language={language}
        languages={this.languages}
        onAllMotorSpeed={this.handleAllMotorSpeed}
        onCancelFirmwareSelection={this.handleCancelFirmwareSelection}
        onChangePort={this.handleChangePort}
        onClose={this.handleCloseSettings}
        onConnect={this.handleConnect}
        onCookieAccept={this.handleCookieAccept}
        onDisconnect={this.handleDisconnect}
        onFlashUrl={this.handleFlashUrl}
        onIndividualSettingsUpdate={this.handleIndividualSettingsUpdate}
        onLanguageSelection={this.handleLanguageSelection}
        onLocalSubmit={this.handleLocalSubmit}
        onOpenSettings={this.handleOpenSettings}
        onReadEscs={this.handleReadEscs}
        onResetDefaultls={this.handleResetDefaultls}
        onSaveLog={this.handleSaveLog}
        onSelectFirmwareForAll={this.handleSelectFirmwareForAll}
        onSetBaudRate={this.handleSetBaudRate}
        onSetPort={this.handleSetPort}
        onSettingsUpdate={this.handleSettingsUpdate}
        onSingleFlash={this.handleSingleFlash}
        onSingleMotorSpeed={this.handleSingleMotorSpeed}
        onUpdate={this.handleUpdateSettings}
        onWriteSetup={this.handleWriteSetup}
        open={open}
        packetErrors={packetErrors}
        portNames={portNames}
        progress={progress}
        serial={this.serial || undefined}
        serialLog={serialLog}
        settings={settings}
        showSettings={showSettings}
        version={version}
      />
    );
  }
}

export default App;
