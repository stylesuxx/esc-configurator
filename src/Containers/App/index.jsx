import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import BinToHex from 'bin-to-hex';
import i18next from 'i18next';
import Rtttl from 'bluejay-rtttl-parse';
import TagManager from 'react-gtm-module';
import UAParser from 'ua-parser-js';

import { fetchHexCached } from '../../utils/Fetch';
import { TimeoutError } from '../../utils/helpers/QueueProcessor';
import {
  getCommonSettingNames,
  getMasterSettings,
  isFlashFailed,
} from '../../utils/helpers/Settings';
import {
  delay,
  getAppSetting,
} from '../../utils/helpers/General';
import MainApp from '../../Components/App';
import Serial from '../../utils/Serial';
import { loadSerialApi } from '../../utils/LocalStorage';
import { MessageNotOkError } from '../../utils/Errors';
import {
  buildSettingsFile,
  checkLoadedSettings,
  downloadSettingsFile,
  getLoadPlans,
  getPreviewLines,
  getSettingsFileName,
  isSupportedEsc,
  parseSettingsFile,
} from '../../utils/SettingsFile';

import { store } from '../../store';

import { set as setMspFeatures } from '../../Containers/App/mspSlice';
import { fetch as fetchConfigs } from './configsSlice';
import {
  reset as resetMelodyEditor,
  updateAll as updatatAllMelodies,
} from '../../Components/MelodyEditor/melodiesSlice';
import {
  add as addLog,
  addMessage as addMessageLog,
} from '../../Components/Log/logSlice';
import {
  reset as resetState,
  selectCanWrite,
  selectIsSupported,
  setConnecting,
  setDisconnecting,
  setFlashing,
  setReading,
  setSelecting,
  setWriting,
} from './stateSlice';
import {
  setChecked,
  setConnected,
  setFourWay,
  setHasSerial,
  setOpen,
  setPortNames,
} from './serialSlice';
import {
  setIndividual,
  setMaster,
  setConnected as setConnectedEscs,
  setIndividualAtIndex,
} from './escsSlice';

// Just after a reconnection, the flight controller (Betaflight included)
// may be silent for a moment: a request without an answer in time is asked
// again. It was seen silent for longer than 3 requests (about 3.5 s); 5
// requests cover about 6 s.
const MSP_ATTEMPTS = 5;
const MSP_RETRY_DELAY_MS = 250;

class App extends Component {
  static propTypes = { serial: PropTypes.shape({ checked: PropTypes.bool.isRequired }).isRequired };

  constructor() {
    super();

    this.serialApi = loadSerialApi();
    this.progressReferences = [];

    this.serial = undefined;
    this.lastConnected = 0;

    // Redefine the console and tee logs
    window.console.debug = (text, ...args) => {
      const msg = [text, args.join(' ')].join(' ');
      store.dispatch(addLog(msg));

      if(getAppSetting('printLogs')) {
        console.log(text, ...args);
      }
    };
  }

  async componentDidMount() {
    this.onMount(async() => {

      const uaParser = new UAParser();
      const browser = uaParser.getBrowser();
      const os = uaParser.getOS();
      this.addLogMessage('browser', {
        ...browser,
        os: os.name,
      });

      if (this.serialApi) {
        /**
         * Fetch configs in the background - some of them are fetched via
         * github API and might take some time to be fetched.
         */
        store.dispatch(fetchConfigs());

        this.serialApi.removeEventListener('connect', this.serialConnectHandler);
        this.serialApi.removeEventListener('disconnect', this.serialDisconnectHandler);

        this.serialApi.addEventListener('connect', this.serialConnectHandler);
        this.serialApi.addEventListener('disconnect', this.serialDisconnectHandler);

        this.serialConnectHandler();
      } else {
        store.dispatch(setChecked(true));
      }
    });
  }

  shouldComponentUpdate() {
    return true;
  }

  onMount(cb){
    cb();
  }

  serialConnectHandler = async() => {
    this.serial = undefined;
    let connected = false;

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

    store.dispatch(setChecked(true));
    store.dispatch(setHasSerial(true));
    store.dispatch(setConnected(connected));
    store.dispatch(setPortNames(portNames));
    store.dispatch(setFourWay(false));
  };

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

