import compareVersions from 'compare-versions';

import { NotEnoughDataError } from './helpers/QueueProcessor';

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
  constructor(serial) {
    this.serial = serial;

    this.unsupported = 0;

    this.messageDirection = 1; // ????

    this.read = this.read.bind(this);

    this.logCallback = null;
    this.packetErrorsCallback = null;

    const speedBufferOut = new ArrayBuffer(16);
    this.speedBufView = new Uint8Array(speedBufferOut);

    this.version = null;
  }

  setLogCallback(logCallback) {
    this.logCallback = logCallback;
  }

  addLogMessage(message, params) {
    if(this.logCallback) {
      this.logCallback(message, params);
    }
  }

  setPacketErrorsCallback(packetErrorsCallback) {
    this.packetErrorsCallback = packetErrorsCallback;
  }

  increasePacketErrors(count) {
    if(this.packetErrorsCallback) {
      this.packetErrorsCallback(count);
    }
  }

  read(data, resolve, reject) {
    let code = 0;
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
          code = data[i];
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
              code,
              messageBuffer,
              messageLengthExpected
            );

            this.lastReceivedTimestamp = Date.now();

            return resolve(response);
          }

          this.increasePacketErrors(1);
          return reject(new Error(`code: ${code} - crc failed`));
        } break;

        default: {
          return reject(new Error(`Unknown state detected: ${state}`));
        }
      }
    }

    this.lastReceivedTimestamp = Date.now();

    return reject(new NotEnoughDataError());
  }

  encodeV1(code, data = []) {
    // Always reserve 6 bytes for protocol overhead !
    const size = 6 + data.length;
    const bufferOut = new ArrayBuffer(size);
    const bufView = new Uint8Array(bufferOut);

    bufView[0] = 36; // $
    bufView[1] = 77; // M
    bufView[2] = 60; // <
    bufView[3] = data.length;
    bufView[4] = code;

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

  crc8DvbS2(crc, ch) {
    crc ^= ch;
    for (let i = 0; i < 8; i += 1) {
      if (crc & 0x80) {
        crc = ((crc << 1) & 0xFF) ^ 0xD5;
      } else {
        crc = (crc << 1) & 0xFF;
      }
    }

    return crc;
  }

  crc8DvbS2Data(data, start, end) {
    let crc = 0;
    for (let i = start; i < end; i += 1) {
      crc = this.crc8DvbS2(crc, data[i]);
    }

    return crc;
  }

  encodeV2(code, data = []) {
    // Always reserve 9 bytes for protocol overhead !
    const dataLength = data.length;
    const size = 9 + dataLength;
    const bufferOut = new ArrayBuffer(size);
    const bufView = new Uint8Array(bufferOut);

    bufView[0] = 36; // $
    bufView[1] = 88; // X
    bufView[2] = 60; // <
    bufView[3] = 0;  // flag
    bufView[4] = code & 0xFF;
    bufView[5] = (code >> 8) & 0xFF;
    bufView[6] = dataLength & 0xFF;
    bufView[7] = (dataLength >> 8) & 0xFF;

    for (let i = 0; i < dataLength; i += 1) {
      bufView[8 + i] = data[i];
    }

    bufView[size - 1] = this.crc8DvbS2Data(bufView, 3, size - 1);

    return bufferOut;
  }

  async send(code, data) {
    const process = async (resolve, reject) => {
      let bufferOut;

      if(code <= 254) {
        bufferOut = this.encodeV1(code, data);
      } else {
        bufferOut = this.encodeV2(code, data);
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

  getApiVersion () {
    return this.send(MSP.MSP_API_VERSION);
  }

  getFcVariant() {
    return this.send(MSP.MSP_FC_VARIANT);
  }

  getFcVersion() {
    return this.send(MSP.MSP_FC_VERSION);
  }

  getBuildInfo() {
    return this.send(MSP.MSP_BUILD_INFO);
  }

  getBoardInfo() {
    return this.send(MSP.MSP_BOARD_INFO);
  }

  getUid() {
    return this.send(MSP.MSP_UID);
  }

  getMotorData() {
    return this.send(MSP.MSP_MOTOR);
  }

  getBatteryState() {
    return this.send(MSP.MSP_BATTERY_STATE);
  }

  getFeatures() {
    return this.send(MSP.MSP_FEATURE_CONFIG);
  }

  set4WayIf() {
    return this.send(MSP.MSP_SET_PASSTHROUGH);
  }

  spinAllMotors(speed) {
    for(let i = 0; i < 8; i += 2) {
      this.speedBufView[i] = 0x00ff & speed;
      this.speedBufView[i + 1] = speed >> 8;
    }

    return this.send(MSP.MSP_SET_MOTOR, this.speedBufView);
  }

  spinMotor(motor, speed) {
    const offset = (motor - 1) * 2;

    this.speedBufView[offset] = 0x00ff & speed;
    this.speedBufView[offset + 1] = speed >> 8;

    return this.send(MSP.MSP_SET_MOTOR, this.speedBufView);
  }

  processData(code, messageBuffer, messageLength) {
    // DataView (allowing us to view arrayBuffer as struct/union)
    const data = new DataView(
      messageBuffer,
      0
    );
    const config = {};
    const escConfig = {};
    const motorData = [];

    if (!this.unsupported) {
      switch (code) {
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
          config.profile = data.getUint8(10);

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

        case MSP.MSP_SET_MOTOR: {
          // Motor speeds updated
        } break;

        // Additional baseflight commands that are not compatible with MultiWii
        case MSP.MSP_UID: {
          config.uid = [];
          config.uid[0] = data.getUint32(0, 1);
          config.uid[1] = data.getUint32(4, 1);
          config.uid[2] = data.getUint32(8, 1);

          return config;
        }

        /*
       *
       * Cleanflight specific
       *
       */
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
          FEATURES.map((key, index) => {
            if(key) {
              const mask = 1 << index;
              const item = {
                key,
                enabled: (featureBits & mask) !== 0,
              };

              features[key] = item.enabled;
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

        default: {
          console.debug('Unknown code detected:', code);
        }
      }
    } else if (code === MSP.MSP_SET_PASSTHROUGH) {
      this.addLogMessage('passthroughNotSupported');
    } else {
      console.debug('FC reports unsupported message error:', code);
    }

    return null;
  }
}

export default Msp;
