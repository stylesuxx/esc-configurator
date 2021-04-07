import { serial as serialPolyfill } from 'web-serial-polyfill';
import React, { Component } from 'react';
import dateFormat from 'dateformat';
import TagManager from 'react-gtm-module';
import i18next from 'i18next';
import Rtttl from 'bluejay-rtttl-parse';

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

    const defaultSettings = {
      directInput: {
        type: 'boolean',
        value: false,
      },
      printLogs: {
        type: 'boolean',
        value: false,
      },
    };

    const loadSettings = () => {
      const settings = JSON.parse(localStorage.getItem('settings')) || {};
      return {
        ...defaultSettings,
        ...settings,
      };
    };

    const loadLanguage = () => {
      let storedLanguage = localStorage.getItem('language');
      if(!storedLanguage) {
        const browserLanguage = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
        if(browserLanguage) {
          for(let [key, value] of Object.entries(this.languages)) {
            if(value.value === browserLanguage) {
              storedLanguage = browserLanguage;
              break;
            }
          }

          if(!storedLanguage && browserLanguage.split('-').length > 1) {
            const part = browserLanguage.split('-')[0];
            for(let [key, value] of Object.entries(this.languages)) {
              if(value.value === part) {
                storedLanguage = part;
                break;
              }
            }
          }
        }
      }

      if(storedLanguage) {
        i18next.changeLanguage(storedLanguage);
      }

      return(storedLanguage || 'en');
    };

    const loadLog = () => {
      // Load previously stored log messages and sanitize to a max line count
      const storedLog = JSON.parse(localStorage.getItem('log'));
      if(storedLog) {
        return storedLog.slice(-10000);
      }

      return [];
    };

    const getSerialApi = () => {
      if('serial' in navigator) {
        return navigator.serial;
      }

      if('usb' in navigator) {
        return serialPolyfill;
      }

      return null;
    };

    this.languages = [
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

    this.log = loadLog();
    this.serialApi = getSerialApi();

    this.gtmActive = false;
    this.serial = undefined;
    this.lastConnected = 0;

    this.state = {
      appSettings: {
        show: false,
        settings: loadSettings(),
      },
      escs: {
        connected: 0,
        master: {},
        progress: [],
        targets: [],
        individual: [],
      },
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
      language: loadLanguage(),
      melodies: {
        escs: [
          "LeaveHerAlone:d=8,o=5,b=100:4g#6,4c#6,c6,c#6,d#6,4c#.6,p,b,b,d#6,f#6,4e.6,p,b,f#6,g#6,f#6,4e.6,p,g#6,f#6,e6,c#6,c6,4g#6,4c#6,c6,c#6,d#6,16e6,16d#6,4c#6,p,16b,16b,b,d#6,f#6,4a6,4g#6,4f#6,e6,p,e6,4g#6,4g#6,f#6,e6,4c#6",
          "Melody:o=3,b=900,d=4:32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.",
          "YouKnowIt:d=4,o=5,b=125:32p,2a#,2f,p,8a#,8c6,8d6,8d#6,2f6,2p,f6,f6,8f#6,8g#6,2a#6,2p,a#6,8a#6,8p,8g#6,8f#6,g#6,8f#6,2f6,2p,2f6,d#6,8d#6,8f6,2f#6,2p,f6,d#6,c#6,8c#6,8d#6,2f6,2p,d#6,c#6,c6,8c6,8d6,2e6,2p,2g6,1f6",
          "GuessIt:d=4,o=5,b=125:32p,16g#,16g#,16g#,16g#,8g#,8a#,8g#,f,16c#,16d#,16c#,8d#,8d#,8c#,2f,8g#,8g#,8g#,8a#,8g#,f,c#6,8c#6,8c6,8g#,8a#,16c6,16a#,g#",
        ],
        show: false,
        dummy: true,
      },
    };

    // Redefine the console and tee logs
    window.console.debug = (text, ...args) => {
      const { appSettings } = this.state;
      const msg = [text, args.join(' ')].join(' ');
      this.updateLog(msg);
      if(appSettings.settings.printLogs.value) {
        console.log(text, ...args);
      }
    };
  }

  async componentDidMount() {
    this.onMount(async() => {
      if (this.serialApi) {
        this.serialApi.removeEventListener('connect', this.serialConnectHandler);
        this.serialApi.removeEventListener('disconnect', this.serialDisconnectHandler);

        this.serialApi.addEventListener('connect', this.serialConnectHandler);
        this.serialApi.addEventListener('disconnect', this.serialDisconnectHandler);

        this.setState({ configs: await this.fetchConfigs() });
        this.serialConnectHandler();
      } else {
        this.setSerial({ checked: true });
      }
    });
  }

  shouldComponentUpdate() {
    return true;
  }

  onMount(cb){
    cb();
  }

  setSerial = (settings) => {
    const { serial } = this.state;
    this.setState({
      serial: {
        ...serial,
        ...settings,
      },
    });
  }

  setEscs = (settings, cb = null) => {
    const { escs } = this.state;
    this.setState({
      escs: {
        ...escs,
        ...settings,
      },
    }, cb);
  }

  setActions = (settings) => {
    const { actions } = this.state;
    this.setState({
      actions: {
        ...actions,
        ...settings,
      },
    });
  }

  setMelodies = (settings) => {
    const { melodies } = this.state;
    this.setState({
      melodies: {
        ...melodies,
        ...settings,
      },
    });
  }

  updateLog = (message) => {
    const now = dateFormat(new Date(), 'yyyy/mm/dd HH:MM:ss');
    this.log.push(`${now}: ${message}`);
    localStorage.setItem('log', JSON.stringify(this.log));
  }

  addLogMessage = async(message, params = {}) => {
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

    const log = [ ...serial.log ];
    log.push(this.formatLogMessage(translation));
    this.setSerial({ log });
  }

  fetchConfigs = async() => {
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

  formatLogMessage = (html) => {
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

  flash = async(text, force, migrate) => {
    const { escs } = this.state;
    const progress = [ ...escs.progress ];
    const individual = [ ...escs.individual ];

    this.setActions({
      isSelecting: false,
      isFlashing: true,
    });

    for(let i = 0; i < escs.targets.length; i += 1) {
      const target = escs.targets[i];

      this.addLogMessage('flashingEsc', { index: target + 1 });

      const esc = escs.individual.find((esc) => esc.index === target);
      progress[target] = 0;

      const updateProgress = async(percent) => {
        progress[target] = percent;
        this.setEscs({ progress });
      };

      updateProgress(0.1);

      const result = await this.serial.writeHex(target, esc, text, force, migrate, updateProgress);
      result.index = target;

      if(result) {
        individual[i] = result;
        progress[target] = 0;

        await this.setEscs({
          individual,
          progress,
        });
      } else {
        this.addLogMessage('flashingEscFailed', { index: target + 1 });
      }
    }

    this.setEscs({ master: getMasterSettings(individual) });
    this.setActions({ isFlashing: false });
  }

  serialConnectHandler = async() => {
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

  serialDisconnectHandler = async() => {
    TagManager.dataLayer({ dataLayer: { event: "Unplugged" } });
    this.addLogMessage('unplugged');
    this.lastConnected = 0;

    const availablePorts = await this.serialApi.getPorts();
    const portNames = availablePorts.map((item) => {
      const info = item.getInfo();
      const name = `${info.usbVendorId}:${info.usbProductId}`;

      return name;
    });

    this.serial.disconnect();

    this.setSerial({
      availablePorts,
      chosenPort: null,
      connected: availablePorts.length > 0 ? true : false,
      fourWay: false,
      open: false,
      portNames,
    });

    this.setEscs({ individual: [] });
  }

  handlePacketErrors = (count) => {
    const { stats } = this.state;
    this.setState({
      stats: {
        ...stats,
        packetErrors: stats.packetErrors + count,
      },
    });
  }

  handleSaveLog = () => {
    const element = document.createElement("a");
    const file = new Blob([this.log.join("\n")], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "esc-configurator-log.txt";
    document.body.appendChild(element);
    element.click();
  }

  handleSettingsUpdate = (master) => {
    this.setEscs({ master });
  }

  handleIndividualSettingsUpdate = (index, individualSettings) => {
    const  { escs } = this.state;
    const individual = [ ...escs.individual ];
    for(let i = 0; i < individual.length; i += 1) {
      if(individual[i].index === index) {
        individual[i].individualSettings = individualSettings;

        break;
      }
    }

    this.setEscs({ individual });
  }

  handleResetDefaultls = async() => {
    TagManager.dataLayer({ dataLayer: { event: "Restoring Defaults" } });

    this.setActions({ isWriting: true });
    const { escs } = this.state;
    for(let i = 0; i < escs.individual.length; i += 1) {
      const esc = escs.individual[i];
      const target = esc.index;

      console.debug(`Restoring default settings on ESC ${target + 1} `);

      const currentEscSettings = esc.settings;
      const defaultSettings = esc.defaultSettings;
      const mergedSettings = Object.assign({}, currentEscSettings, defaultSettings);
      await this.serial.writeSettings(target, esc, mergedSettings);
    }
    this.setActions({ isWriting: false });

    this.handleReadEscs();
  }

  handleReadEscs = async() => {
    const { escs } = this.state;
    const newEscs = { ...escs };
    const individual = [];

    let fourWay = true;
    let connected = 0;

    this.setActions({ isReading: true });
    try {
      if(this.lastConnected === 0) {
        const escs = await this.serial.enable4WayInterface();
        connected = escs.connectedESCs;

        await this.serial.startFourWayInterface();

        // This delay is needed to allow the ESC's to initialize
        await delay(1200);
      } else {
        connected = this.lastConnected;
      }
    } catch(e) {
      fourWay = false;

      this.addLogMessage('fourWayFailed');
      console.debug(e);
    }

    this.addLogMessage('readEscs', { connected });

    try {
      for (let i = 0; i < connected; i += 1) {
        newEscs.progress[i] = 0;
        const settings = await this.serial.getFourWayInterfaceInfo(i);
        if(settings) {
          settings.index = i;
          individual.push(settings);

          this.addLogMessage('readEsc', {
            index: i + 1,
            name: settings.displayName,
          });
        } else {
          this.addLogMessage('readEscFailed', { index: i + 1 });
        }
      }

      TagManager.dataLayer({
        dataLayer: {
          event: "ESCs",
          escs: {
            name: individual[0].displayName,
            layout: individual[0].make,
            count: individual.length,
          },
        },
      });

      this.addLogMessage('readEscsSuccess');
    } catch(e) {
      this.addLogMessage('readEscsFailed');
      console.debug(e);
    }

    this.lastConnected = connected;
    this.setActions({ isReading: false });

    this.setSerial({ fourWay });

    this.setEscs({
      ...newEscs,
      connected,
      individual,
      master: getMasterSettings(individual),
    });
  }

  handleWriteSetup = async() => {
    TagManager.dataLayer({ dataLayer: { event: "Writing Setup" } });

    this.setActions({ isWriting: true });
    const { escs } = this.state;
    const individual = [ ...escs.individual ];
    for(let i = 0; i < individual.length; i += 1) {
      const esc = individual[i];
      const target = esc.index;

      console.debug(`Writing settings to ESC ${target + 1}`);

      const currentEscSettings = esc.settings;
      const individualEscSettings = esc.individualSettings;
      const mergedSettings = Object.assign({}, currentEscSettings, escs.master, individualEscSettings);
      const newSettingsArray = await this.serial.writeSettings(target, esc, mergedSettings);

      individual[i].settingsArray = newSettingsArray;
    }
    this.setActions({ isWriting: false });

    this.setEscs({ individual });
  }

  handleSingleFlash = (index) => {
    this.setEscs({ targets: [index] });
    this.setActions({ isSelecting: true });
  }

  handleSelectFirmwareForAll = () => {
    const { escs } = this.state;

    const targets = [];
    for (let i = 0; i < escs.individual.length; i += 1) {
      const esc = escs.individual[i];
      targets.push(esc.index);
    }

    this.setActions({ isSelecting: true });
    this.setEscs({ targets });
  }

  handleCancelFirmwareSelection = () => {
    this.setActions({ isSelecting: false });
    this.setEscs({ targets: [] });
  }

  handleLocalSubmit = (e, force, migrate) => {
    e.preventDefault();
    const { escs } = this.state;

    TagManager.dataLayer({
      dataLayer: {
        event: 'Flashing',
        firmwareNew: {
          type: 'local',
          force,
          count: escs.targets.length,
        },
      },
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      console.debug('Flashing local file');

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
  handleFlashUrl = async(url, force, migrate) => {
    const { escs } = this.state;
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
            count: escs.targets.length,
          },
        },
      });

      await this.flash(text, force, migrate);
    } else {
      this.addLogMessage('getFileFailed');
    }
  }

  handleSetPort = async() => {
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

  handleChangePort = (index) => {
    const { serial } = this.state;
    this.serial = new Serial(serial.availablePorts[index]);

    this.addLogMessage('portChanged');
    this.setSerial({ chosenPort: serial.availablePorts[index] });
  }

  handleSetBaudRate = (rate) => {
    this.setSerial({ baudRate: rate });
  }

  handleConnect = async(e) => {
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
      this.setEscs({ connected: motorData.length });
    } catch(e) {
      this.serial.close();
      this.addLogMessage('portUsed');
    }
  }

  handleDisconnect = async(e) => {
    e.preventDefault();
    TagManager.dataLayer({ dataLayer: { event: "Disconnect" } });

    const { escs } = this.state;
    if(this.serial) {
      for(let i = 0; i < escs.individual.length; i += 1) {
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

    this.setEscs({ individual: [] });

    this.setActions({
      isReading: false,
      isWriting: false,
      isSelecting: false,
      isFlashing: false,
    });
  }

  handleAllMotorSpeed = async(speed) => {
    await this.serial.spinAllMotors(speed);
  }

  handleSingleMotorSpeed = async(index, speed) => {
    await this.serial.spinMotor(index, speed);
  }

  handleCookieAccept = () => {
    if(!this.gtmActive) {
      const tagManagerArgs = { gtmId: process.env.REACT_APP_GTM_ID };
      TagManager.initialize(tagManagerArgs);

      this.gtmActive = true;
    }
  }

  handleLanguageSelection = (e) => {
    const language = e.target.value;

    localStorage.setItem('language', language);
    i18next.changeLanguage(language);
    this.setState({ language });
  }

  handleAppSettingsClose = () => {
    const { appSettings } = this.state;
    this.setState({
      appSettings: {
        ...appSettings,
        show: false,
      },
    });
  }

  handleAppSettingsOpen = () => {
    const { appSettings } = this.state;
    this.setState({
      appSettings: {
        ...appSettings,
        show: true,
      },
    });
  }

  handleAppSettingsUpdate = (name, value) => {
    const { appSettings } = this.state;
    const settings = { ...appSettings.settings };

    settings[name].value = value;
    localStorage.setItem('settings', JSON.stringify(settings));
    this.setState({
      appSettings: {
        ...appSettings,
        settings,
      },
    });
  }

  handleMelodySave = (melodies) => {
    const { escs } = this.state;
    const individual = [ ...escs.individual ];
    const converted = melodies.map((melody) => Rtttl.toBluejayStartupMelody(melody));
    for(let i = 0; i < converted.length; i += 1) {
      individual[i].individualSettings.STARTUP_MELODY = converted[i].data;
    }

    // Update individual settings, then write them.
    this.setEscs({ individual }, () => {
      this.handleWriteSetup();
    });
  }

  handleMelodyEditorOpen = () => {
    const { escs } = this.state;
    if(escs.individual.length > 0) {
      const melodies = escs.individual.map((esc) => {
        const melody = esc.individualSettings.STARTUP_MELODY;
        return Rtttl.fromBluejayStartupMelody(melody);
      });

      this.setMelodies({
        dummy: false,
        escs: melodies,
        show: true,
      });
    } else {
      // No ESCs connected - editor triggered from home, do not allow saving
      this.setMelodies({
        dummy: true,
        show: true,
      });
    }
  }

  handleMelodyEditorClose = () => {
    this.setMelodies({ show: false });
  }

  render() {
    const {
      escs,
      actions,
      configs,
      language,
      melodies,
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
          actions: {
            handleClose: this.handleAppSettingsClose,
            handleOpen: this.handleAppSettingsOpen,
            handleUpdate: this.handleAppSettingsUpdate,
          },
          settings: appSettings.settings,
          show: appSettings.show,
        }}
        configs={configs}
        escs={{
          actions: {
            handleMasterUpdate: this.handleSettingsUpdate,
            handleIndividualSettingsUpdate: this.handleIndividualSettingsUpdate,
            handleResetDefaultls: this.handleResetDefaultls,
            handleReadEscs: this.handleReadEscs,
            handleWriteSetup: this.handleWriteSetup,
            handleSingleFlash: this.handleSingleFlash,
            handleSelectFirmwareForAll: this.handleSelectFirmwareForAll,
            handleCancelFirmwareSelection: this.handleCancelFirmwareSelection,
            handleLocalSubmit: this.handleLocalSubmit,
            handleFlashUrl: this.handleFlashUrl,
          },
          ...escs,
        }}
        language={{
          actions: { handleChange: this.handleLanguageSelection },
          current: language,
          available: this.languages,
        }}
        melodies={{
          actions: {
            handleSave: this.handleMelodySave,
            handleOpen: this.handleMelodyEditorOpen,
            handleClose: this.handleMelodyEditorClose,
          },
          ...melodies,
        }}
        onAllMotorSpeed={this.handleAllMotorSpeed}
        onCookieAccept={this.handleCookieAccept}
        onSaveLog={this.handleSaveLog}
        onSingleMotorSpeed={this.handleSingleMotorSpeed}
        serial={{
          actions: {
            handleChangePort: this.handleChangePort,
            handleConnect: this.handleConnect,
            handleDisconnect: this.handleDisconnect,
            handleSetBaudRate: this.handleSetBaudRate,
            handleSetPort: this.handleSetPort,
          },
          port: this.serial,
          ...serial,
        }}
        stats={stats}
      />
    );
  }
}

export default App;