    store.dispatch(setConnecting(availablePorts.length > 0 ? true : false));
    store.dispatch(setPortNames(portNames));
    store.dispatch(setFourWay(false));
    store.dispatch(setOpen(false));
    store.dispatch(setIndividual([]));
  };

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

      store.dispatch(setConnected(true));
      store.dispatch(setPortNames(portNames));
    } catch (e) {
      // No port selected, do nothing
      console.debug(e);
    }
  };

  handleChangePort = async(index) => {
    const availablePorts = await this.serialApi.getPorts();
    this.serial = new Serial(availablePorts[index]);

    this.addLogMessage('portChanged');
  };

  /**
   * Send an MSP request, again after a short pause when the flight controller
   * does not answer in time.
   */
  askAgainOnTimeout = async(request) => {
    for(let attempt = 1; ; attempt += 1) {
      try {
        return await request();
      } catch(e) {
        if(!(e instanceof TimeoutError) || attempt >= MSP_ATTEMPTS) {
          throw e;
        }

        await delay(MSP_RETRY_DELAY_MS);
      }
    }
  };

  /**
   * A single late answer to the API version (just after a reconnection for
   * example) must not be taken for a flight controller left in passthrough.
   */
  getApiVersion = () => this.askAgainOnTimeout(() => this.serial.getApiVersion());

  handleConnect = async(e) => {
    e.preventDefault();

    store.dispatch(setConnecting(true));

    const serial = store.getState().serial;
    try {
      await this.serial.open(serial.baudRate);
      this.serial.setLogCallback(this.addLogMessage);
      this.addLogMessage('portOpened');
      this.progressReferences = [];

      /* Send a reset of the 4 way interface, just in case it was not cleanly
       * disconnected before.
       *
       * Unfortunately this convenience feature can not be used, since on EMU
       * it might lead to the ESCs being wiped.
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
      let apiVersion = null;

      try {
        apiVersion = await this.getApiVersion();
      } catch(e) {
        if (e instanceof TimeoutError) {
          let hasResets = false;
          let inPassthrough = false;
          let i = 0;

          try {
            while ((await this.serial.getFourWayInterfaceInfo(i))) {
              await this.serial.resetFourWayInterface(i);
              i += 1;
            }
          } catch (ex) {
            if (!(ex instanceof MessageNotOkError)) {
              this.addLogMessage('resetEscFailedPowerCycle', { index: i + 1 });
              throw ex;
            }

            inPassthrough = true;
          } finally {
            hasResets = i > 0;
          }

          if (hasResets || inPassthrough) {
            await this.serial.exitFourWayInterface(true);
          }

          apiVersion = await this.getApiVersion();
        } else {
          throw e;
        }
      }

      this.addLogMessage('mspApiVersion', { version: apiVersion.apiVersion });

      const fcVariant = await this.askAgainOnTimeout(() => this.serial.getFcVariant());
      const fcVersion = await this.askAgainOnTimeout(() => this.serial.getFcVersion());
      this.addLogMessage('mspFcInfo', {
        id: fcVariant.flightControllerIdentifier,
        version: fcVersion.flightControllerVersion,
      });

      const buildInfo = await this.askAgainOnTimeout(() => this.serial.getBuildInfo());
      this.addLogMessage('mspBuildInfo', { info: buildInfo.buildInfo });

      const boardInfo = await this.askAgainOnTimeout(() => this.serial.getBoardInfo());
      this.addLogMessage('mspBoardInfo', {
        identifier: boardInfo.boardIdentifier,
        version: boardInfo.boardVersion,
      });

      const uid = (await this.askAgainOnTimeout(() => this.serial.getUid())).uid;
      let uidHex = 0;
      for (let i = 0; i < uid.length; i += 1) {
        uidHex += uid[i].toString(16);
      }
      this.addLogMessage('mspUid', { id: uidHex });

      let motorData = await this.askAgainOnTimeout(() => this.serial.getMotorData());
      motorData = motorData.filter((motor) => motor > 0);

      const features = await this.askAgainOnTimeout(() => this.serial.getFeatures());
      store.dispatch(setMspFeatures(features));

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

      store.dispatch(setOpen(true));
      store.dispatch(setConnectedEscs(motorData.length));
    } catch(e) {
      this.serial.close();
      this.addLogMessage('initializationFailed');

      console.log(e);
    }

    store.dispatch(setConnecting(false));
  };

  handleDisconnect = async(e) => {
    e.preventDefault();
    TagManager.dataLayer({ dataLayer: { event: "Disconnect" } });

    store.dispatch(setDisconnecting(true));

    const {
      escs, serial,
    } = store.getState();
    const { individual } = escs;
    if(this.serial) {
      for(let i = 0; i < individual.length; i += 1) {
        try {
          await this.serial.resetFourWayInterface(i);
        } catch(e) {
          this.addLogMessage('resetEscFailed', { index: i + 1 });
        }
      }

      try {
        await this.serial.exitFourWayInterface(serial.fourWay);
      } catch(e) {
        // No answer: the port is closed anyway
      }

      await this.serial.close();
    }

    this.lastConnected = 0;

    store.dispatch(setFourWay(false));
    store.dispatch(setOpen(false));
    store.dispatch(resetState());
    store.dispatch(resetMelodyEditor());
    store.dispatch(setIndividual([]));

    this.addLogMessage('closedPort');
  };

  addLogMessage = async(message, params = {}) => {
    store.dispatch(addMessageLog({
      message,
      params,
    }));
  };

  flash = async(text, force, migration) => {
    let {
      individual,
      targets,
    } = store.getState().escs;

    for(let i = 0; i < targets.length; i += 1) {
      const target = targets[i];
      const esc = individual.find((esc) => esc.index === target);

      // this will throw a exception when preflight fails
      await this.serial.flashPreflight(esc, text, force);

      const updateProgress = async(percent) => {
        const ref = this.progressReferences[target];
        if(ref && ref.current) {
          ref.current.setProgress((percent));
        }
      };

      this.addLogMessage('flashingEsc', { index: target + 1 });
      const result = await this.serial.writeHex(target, esc, text, force, migration, updateProgress);
      updateProgress(0);

      if(result) {
        result.index = target;
        const individualIndex = individual.findIndex((esc) => esc.index === target);

        store.dispatch(setIndividualAtIndex({
          index: individualIndex,
          settings: result,
        }));
      } else {
        this.addLogMessage('flashingEscFailed', { index: target + 1 });
      }
    }

    individual = store.getState().escs.individual;
    const masterSettings = getMasterSettings(individual);
    store.dispatch(setMaster(masterSettings));

    store.dispatch(setFlashing(false));
  };

  /**
   * True (with a message) for an ESC marked FLASH*FAILED: its settings are
   * read with the wrong layout, so nothing is written to it until it is
   * flashed again. The healthy ESCs are still written.
   *
   * @param {object} esc
   * @returns {boolean}
   */
  skipFailedFlash = (esc) => {
    if(!isFlashFailed(esc)) {
      return false;
    }

    this.addLogMessage('writeSettingsBlockedFlashFailed', { index: esc.index + 1 });

    return true;
  };

  handleResetDefaultls = async() => {
    TagManager.dataLayer({ dataLayer: { event: "Restoring Defaults" } });

    store.dispatch(setWriting(true));
    const { escs } = store.getState();
    for(let i = 0; i < escs.individual.length; i += 1) {
      const esc = escs.individual[i];
      const target = esc.index;
      if(this.skipFailedFlash(esc)) {
        continue;
      }

      const currentEscSettings = esc.settings;
      const defaultSettings = esc.defaultSettings;
      const mergedSettings = {
        ...currentEscSettings,
        ...defaultSettings,
      };

      try {
        await this.serial.writeSettings(target, esc, mergedSettings);
      } catch(e) {
        this.addLogMessage('restoreSettingsFailed', { index: i + 1 });
        console.debug(e);
      }
    }
    store.dispatch(setWriting(false));

    this.handleReadEscs();
  };

  handleReadEsc = async(target) => {
    const settings = await this.serial.getFourWayInterfaceInfo(target);

    return settings;
  };

  handleReadEscs = async() => {
    const { escs } = store.getState();
    const individual = [];

    let fourWay = true;
    let connected = 0;

    store.dispatch(setReading(true));

    // Prevent reading if radio is detected to be on and not connected yet
    if(!escs.connected) {
      const status = await this.serial.getStatus();
      if(!status.armingDisableFlagsReasons.RX_FAILSAFE) {
        this.addLogMessage('radioOn');
        store.dispatch(setReading(false));

        return;
      }
    }

    try {
      if(this.lastConnected === 0) {
        const escs = await this.serial.enable4WayInterface();
        connected = escs.connectedESCs;

        await this.serial.startFourWayInterface();

        /* Give the ESCs some time to boot - it might take longer if they
         * are playing a startup melody.
         */
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

    // Create progress references once
    if(this.progressReferences.length < 1) {
      for (let i = 0; i < connected; i += 1) {
        this.progressReferences[i] = React.createRef();
      }
    }

    for (let i = 0; i < connected; i += 1) {
      try {
        const settings = await this.handleReadEsc(i);
        settings.index = i;
        individual.push(settings);

        this.addLogMessage('readEsc', {
          index: i + 1,
          name: settings.displayName,
        });
      } catch(e) {
        this.addLogMessage('readEscFailed', { index: i + 1 });
        console.debug(e);
      }
    }

    if(individual.length > 0) {
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

      if(individual[0].actualMake) {
        TagManager.dataLayer({
          dataLayer: {
            event: "Mistagged",
            mistagged: {
              name: individual[0].displayName,
              tagged: individual[0].make,
              detected: individual[0].actualMake,
            },
          },
        });
      }

      this.addLogMessage('readEscsSuccess');
    }

    this.lastConnected = connected;
    store.dispatch(setReading(false));
    store.dispatch(setFourWay(fourWay));

    // Set flashed melodies if available
    const master = getMasterSettings(individual);
    if(master && master.STARTUP_MELODY) {
      const melodies = individual.map((esc) => {
        if(esc.individualSettings.STARTUP_MELODY) {
          const melody = esc.individualSettings.STARTUP_MELODY;
          return Rtttl.fromBluejayStartupMelody(melody);
        }

        return "";
      });

      store.dispatch(updatatAllMelodies(melodies));
    }

    store.dispatch(setConnectedEscs(connected));
    store.dispatch(setIndividual(individual));
    store.dispatch(setMaster(master));
  };

  /**
   * Settings written to an ESC: its own, overwritten by the common settings
   * of the first ESC and by its individual settings. Only the common settings
   * described for this ESC are taken from the first ESC: other values stay
   * as they are, for example the PWM frequency of Bluejay 0.19, which only
   * displays the frequency built into the flashed file.
   *
   * @param {object} esc
   * @param {object} master
   * @returns {object}
   */
  getMergedSettings = (esc, master) => {
    const commonEscSettings = esc.settings;
    const individualEscSettings = esc.individualSettings;

    let masterEscSettings = master;
    const names = getCommonSettingNames(esc);
    if(names) {
      masterEscSettings = {};
      for(const name of names) {
        if(master && name in master) {
          masterEscSettings[name] = master[name];
        }
      }
    }

    let commonOverrides = {};
    if(getAppSetting('disableCommon')) {
      commonOverrides = commonEscSettings;
    }

    const mergedSettings = {
      ...commonEscSettings,
      ...masterEscSettings,
      ...commonOverrides,
      ...individualEscSettings,
    };

    return mergedSettings;
  };

  /**
   * Writes to each ESC the settings given for it, then reads it back. An ESC
   * without settings is left as it is.
   *
   * @param {function} getSettings settings to write to an ESC, or null
   */
  writeEscs = async(getSettings) => {
    store.dispatch(setWriting(true));

    const individual = [ ...store.getState().escs.individual ];
    for(let i = 0; i < individual.length; i += 1) {
      const esc = individual[i];
      const target = esc.index;
      const settings = getSettings(esc);
      if(!settings || this.skipFailedFlash(esc)) {
        continue;
      }

      try {
        await this.serial.writeSettings(target, esc, settings);

        const newInfo = await this.handleReadEsc(target);
        individual[i] = {
          ...individual[i],
          settingsArray: newInfo.settingsArray,
          settings: newInfo.settings,
          displayName: newInfo.displayName,
        };
      } catch(e) {
        this.addLogMessage('writeSettingsFailed', { index: i + 1 });
        console.debug(e);
      }
    }
    store.dispatch(setWriting(false));
    store.dispatch(setIndividual(individual));
  };

  handleWriteSettings = async() => {
    TagManager.dataLayer({ dataLayer: { event: "Writing Setup" } });

    const state = store.getState();

    /**
     * Settings of unsupported firmware can not be edited, only the startup
     * melody. Each ESC keeps its own settings in that case.
     */
    let master = {};
    if(selectIsSupported(state)) {
      master = state.escs.master;
    }

    await this.writeEscs((esc) => this.getMergedSettings(esc, master));
  };

  /**
   * @returns {boolean} true when the file was offered for download
   */
  saveSettingsFile = () => {
    const {
      connected,
      individual,
    } = store.getState().escs;
    const fileName = getSettingsFileName();
    if(!downloadSettingsFile(buildSettingsFile(individual, connected), fileName)) {
      this.addLogMessage('settingsFileSaveFailed');

      return false;
    }

    this.addLogMessage('settingsFileSaved', { fileName });

    return true;
  };

  handleSaveSettings = () => {
    if(!store.getState().escs.individual.some(isSupportedEsc)) {
      this.addLogMessage('settingsFileNoEsc');

      return;
    }

    this.saveSettingsFile();
  };

  handleLoadSettings = (e) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      await this.loadSettings(e.target.result);
    };
    reader.readAsText(e.target.files[0]);
  };

  canLoadSettings = () => {
    const state = store.getState();

    return Boolean(this.serial) &&
      state.serial.open &&
      !state.state.isFlashing &&
      selectCanWrite(state);
  };

  /**
   * Writes the settings of a file to the ESCs, each one only to the ESC at
   * the same position running the same firmware, version and layout.
   *
   * @param {string} text
   */
  loadSettings = async(text) => {
    if(!this.canLoadSettings()) {
      this.addLogMessage('settingsLoadNotAllowed');

      return;
    }

    let file = null;
    try {
      file = parseSettingsFile(text);
    } catch(e) {
      this.addLogMessage('settingsLoadInvalid');

      return;
    }

    const { connected } = store.getState().escs;
    if(file.count !== connected) {
      this.addLogMessage('settingsLoadCountMismatch', {
        connected,
        saved: file.count,
      });

      return;
    }

    // What is on the screen may not be written yet: start from the ESCs
    await this.handleReadEscs();

    const {
      messages,
      plans,
    } = getLoadPlans(store.getState().escs.individual, file);
    this.addLogMessages(messages);

    const lines = getPreviewLines(plans, (key, params) => i18next.t(`common:${key}`, params));
    if(lines.length === 0) {
      this.addLogMessage('settingsLoadNoChange');

      return;
    }

    if(typeof window.confirm !== 'function' ||
      !window.confirm(i18next.t('common:settingsLoadConfirm', { changes: lines.join('\n') }))) {
      this.addLogMessage('settingsLoadCancelled');

      return;
    }

    if(!this.saveSettingsFile()) {
      this.addLogMessage('settingsLoadNoBackup');

      return;
    }

    await this.writeEscs((esc) => {
      const plan = plans.find((plan) => plan.esc.index === esc.index);
      if(!plan) {
        return null;
      }

      return {
        ...esc.settings,
        ...plan.settings,
      };
    });

    await this.handleReadEscs();
    this.addLogMessages(checkLoadedSettings(plans, store.getState().escs.individual));
  };

  addLogMessages = (messages) => {
    messages.forEach((message) => this.addLogMessage(message.key, message.params));
  };

  handleFirmwareDump = async (target) => {
    const { escs } = store.getState();
    const esc = escs.individual.find((esc) => esc.index === target);

    const updateProgress = async(percent) => {
      if(esc.ref && esc.ref.current) {
        esc.ref.current.setProgress((percent));
      }
    };

    store.dispatch(setFlashing(true));

    this.addLogMessage('dumpingEsc', { index: target + 1 });
    const dataBin = await this.serial.readFirmware(target, esc, updateProgress);
    const binToHex = new BinToHex(16, 0x00, 0xFF);
    const dataHex = binToHex.convert(dataBin);
    updateProgress(0);

    store.dispatch(setFlashing(false));

    const element = document.createElement("a");
    const file = new Blob([dataHex], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "dump.hex";
    document.body.appendChild(element);
    element.click();
  };

  handleLocalSubmit = (e, force, migration) => {
    e.preventDefault();

    store.dispatch(setFlashing(true));
    store.dispatch(setSelecting(false));

    const { escs } = store.getState();
    const { targets } = escs;

    TagManager.dataLayer({
      dataLayer: {
        event: 'LocalFlash',
        firmware: {
          force,
          count: targets.length,
        },
      },
    });

    const reader = new FileReader();
    reader.onload = async (e) => {
      console.debug('Flashing local file');

      const text = (e.target.result);
      try {
        await this.flash(text, force, migration);
      } catch(e) {
        console.error(e);
        store.dispatch(setFlashing(false));
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  /**
   * Acquires the hex file from an URL. Before doing so, the local storage is
   * checked if the file already exists there, it is used, otherwise it is
   * downloaded and put into local storage for later use.
   */
  handleFlashUrl = async(url, layout, name, version, pwm, force, migration) => {
    store.dispatch(setFlashing(true));
    store.dispatch(setSelecting(false));

    const { escs } = store.getState();
    const { targets } = escs;
    console.debug(`Chosen firmware: ${url}`);

    let type = 'remote';
    let text = null;
    try {
      text = await fetchHexCached(url);
    } catch(e) {
      console.debug('Failed fetching firmware');
    }

    if(text) {
      TagManager.dataLayer({
        dataLayer: {
          event: 'RemoteFlash',
          firmware: {
            type,
            layout,
            name,
            version,
            pwm,
            url,
            force,
            count: targets.length,
          },
        },
      });

      await this.flash(text, force, migration);
    } else {
      this.addLogMessage('getFileFailed');
      store.dispatch(setFlashing(false));
    }
  };

  handleAllMotorSpeed = async(speed) => {
    await this.serial.spinAllMotors(speed);
  };

  handleSingleMotorSpeed = async(index, speed) => {
    await this.serial.spinMotor(index, speed);
  };

  handleMelodyWrite = (melodies) => {
    const { escs } = store.getState();
    let individual = [ ...escs.individual ];
    const converted = melodies.map((melody) => Array.from(Rtttl.toBluejayStartupMelody(melody).data));

    // Set wait time after melody to synchronize playback on all ESCs
    const melodyDurations = melodies.map((melody) => Rtttl.parse(melody).melody.reduce((a, b) => a + b.duration, 0));
    const maxMelodyDuration = Math.max(...melodyDurations);

    for(let i = 0; i < converted.length; i += 1) {
      const newIndividualSettings = {
        ...individual[i].individualSettings,
        STARTUP_MELODY: converted[i],
        STARTUP_MELODY_WAIT_MS: Math.ceil(maxMelodyDuration - melodyDurations[i]),
      };

      individual[i] = {
        ...individual[i],
        individualSettings: newIndividualSettings,
      };
    }

    // Update individual settings, then write them.
    store.dispatch(setIndividual(individual));
    store.dispatch(updatatAllMelodies(melodies));
    this.handleWriteSettings();
  };

  render() {
    const { serial } = this.props;

    if (!serial.checked) {
      return false;
    }

    return (
      <MainApp
        getBatteryState={this.serial ? this.serial.getBatteryState : null}
        getUtilization={this.serial ? this.serial.getUtilization : null}
        onAllMotorSpeed={this.handleAllMotorSpeed}
        onEscDump={this.handleFirmwareDump}
        onEscsFlashFile={this.handleLocalSubmit}
        onEscsFlashUrl={this.handleFlashUrl}
        onEscsLoadSettings={this.handleLoadSettings}
        onEscsRead={this.handleReadEscs}
        onEscsSaveSettings={this.handleSaveSettings}
        onEscsWriteDefaults={this.handleResetDefaultls}
        onEscsWriteSettings={this.handleWriteSettings}
        onMelodyWrite={this.handleMelodyWrite}
        onSerialConnect={this.handleConnect}
        onSerialDisconnect={this.handleDisconnect}
        onSerialPortChange={this.handleChangePort}
        onSerialSetPort={this.handleSetPort}
        onSingleMotorSpeed={this.handleSingleMotorSpeed}
        progressReferences={this.progressReferences}
      />
    );
  }
}

function mapStateToProps(state) {
  const serial = state.serial;

  return { serial };
}

export {
  App,
};
export default connect(mapStateToProps)(App);
