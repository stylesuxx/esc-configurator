import React, { Component } from 'react';
import dateFormat from 'dateformat';
import TagManager from 'react-gtm-module';
import i18next from 'i18next';
import { serial as serialPolyfill } from 'web-serial-polyfill';

import MainApp from '../../Components/App';
import Serial from '../../utils/Serial';
import sources from '../../sources';
import { getMasterSettings } from '../../utils/helpers/Settings';
import { delay } from '../../utils/helpers/General';
import settings from '../../settings.json';
const {
  version,
  corsProxy,
} = settings;

class App extends Component {
  constructor() {
    super();

    // Action handlers passed down to components and triggered by them.
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
    this.handleAllMotorSpeed = this.handleAllMotorSpeed.bind(this);
    this.handleSingleMotorSpeed = this.handleSingleMotorSpeed.bind(this);
    this.updateLog = this.updateLog.bind(this);

    this.state = {
      appSettings: {
        show: false,
        settings: {
          directInput: {
            type: 'boolean',
            value: false,
          },
          printLogs: {
            type: 'boolean',
            value: false,
          },
        },
      },
      connected: 0,
      settings: {},
      escs: [],
      flashTargets: [],
      progress: [],
      serial: {
        availablePorts: [],
        baudRate: 115200,
        checked: false,
        chosenPort: null,
        connected: false,
        fourWay: false,
        hasSerial: false,
        log: [],
        open: false,
        portNames: [],
      },
      stats: {
        packetErrors: 0,
        version,
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

      const settings = JSON.parse(localStorage.getItem('settings'));
      const currentSettings = Object.assign({}, appSettings.settings, settings);
      appSettings.settings = currentSettings;
      this.setState({ appSettings });

      // Load previously stored log messages and sanitize to a max line count
      const log = JSON.parse(localStorage.getItem('log'));
      if(log) {
        this.log = log.slice(-10000);
      }

      // Redefine the console and tee logs
      var console = (function(old) {
        return Object.assign({}, old, {
          debug: (text, ...args) => {
            const { appSettings } = that.state;
            const msg = [text, args.join(' ')].join(' ');
            that.updateLog(msg);
            if(appSettings.settings.printLogs.value) {
              console.log(text, ...args);
            }
          },
        });
      }(window.console));
      window.console = console;

      let language = localStorage.getItem('language');
      if(!language) {
        const browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
        if(browserLanguage) {
          for(let [key, value] of Object.entries(this.languages)) {
            if(value.value === browserLanguage) {
              language = browserLanguage;
              break;
            }
          }

          if(!language && browserLanguage.split('-').length > 1) {
            const part = browserLanguage.split('-')[0];
            for(let [key, value] of Object.entries(this.languages)) {
              if(value.value === part) {
                language = part;
                break;
              }
            }
          }
        }
      }

      if(language) {
        i18next.changeLanguage(language);
        this.setState({ language });
      }

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
        this.setSerial({ checked: true });
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
  serial = undefined;
  lastConnected = 0;
  serialApi = undefined;
  hasWebUsb = false;

  languages = [
    {
      label: "English",
      value: "en",
    },
    {
      label: "Deutsch",
      value: "de",
    },
    {
      label: "简体中文",
      value: 'zh-CN',
    },
  ];

  onMount(cb){
    cb();
  }

  setSerial(settings) {
    const { serial } = this.state;
    const newSerial = Object.assign({}, serial, settings);
    this.setState({ serial: newSerial });
  }

  updateLog(message) {
    const now = dateFormat(new Date(), 'yyyy/MM/dd HH:MM:ss');
    this.log.push(`${now}: ${message}`);
    localStorage.setItem('log', JSON.stringify(this.log));
  }

  async addLogMessage(message, params = {}) {
    const {
      serial,
      appSettings,
    } = this.state;
    const translation = i18next.t(`log:${message}`, params);

    params.lng = 'en';
    const translationEn = i18next.t(`log:${message}`, params);
    this.updateLog(translationEn);

    if(appSettings.settings.printLogs.value) {
      console.log(translationEn);
    }

    serial.log.push(this.formatLogMessage(translation));
    this.setSerial({ log: serial.log });
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
    const { stats } = this.state;
    stats.packetErrors += count;
    this.setState({ stats });
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
      await this.serial.writeSettings(target, esc, mergedSettings);
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

  async handleReadEscs() {
    const {
      progress,
      actions,
      serial,
    } = this.state;
    const newSerial = Object.assign({}, serial);

    actions.isReading = true;
    this.setState({ actions });

    // Enable 4way if
    let connected = 0;
    try {
      if(this.lastConnected === 0) {
        const escs = await this.serial.enable4WayInterface();
        connected = escs.connectedESCs;

        await this.serial.startFourWayInterface();

        // This delay is needed to allow the ESC's to initialize
        await delay(1200);

        newSerial.fourWay = true;
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
        const settings = await this.serial.getFourWayInterfaceInfo(i);
        if(settings) {
          settings.index = i;
          escFlash.push(settings);

          this.addLogMessage('readEsc', {
            index: i + 1,
            name: settings.displayName,
          });
        } else {
          this.addLogMessage('readEscFailed', { index: i + 1 });
        }
      }
      open = true;

      TagManager.dataLayer({
        dataLayer: {
          event: "ESCs",
          escs: {
            name: escFlash[0].displayName,
            layout: escFlash[0].make,
            count: escFlash.length,
          },
        },
      });

      this.addLogMessage('readEscsSuccess');
    } catch(e) {
      this.addLogMessage('readEscsFailed');
      console.debug(e);
    }

    const masterSettings = getMasterSettings(escFlash);

    this.lastConnected = connected;
    actions.isReading = false;
    newSerial.open = open;
    this.setState({
      escs: escFlash,
      settings: masterSettings,
      progress,
      actions,
      connected,
      serial: newSerial,
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
      const newSettingsArray = await this.serial.writeSettings(target, esc, mergedSettings);

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

  handleLocalSubmit(e, force, migrate) {
    const { flashTargets } = this.state;
    e.preventDefault();
    TagManager.dataLayer({
      dataLayer: {
        event: 'Flashing',
        firmwareNew: {
          type: 'local',
          force,
          count: flashTargets.length,
        },
      },
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      console.debug(`Flashing local file`);

      const text = (e.target.result);
      this.flash(text, force, migrate);
    };
    reader.readAsText(e.target.files[0]);
  }

  /**
   * Acquires the hex file from an URL. Before doing so, the local storage is
   * checked if the file already exists there, it is used, otherwise it is
   * downloaded and put into local storage for later use.
   */
  async handleFlashUrl(url, force, migrate) {
    const { flashTargets } = this.state;
    console.debug(`Chosen firmware: ${url}`);

    let type = 'remote';
    let text = null;
    if (typeof Storage !== "undefined") {
      text = localStorage.getItem(url);

      if(text) {
        type = 'localStorage';
        console.debug('Got firmware from local storage');
      }
    }

    if(!text) {
      try {
        console.debug('Fetching firmware from repository');
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
      TagManager.dataLayer({
        dataLayer: {
          event: 'Flashing',
          firmwareNew: {
            type,
            url,
            force,
            count: flashTargets.length,
          },
        },
      });

      await this.flash(text, force, migrate);
    } else {
      this.addLogMessage('getFileFailed');
    }
  }

  async flash(text, force, migrate) {
    const {
      flashTargets, escs, progress, actions,
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

      const result = await this.serial.writeHex(target, esc, text, force, migrate, updateProgress);
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
      actions,
    });
  }

  async serialConnectHandler() {
    /**
     * If we are here, the user has already given permission to access the
     * device - mark  conncted
     */
    let connected = false;
    this.serial = undefined;
    const ports = await this.serialApi.getPorts();
    if(ports.length > 0) {
      TagManager.dataLayer({ dataLayer: { event: "Plugged in" } });
      this.addLogMessage('pluggedIn');
      connected = true;

      // Set the first  serial port as the active one
      this.serial = new Serial(ports[0]);
    }

    const portNames = ports.map((item) => {
      const info = item.getInfo();
      const name = `${info.usbVendorId}:${info.usbProductId}`;

      return name;
    });

    this.setSerial({
      availablePorts: ports,
      checked: true,
      connected: connected,
      fourWay: false,
      hasSerial: true,
      portNames: portNames,
    });
  }

  async serialDisconnectHandler() {
    TagManager.dataLayer({ dataLayer: { event: "Unplugged" } });
    this.addLogMessage('unplugged');
    this.lastConnected = 0;

    const availablePorts = await this.serialApi.getPorts();
    const portNames = availablePorts.map((item) => {
      const info = item.getInfo();
      const name = `${info.usbVendorId}:${info.usbProductId}`;

      return name;
    });

    this.setSerial({
      availablePorts,
      chosenPort: null,
      connected: availablePorts.length > 0 ? true : false,
      fourWay: false,
      open: false,
      portNames,
    });
    this.setState({ escs: [] });

    this.serial.disconnect();
  }

  serialActions = {
    handleChangePort: this.handleChangePort.bind(this),
    handleConnect: this.handleConnect.bind(this),
    handleDisconnect: this.handleDisconnect.bind(this),
    handleSetBaudRate: this.handleSetBaudRate.bind(this),
    handleSetPort: this.handleSetPort.bind(this),
  }

  async handleSetPort() {
    const { serial } = this.state;
    try {
      const port = await this.serialApi.requestPort();
      this.serial = new Serial(port);

      this.addLogMessage('portSelected');


      const portNames = [port].map((item) => {
        const info = item.getInfo();
        const name = `${info.usbVendorId}:${info.usbProductId}`;

        return name;
      });

      this.setSerial({
        availablePorts: [port],
        connected: true,
        portNames,
      });
    } catch (e) {
      // No port selected, do nothing
      console.debug(e);
    }
  }

  handleChangePort(index) {
    const { serial } = this.state;
    this.serial = new Serial(serial.availablePorts[index]);

    this.addLogMessage('portChanged');
    this.setSerial({ chosenPort: serial.availablePorts[index] });
  }

  handleSetBaudRate(rate) {
    this.setSerial({ baudRate: rate });
  }

  async handleConnect(e) {
    e.preventDefault();
    const { serial } = this.state;

    try {
      await this.serial.open(serial.baudRate);
      this.serial.setLogCallback(this.addLogMessage);
      this.serial.setPacketErrorsCallback(this.handlePacketErrors);
      this.addLogMessage('portOpened');

      /* Send a reset of the 4 way interface, just in case it was not cleanly
       * disconnected before.
       *
       * Unfortunately this convenience feature can not be used, since on EMU
       * it might lead to the ESC's being wiped.
       */
      // await this.serial.exitFourWayInterface();
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

    try {
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

      const uid = (await this.serial.getUid()).uid;
      let uidHex = 0;
      for (let i = 0; i < uid.length; i += 1) {
        uidHex += uid[i].toString(16);
      }
      this.addLogMessage('mspUid', { id: uidHex });

      let motorData = await this.serial.getMotorData();
      motorData = motorData.filter((motor) => motor > 0);

      TagManager.dataLayer({
        dataLayer: {
          event: "FlightController",
          flightController: {
            mspVersion: apiVersion.apiVersion,
            firmwareName: fcVariant.flightControllerIdentifier,
            firmwareVersion: fcVersion.flightControllerVersion,
            firmwareBuild: buildInfo.buildInfo,
          },
        },
      });

      this.setSerial({ open: true });
      this.setState({ connected: motorData.length });
    } catch(e) {
      this.serial.close();
      this.addLogMessage('portUsed');
    }
  }

  async handleDisconnect(e) {
    e.preventDefault();
    TagManager.dataLayer({ dataLayer: { event: "Disconnect" } });

    const { escs } = this.state;
    if(this.serial) {
      for(let i = 0; i < escs.length; i += 1) {
        await this.serial.resetFourWayInterface(i);
      }
      await this.serial.exitFourWayInterface();

      this.serial.close();
    }

    this.addLogMessage('closedPort');
    this.lastConnected = 0;

    this.setSerial({
      fourWay: false,
      open: false,
    });

    this.setState({
      escs: [],
      actions: {
        isReading: false,
        isWriting: false,
        isSelecting: false,
        isFlashing: false,
      },
    });
  }

  async handleAllMotorSpeed(speed) {
    await this.serial.spinAllMotors(speed);
  }

  async handleSingleMotorSpeed(index, speed) {
    await this.serial.spinMotor(index, speed);
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

  appSettingsActions = {
    handleClose: this.handleAppSettingsClose.bind(this),
    handleOpen: this.handleAppSettingsOpen.bind(this),
    handleUpdate: this.handleAppSettingsUpdate.bind(this),
  };

  handleAppSettingsClose() {
    const { appSettings } = this.state;
    appSettings.show = false;
    this.setState({ appSettings });
  }

  handleAppSettingsOpen() {
    const { appSettings } = this.state;
    appSettings.show = true;
    this.setState({ appSettings });
  }

  handleAppSettingsUpdate(name, value) {
    const { appSettings } = this.state;

    appSettings.settings[name].value = value;
    localStorage.setItem('settings', JSON.stringify(appSettings.settings));
    this.setState({ appSettings });
  }

  render() {
    const {
      connected,
      escs,
      settings,
      actions,
      progress,
      configs,
      flashTargets,
      language,
      serial,
      stats,
      appSettings,
    } = this.state;

    if (!serial.checked) {
      return null;
    }

    return (
      <MainApp
        actions={actions}
        appSettings={{
          actions: this.appSettingsActions,
          settings: appSettings.settings,
          show: appSettings.show,
        }}
        configs={configs}
        connected={connected}
        escs={escs}
        flashTargets={flashTargets}
        language={language}
        languages={this.languages}
        onAllMotorSpeed={this.handleAllMotorSpeed}
        onCancelFirmwareSelection={this.handleCancelFirmwareSelection}
        onCookieAccept={this.handleCookieAccept}
        onFlashUrl={this.handleFlashUrl}
        onIndividualSettingsUpdate={this.handleIndividualSettingsUpdate}
        onLanguageSelection={this.handleLanguageSelection}
        onLocalSubmit={this.handleLocalSubmit}
        onReadEscs={this.handleReadEscs}
        onResetDefaultls={this.handleResetDefaultls}
        onSaveLog={this.handleSaveLog}
        onSelectFirmwareForAll={this.handleSelectFirmwareForAll}
        onSettingsUpdate={this.handleSettingsUpdate}
        onSingleFlash={this.handleSingleFlash}
        onSingleMotorSpeed={this.handleSingleMotorSpeed}
        onWriteSetup={this.handleWriteSetup}
        progress={progress}
        serial={{
          actions: this.serialActions,
          port: this.serial,
          ...serial,
        }}
        settings={settings}
        stats={stats}
      />
    );
  }
}

export default App;
