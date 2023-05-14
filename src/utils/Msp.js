import compareVersions from 'compare-versions';

import { NotEnoughDataError } from './helpers/QueueProcessor';

import { store } from '../store';
import { incrementByAmount as incrementPacketErrorsByAmount } from '../Components/Statusbar/statusSlice';

/**
 * Relevant MSP commands, this is not a full mapping, rather just a selectiotn
 * for the functionality we actually need.
 */
const MSP = {
  MSP_API_VERSION: 1,
  MSP_FC_VARIANT: 2,
  MSP_FC_VERSION: 3,
  MSP_BOARD_INFO: 4,
  MSP_BUILD_INFO: 5,

  MSP_FEATURE_CONFIG: 36,
  MSP_MOTOR_3D_CONFIG: 124,

  MSP_BATTERY_STATE: 130,

  MSP_SET_MOTOR: 214,
  MSP_SET_PASSTHROUGH: 245,

  // Multiwii MSP commands
  MSP_IDENT: 100,
  MSP_STATUS: 101,
  MSP_MOTOR: 104,
  MSP_3D: 124,
  MSP_SET_3D: 217,

  // Additional baseflight commands that are not compatible with MultiWii
  MSP_UID: 160, // Unique device ID

  // Betaflight specific
  MSP2_SEND_DSHOT_COMMAND: 0x3003,
};

/* Features that are valid across all MSP versions.
 * Basically only used to check if 3D mode is enabled.
 */
const FEATURES = [
  'RX_PPM',
  null,
  'INFLIGHT_ACC_CAL',
  'RX_SERIAL',
  'MOTOR_STOP',
  'SERVO_TILT',
  'SOFTSERIAL',
  'GPS',
  null,
  'SONAR',
  'TELEMETRY',
  null,
  '3D',
  'RX_PARALLEL_PWM',
  'RX_MSP',
  'RSSI_ADC',
  'LED_STRIP',
  'DISPLAY',
];

class Msp {
  /**
   * MSP - Multiwii Serial Protocol implementation
   *
   * Communicates with the flight controller firmware which is implementing this
   * protocol. Those are (but not limited to): Betaflight, iNav, Emu,
   * Cleanflight, Baseflight.
   *
   * @param {Serial} serial
   */
  constructor(serial) {
    this.serial = serial;

    this.unsupported = 0;

    this.messageDirection = 1; // ????

    this.read = this.read.bind(this);

    this.logCallback = null;

    const speedBufferOut = new ArrayBuffer(16);
    this.speedBufView = new Uint8Array(speedBufferOut);
    this.motorsSpinning = false;

    this.version = null;
  }

  /**
   * Setter for log callback
   *
   * @param {function} logCallback
   */
  setLogCallback(logCallback) {
    this.logCallback = logCallback;
  }

  /**
   * Invoke log callback if available
   *
   * @param {string} message
   * @param {array} params
   */
  addLogMessage(message, params) {
    if(this.logCallback) {
      this.logCallback(message, params);
    }
  }

  /**
   * Invoke packet error callback with count
   *
   * @param {number} count Packet error count
   */
  increasePacketErrors(count) {
    store.dispatch(incrementPacketErrorsByAmount(count));
  }

  /**
   * Send a command with data to the MSP
   *
   * @param {number} command
   * @param {Uint8Array} data
   * @returns {Promise}
   */
  async send(command, data) {
    const process = async (resolve, reject) => {
      let bufferOut;

      if(command <= 254) {
        bufferOut = this.encodeV1(command, data);
      } else {
        bufferOut = this.encodeV2(command, data);
      }

      try {
        const result = await this.serial(bufferOut, this.read);
        resolve(result);
      } catch(e) {
        console.debug('MSP command failed:', e.message);
        reject(e);
      }
    };

    return new Promise((resolve, reject) => process(resolve, reject));
  }

  /**
   * Processes incoming chunks of data
   *
   * Invokes resolve callback if a valid response message could be parsed  from
   * the given amount of data.
   *
   * Will invoke reject method in any other case and throw according error.
   *
   * @param {Uint8Array} data
   * @param {function} resolve
   * @param {function} reject
   * @returns {void}
   */
  read(data, resolve, reject) {
    let command = 0;
    let state = 0;
    let messageBuffer = null;
    let messageChecksum = null;
    let messageLengthExpected = 0;
    let messageLengthReceived = 0;
    let messageBufferUint8View = null;

    for (let i = 0; i < data.length; i += 1) {
      switch (state) {

        // Sync char 1
        case 0: {
          if (data[i] === 36) { // $
            state += 1;
          }
        } break;

        // Sync char 2
        case 1: {
          if (data[i] === 77) { // M
            state += 1;
          } else {
          // Restart and try again
            state = 0;
          }
        } break;

        // Direction (should be >)
        case 2: {
          this.unsupported = 0;
          if (data[i] === 62) { // >
            this.messageDirection = 1;
          } else if (data[i] === 60) { // <
            this.messageDirection = 0;
          } else if (data[i] === 33) { // !
            // FC reports unsupported message error
            this.unsupported = 1;
          }

          state += 1;
        } break;

        case 3: {
          messageLengthExpected = data[i];
          messageChecksum = data[i];

          // Setup arraybuffer
          messageBuffer = new ArrayBuffer(messageLengthExpected);
          messageBufferUint8View = new Uint8Array(messageBuffer);

          /*
          if(messageLengthExpected !== messageBuffer.length) {
            return reject(new NotEnoughDataError());
          }
          */

          state += 1;
        } break;

        case 4: {
          command = data[i];
          messageChecksum ^= data[i];

          // Process payload
          if (messageLengthExpected > 0) {
            state += 1;
          } else {
            // No payload
            state += 2;
          }
        } break;

        // Payload
        case 5: {
          messageBufferUint8View[messageLengthReceived] = data[i];
          messageChecksum ^= data[i];
          messageLengthReceived += 1;

          if (messageLengthReceived >= messageLengthExpected) {
            state += 1;
          }
        } break;

        case 6: {
          // Message received, process
          if (messageChecksum === data[i]) {
            const response = this.processData(
              command,
              messageBuffer,
              messageLengthExpected
            );

            this.lastReceivedTimestamp = Date.now();

            return resolve(response);
          }

          this.increasePacketErrors(1);
          return reject(new Error(`command: ${command} - crc failed`));
        }

        default: {
          return reject(new Error(`Unknown state detected: ${state}`));
        }
      }
    }

    this.lastReceivedTimestamp = Date.now();

    return reject(new NotEnoughDataError());
  }

  /**
   * Encode a MSP V1 command
   *
   * @param {number} command
   * @param {Uint8Array} data
   * @returns {ArrayBuffer}
   */
  encodeV1(command, data = []) {
    // Always reserve 6 bytes for protocol overhead !
    const size = 6 + data.length;
    const bufferOut = new ArrayBuffer(size);
    const bufView = new Uint8Array(bufferOut);

    bufView[0] = 36; // $
    bufView[1] = 77; // M
    bufView[2] = 60; // <
    bufView[3] = data.length;
    bufView[4] = command;

    if (data.length > 0) {
      let checksum = bufView[3] ^ bufView[4];

      for (let i = 0; i < data.length; i += 1) {
        bufView[i + 5] = data[i];
        checksum ^= bufView[i + 5];
      }

      bufView[5 + data.length] = checksum;
    } else {
      bufView[5] = bufView[3] ^ bufView[4]; // Checksum
    }

    return bufferOut;
  }

  /**
   * Encode a MSP V2 command
   *
   * @param {number} command
   * @param {Uint8Array} data
   * @returns {ArrayBuffer}
   */
  encodeV2(command, data = []) {
    console.log("V2 command:", command);
    // Always reserve 9 bytes for protocol overhead!
    const dataLength = data.length;
    const size = 9 + dataLength;
    const bufferOut = new ArrayBuffer(size);
    const bufView = new Uint8Array(bufferOut);

    bufView[0] = 36; // $
    bufView[1] = 88; // X
    bufView[2] = 60; // <
    bufView[3] = 0;  // flag
    bufView[4] = command & 0xFF;
    bufView[5] = (command >> 8) & 0xFF;
    bufView[6] = dataLength & 0xFF;
    bufView[7] = (dataLength >> 8) & 0xFF;

    for (let i = 0; i < dataLength; i += 1) {
      bufView[8 + i] = data[i];
    }

    bufView[size - 1] = this.crc8DvbS2Data(bufView, 3, size - 1);

    return bufferOut;
  }

  /**
   * Calculate the DVB-S2 checksum for a chunk of data
   *
   * @param {Uint8Array} data
   * @param {number} start
   * @param {number} end
   * @returns {number}
   */
  crc8DvbS2Data(data, start, end) {
    let crc = 0;
    for (let i = start; i < end; i += 1) {
      const ch = data[i];
      crc ^= ch;
      for (let i = 0; i < 8; i += 1) {
        if (crc & 0x80) {
          crc = ((crc << 1) & 0xFF) ^ 0xD5;
        } else {
          crc = (crc << 1) & 0xFF;
        }
      }
    }

    return crc;
  }

  /**
   * Return an object parsef rom message buffer according tto a given command
   *
   * @param {number} command
   * @param {Uint8Array} messageBuffer
   * @param {number} messageLength
   * @returns {object}
   */
  processData(command, messageBuffer, messageLength) {
    // DataView (allowing us to view arrayBuffer as struct/union)
    const data = new DataView(
      messageBuffer,
      0
    );
    const config = {};
    const escConfig = {};
    const motorData = [];

    if (!this.unsupported) {
      switch (command) {
        case MSP.MSP_IDENT: {
          console.debug('Using deprecated msp command: MSP_IDENT');

          // Deprecated
          config.version = parseFloat((data.getUint8(0) / 100).toFixed(2));
          config.multiType = data.getUint8(1);
          config.msp_version = data.getUint8(2);
          config.capability = data.getUint32(3, 1);

          return config;
        }

        case MSP.MSP_STATUS: {
          config.cycleTime = data.getUint16(0, 1);
          config.i2cError = data.getUint16(2, 1);
          config.activeSensors = data.getUint16(4, 1);
          config.mode = data.getUint32(6, 1);
          config.currentProfile = data.getUint8(10);
          config.averageSysytemLoadPercent = data.getUint16(11, 1);

          config.pidProfileCount = data.getUint8(13);
          config.currentRateProfile = data.getUint8(14);

          config.byteCount = data.getUint8(15);

          config.armingDisableFlagsCount = data.getUint8(16 + config.byteCount);
          config.armingDisableFlags = data.getUint32(17 + config.byteCount, 1);

          const rxFailsafe = (config.armingDisableFlags & (1 << 2)) === 0x04;
          config.armingDisableFlagsReasons = { RX_FAILSAFE: rxFailsafe };

          config.rebootRequired = data.getUint8(21 + config.byteCount);

          return config;
        }

        case MSP.MSP_MOTOR: {
          const motorCount = messageLength / 2;
          let needle = 0;
          for (let i = 0; i < motorCount; i += 1) {
            motorData[i] = data.getUint16(needle, 1);

            needle += 2;
          }

          return motorData;
        }

        case MSP.MSP_SET_PASSTHROUGH: {
          escConfig.connectedESCs = data.getUint8(0);

          return escConfig;
        }
        case MSP.MSP_UID: {
          config.uid = [];
          config.uid[0] = data.getUint32(0, 1);
          config.uid[1] = data.getUint32(4, 1);
          config.uid[2] = data.getUint32(8, 1);

          return config;
        }

        case MSP.MSP_API_VERSION: {
          let offset = 0;
          config.mspProtocolVersion = data.getUint8(offset++);
          config.apiVersion = `${data.getUint8(offset++)}.`;
          config.apiVersion += `${data.getUint8(offset++)}.0`;

          this.version = config.apiVersion;

          return config;
        }

        case MSP.MSP_FC_VARIANT: {
          let identifier = '';
          for (let i = 0; i < 4; i += 1) {
            identifier += String.fromCharCode(data.getUint8(i));
          }

          config.flightControllerIdentifier = identifier;

          return config;
        }

        case MSP.MSP_FC_VERSION: {
          let offset = 0;
          config.flightControllerVersion = `${data.getUint8(offset++)}.`;
          config.flightControllerVersion += `${data.getUint8(offset++)}.`;
          config.flightControllerVersion += data.getUint8(offset++);

          return config;
        }

        case MSP.MSP_BUILD_INFO: {
          let offset = 0;
          const dateLength = 11;
          const buff = [];

          for (let i = 0; i < dateLength; i += 1) {
            buff.push(data.getUint8(offset++));
          }
          buff.push(32); // Ascii space

          const timeLength = 8;
          for (let i = 0; i < timeLength; i += 1) {
            buff.push(data.getUint8(offset++));
          }

          config.buildInfo = String.fromCharCode.apply(
            null,
            buff
          );

          return config;
        }

        case MSP.MSP_BOARD_INFO: {
          let identifier = '';
          let offset = 0;
          for (offset = 0; offset < 4; offset += 1) {
            identifier += String.fromCharCode(data.getUint8(offset));
          }

          config.boardIdentifier = identifier;
          config.boardVersion = data.getUint16(
            offset,
            1
          );
          // Offset += 2; // ???

          return config;
        }

        case MSP.MSP_FEATURE_CONFIG: {
          const featureBits = data.getUint32(0, 1);
          const features = {};
          FEATURES.forEach((key, index) => {
            if(key) {
              const mask = 1 << index;

              features[key] = (featureBits & mask) !== 0;
            }
          });

          return features;
        }

        case MSP.MSP_BATTERY_STATE: {
          const battery = {
            cellCount: data.getUint8(0),
            capacity: data.getUint16(1, 1),     // mAh
            voltage: data.getUint8(3) / 10.0,   // V
            drawn: data.getUint16(4, 1),        // mAh
            amps: data.getUint16(6, 1) / 100,   // A
          };

          if(compareVersions.compare(this.version, '1.41.0', '>=')) {
            battery.state = data.getUint8(8);
            if(data.byteLength > 9) {
              battery.voltage = data.getUint16(9, 1) / 100.0; // V
            }
          }

          return battery;
        }

        case MSP.MSP_SET_3D: {
          console.debug('3D settings saved');
        } break;

        case MSP.MSP_SET_MOTOR: {
          // Motor speeds updated
        } break;

        default: {
          console.debug('Unknown command detected:', command);
        }
      }
    } else if (command === MSP.MSP_SET_PASSTHROUGH) {
      this.addLogMessage('passthroughNotSupported');
    } else {
      console.debug('FC reports unsupported message error:', command);
    }

    return null;
  }

  /**
   * Spin a motor at a given speed
   *
   * @param {number} motor
   * @param {number} speed
   * @returns {Promise<>}
   */
  spinMotor(motor, speed) {
    this.motorsSpinning = true;

    const offset = (motor - 1) * 2;

    this.speedBufView[offset] = 0x00ff & speed;
    this.speedBufView[offset + 1] = speed >> 8;

    return this.setMotor(this.speedBufView);
  }

  /**
   * Spin all motors at a given speed
   *
   * @param {number} speed
   * @returns  {Promise}
   */
  spinAllMotors(speed) {
    this.motorsSpinning = true;

    for(let i = 0; i < 8; i += 2) {
      this.speedBufView[i] = 0x00ff & speed;
      this.speedBufView[i + 1] = speed >> 8;
    }

    return this.setMotor(this.speedBufView);
  }

  /**
   * Stop all motors if they have been spun up before
   *
   * @returns {Promise}
   */
  async stopAllMotors() {
    if(this.motorsSpinning) {
      const features = await this.getFeatures();
      return this.spinAllMotors(features['3D'] ? 1500 : 0);
    }
  }

  /**
   * Following are atomic functions for MSP related communications. All other
   * functionality is built on top of this functions.
   */

  /**
   * @typeof MspApiVersion
   * @property {string} apiVersion
   * @property {number} mspProtocolVersion
   */

  /**
   * @typeof MspFcVariant
   * @property {string} flightControllerIdentifier
   */

  /**
   * @typeof MspFcVersion
   * @property {string} flightControllerVersion
   */

  /**
   * @typeof MspBuildInfo
   * @property {string} buildInfo
   */

  /**
   * @typeof MspBoardInfo
   * @property {string} boardIdentifier
   * @property {string} boardVersion
   */

  /**
   * @typeof MspUid
   * @property {Uint32Array} uid
   */

  /**
   * @typeof MspBatteryState
   * @property {number} cellCount
   * @property {number} capacity
   * @property {number} voltage
   * @property {number} draw
   * @property {number} amps
   * @property {number} state
   */

  /**
   * @typeof MspFeatureConfig
   * @property {boolean} RX_PPM
   * @property {boolean} INFLIGHT_ACC_CAL
   * @property {boolean} RX_SERIAL
   * @property {boolean} MOTOR_STOP
   * @property {boolean} SERVO_TILT
   * @property {boolean} SOFTSERIAL
   * @property {boolean} GPS
   * @property {boolean} SONAR
   * @property {boolean} TELEMETRY
   * @property {boolean} 3D
   * @property {boolean} RX_PARALLEL_PWM
   * @property {boolean} RX_MSP
   * @property {boolean} RSSI_ADC
   * @property {boolean} LED_STRIP
   * @property {boolean} DISPLAY
   */

  /**
   * Get API and protocol version
   *
   * @returns {Promise<MspApiVersion>}
   */
  getApiVersion () {
    return this.send(MSP.MSP_API_VERSION);
  }

  /**
   * Get FC variant
   *
   * @returns {Promise<MspFcVariant>}
   */
  getFcVariant() {
    return this.send(MSP.MSP_FC_VARIANT);
  }

  /**
   * Get FC version
   *
   * @returns {Promise<MspFcVersion>}
   */
  getFcVersion() {
    return this.send(MSP.MSP_FC_VERSION);
  }

  /**
   * Get build info
   *
   * @returns {Promise<MspBuildInfo>}
   */
  getBuildInfo() {
    return this.send(MSP.MSP_BUILD_INFO);
  }

  /**
   * Get board info
   *
   * @returns {Promise<MspBoardInfo>}
   */
  getBoardInfo() {
    return this.send(MSP.MSP_BOARD_INFO);
  }

  /**
   * Get Status
   *
   * @returns {Promise<MspStatus>}
   */
  getStatus() {
    return this.send(MSP.MSP_STATUS);
  }

  /**
   * Get board info
   *
   * @returns {Promise<MspUid>}
   */
  getUid() {
    return this.send(MSP.MSP_UID);
  }

  /**
   * Get motor data
   *
   * @returns {Promise<Uint16Array>}
   */
  getMotorData() {
    return this.send(MSP.MSP_MOTOR);
  }

  /**
   * Get battery info
   *
   * @returns {Promise<MspBatteryState>}
   */
  getBatteryState() {
    return this.send(MSP.MSP_BATTERY_STATE);
  }

  /**
   * Get feature config
   *
   * @returns {Promise<MspFeatureConfig>}
   */
  getFeatures() {
    return this.send(MSP.MSP_FEATURE_CONFIG);
  }

  /**
   * Set Motor speed
   *
   * @returns {Promise}
   */
  setMotor(params) {
    return this.send(MSP.MSP_SET_MOTOR, params);
  }

  /**
   * Enable four way interface
   *
   * Once the four way interface is enabled, the device needs to either be reset
   * via four way interface or powere cycled in order for the MSP to pick up
   * normal communication.
   *
   * @returns {Promise}
   */
  set4WayIf() {
    return this.send(MSP.MSP_SET_PASSTHROUGH);
  }
}

export default Msp;
