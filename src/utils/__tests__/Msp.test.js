import { store } from '../../store';
import Msp, { MSP } from '../Msp';

let serial;
let msp;

describe('Msp', () => {
  beforeEach(() => {
    serial = jest.fn();
    msp = new Msp(serial);
  });

  it('should be possible to log', async() => {
    const logCallback = jest.fn();

    msp.setLogCallback(logCallback);
    msp.addLogMessage();

    expect(logCallback).toHaveBeenCalled();
  });

  it('should return API version', async() => {
    await expect(msp.getApiVersion()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should return FC variant', async() => {
    await expect(msp.getFcVariant()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should return FC version', async() => {
    await expect(msp.getFcVersion()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should return build info', async() => {
    await expect(msp.getBuildInfo()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should return board info', async() => {
    await expect(msp.getBoardInfo()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should return status', async() => {
    await expect(msp.getStatus()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should return UUID', async() => {
    await expect(msp.getUid()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should return motor data', async() => {
    await expect(msp.getMotorData()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should return battery state', async() => {
    await expect(msp.getBatteryState()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should return features', async() => {
    await expect(msp.getFeatures()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should set 4 way interface', async() => {
    await expect(msp.set4WayIf()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should spin all motors', async() => {
    await expect(msp.spinAllMotors()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should spin one motor', async() => {
    await expect(msp.spinMotor()).resolves.toEqual(undefined);
    expect(serial).toHaveBeenCalled();
  });

  it('should increase packet errors', async() => {
    msp.increasePacketErrors(10);

    const status = store.getState().status;
    expect(status.packetErrors).toEqual(10);
  });

  it('should send V1 command', async() => {
    expect(() => msp.send(200, [])).not.toThrow();
  });

  it('should send V2 command', async() => {
    expect(() => msp.send(255, [])).not.toThrow();
  });

  it('should encode V1 - no data', async() => {
    const code = '';
    const data = [];
    const result = msp.encodeV1(code, data);
    expect(result.byteLength).toEqual(6);
  });

  it('should encode V1', async() => {
    const code = 114;
    const data = new Uint8Array([220, 5, 220, 5, 220, 5, 220, 5, 0, 0, 0, 0, 0, 0, 0, 0]);

    const result = msp.encodeV1(code, data);
    expect(result.byteLength).toEqual(22);
  });

  it('should encode V2 - no data', async() => {
    const code = '';

    const result = msp.encodeV2(code);
    expect(result.byteLength).toEqual(9);
  });

  it('should calculate correct DVB-S2 checksum', async() => {
    const data = new Uint8Array([220, 5, 220, 5, 220, 5, 220, 5, 0, 0, 0, 0, 0, 0, 0, 0]);
    const expectedResult = 144;

    const result = msp.crc8DvbS2Data(data, 0, data.length);
    expect(result).toEqual(expectedResult);
  });

  it('should encode V2 with data', async() => {
    const code = 114;
    const data = new Uint8Array([220, 5, 220, 5, 220, 5, 220, 5, 0, 0, 0, 0, 0, 0, 0, 0]);

    const result = msp.encodeV2(code, data);
    expect(result.byteLength).toEqual(25);
  });

  it('should read data with payload ($M>)', () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    // $M>[4]Xdata[76]
    let data = "$M>".split("").map((char) => char.charCodeAt(0));
    data.push(4);
    data = data.concat("Xdata".split("").map((char) => char.charCodeAt(0)));
    data.push(76);

    msp.read(data, resolve, reject);

    expect(resolve).toBeCalled();
  });

  it('should read data with payload ($M<)', () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    // $M>[4]Xdata[76]
    let data = "$M<".split("").map((char) => char.charCodeAt(0));
    data.push(4);
    data = data.concat("Xdata".split("").map((char) => char.charCodeAt(0)));
    data.push(76);

    msp.read(data, resolve, reject);

    expect(resolve).toBeCalled();
  });

  it('should read data with unsupported direction ($M!)', () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    // $M>[4]Xdata[76]
    let data = "$M!".split("").map((char) => char.charCodeAt(0));
    data.push(4);
    data = data.concat("Xdata".split("").map((char) => char.charCodeAt(0)));
    data.push(76);

    msp.read(data, resolve, reject);

    expect(resolve).toBeCalled();
    expect(msp.unsupported).toEqual(1);
  });

  it('should read data with invalid direction ($M?)', () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    // $M>[4]Xdata[76]
    let data = "$M?".split("").map((char) => char.charCodeAt(0));
    data.push(4);
    data = data.concat("Xdata".split("").map((char) => char.charCodeAt(0)));
    data.push(76);

    msp.read(data, resolve, reject);

    expect(resolve).toBeCalled();
  });

  it('should reject read data with wrong starting sequence', () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    let data = "$X>".split("").map((char) => char.charCodeAt(0));

    msp.read(data, resolve, reject);

    expect(reject).toBeCalled();
  });

  it('should reject read with not enough data', async() => {
    const resolve = jest.fn();
    const reject = jest.fn();

    // $M>[4]Xd
    let data = "$M>".split("").map((char) => char.charCodeAt(0));
    data.push(4);
    data = data.concat("Xd".split("").map((char) => char.charCodeAt(0)));

    msp.read(data, resolve, reject);

    expect(reject).toHaveBeenCalled();
  });

  it('should resolve read data without payload ($M>)', () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    // $M>[4]X[88]
    let data = "$M>".split("").map((char) => char.charCodeAt(0));
    data.push(0);
    data = data.concat("X".split("").map((char) => char.charCodeAt(0)));
    data.push(88);

    msp.read(data, resolve, reject);

    expect(resolve).toBeCalled();
  });

  it('should reject read data without payload ($M>)', () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    // $M>[4]X[88]
    let data = "$M>".split("").map((char) => char.charCodeAt(0));
    data.push(0);
    data = data.concat("X".split("").map((char) => char.charCodeAt(0)));
    data.push(0);

    msp.read(data, resolve, reject);

    expect(reject).toBeCalled();
  });

  it('should process MSP_IDENT command', () => {
    const messageArray = new Uint8Array([
      1,
      2,
      3,
      1, 0, 0, 0,
    ]);
    const result = msp.processData(MSP.MSP_IDENT, messageArray.buffer, null);

    expect(result).toMatchObject({
      capability: 1,
      msp_version: 3,
      multiType:  2,
      version: 0.01,
    });
  });

  it('should process MSP_STATUS command', () => {
    const messageArray = new Uint8Array([
      0, 0,
      0, 0,
      0, 0,
      0, 0, 0, 0,
      0,
      0, 0,
      0,
      0,
      0,
      0,
      0, 0, 0, 0,
      0,
    ]);
    const result = msp.processData(MSP.MSP_STATUS, messageArray.buffer, null);

    expect(result).toMatchObject({
      activeSensors: 0,
      armingDisableFlags: 0,
      armingDisableFlagsCount: 0,
      armingDisableFlagsReasons: { RX_FAILSAFE: false },
      averageSysytemLoadPercent: 0,
      byteCount: 0,
      currentProfile: 0,
      currentRateProfile: 0,
      cycleTime: 0,
      i2cError: 0,
      mode: 0,
      pidProfileCount: 0,
      rebootRequired: 0,
    });
  });

  it('should process MSP_MOTOR command', () => {
    const messageArray = new Uint8Array([
      0, 1,
      255, 0,
    ]);
    const result = msp.processData(MSP.MSP_MOTOR, messageArray.buffer, 4);

    expect(result).toEqual([256, 255]);
  });

  it('should process MSP_SET_PASSTHROUGH command', () => {
    const messageArray = new Uint8Array([0]);
    const result = msp.processData(MSP.MSP_SET_PASSTHROUGH, messageArray.buffer, null);

    expect(result).toMatchObject({ connectedESCs: 0 });
  });

  it('should process MSP_UID command', () => {
    const messageArray = new Uint8Array([
      1, 0, 0, 0,
      2, 0, 0, 0,
      3, 0, 0, 0,
    ]);
    const result = msp.processData(MSP.MSP_UID, messageArray.buffer, null);

    expect(result).toMatchObject({ uid: [1, 2, 3] });
  });

  it('should process MSP_API_VERSION command', () => {
    const messageArray = new Uint8Array([
      1,
      2,
      3,
    ]);
    const result = msp.processData(MSP.MSP_API_VERSION, messageArray.buffer, null);

    expect(result).toMatchObject({
      apiVersion: "2.3.0",
      mspProtocolVersion: 1,
    });
  });

  it('should process MSP_FC_VARIANT command', () => {
    const messageArray = new Uint8Array([
      88,
      88,
      88,
      88,
    ]);
    const result = msp.processData(MSP.MSP_FC_VARIANT, messageArray.buffer, null);

    expect(result).toMatchObject({ flightControllerIdentifier: "XXXX" });
  });

  it('should process MSP_FC_VERSION command', () => {
    const messageArray = new Uint8Array([
      0,
      1,
      2,
    ]);
    const result = msp.processData(MSP.MSP_FC_VERSION, messageArray.buffer, null);

    expect(result).toMatchObject({ flightControllerVersion: "0.1.2" });
  });

  it('should process MSP_BUILD_INFO command', () => {
    const messageArray = new Uint8Array([
      88, 88, 88, 88, 88, 88, 88, 88, 88, 88, 88,
      88, 88, 88, 88, 88, 88, 88, 88,
    ]);
    const result = msp.processData(MSP.MSP_BUILD_INFO, messageArray.buffer, null);

    expect(result).toMatchObject({ buildInfo: "XXXXXXXXXXX XXXXXXXX" });
  });

  it('should process MSP_BOARD_INFO command', () => {
    const messageArray = new Uint8Array([
      88, 88, 88, 88,
      1, 0,
    ]);
    const result = msp.processData(MSP.MSP_BOARD_INFO, messageArray.buffer, null);

    expect(result).toMatchObject({
      boardIdentifier: "XXXX",
      boardVersion: 1,
    });
  });

  it('should process MSP_FEATURE_CONFIG command', () => {
    const messageArray = new Uint8Array([
      1, 0, 0, 0,
    ]);
    const result = msp.processData(MSP.MSP_FEATURE_CONFIG, messageArray.buffer, null);

    expect(result).toMatchObject({
      "3D": false,
      DISPLAY: false,
      GPS: false,
      INFLIGHT_ACC_CAL: false,
      LED_STRIP: false,
      MOTOR_STOP: false,
      RSSI_ADC: false,
      RX_MSP: false,
      RX_PARALLEL_PWM: false,
      RX_PPM: true,
      RX_SERIAL: false,
      SERVO_TILT: false,
      SOFTSERIAL: false,
      SONAR: false,
      TELEMETRY: false,
    });
  });

  it('should process MSP_BATTERY_STATE command', () => {
    const messageArray = new Uint8Array([
      1,
      1, 0,
      1,
      1, 0,
      1, 0,
      1,
      1, 0,
    ]);
    msp.version = '1.41.0';
    const result = msp.processData(MSP.MSP_BATTERY_STATE, messageArray.buffer, null);

    expect(result).toMatchObject({
      amps: 0.01,
      capacity: 1,
      cellCount: 1,
      drawn: 1,
      state: 1,
      voltage: 0.01,
    });
  });

  it('should process MSP_BATTERY_STATE command (less precise voltage)', () => {
    const messageArray = new Uint8Array([
      1,
      1, 0,
      1,
      1, 0,
      1, 0,
      1,
    ]);
    msp.version = '1.41.0';
    const result = msp.processData(MSP.MSP_BATTERY_STATE, messageArray.buffer, null);

    expect(result).toMatchObject({
      amps: 0.01,
      capacity: 1,
      cellCount: 1,
      drawn: 1,
      state: 1,
      voltage: 0.1,
    });
  });

  it('should process MSP_BATTERY_STATE command (old version)', () => {
    const messageArray = new Uint8Array([
      1,
      1, 0,
      1,
      1, 0,
      1, 0,
      1,
      1, 0,
    ]);
    msp.version = '1.23.0';
    const result = msp.processData(MSP.MSP_BATTERY_STATE, messageArray.buffer, null);

    expect(result).toMatchObject({
      amps: 0.01,
      capacity: 1,
      cellCount: 1,
      drawn: 1,
      voltage: 0.1,
    });
  });

  it('should process MSP_SET_3D command (old version)', () => {
    const messageArray = new Uint8Array([]);
    const result = msp.processData(MSP.MSP_SET_3D, messageArray.buffer, null);

    expect(result).toBeNull();
  });

  it('should process MSP_SET_MOTOR command (old version)', () => {
    const messageArray = new Uint8Array([]);
    const result = msp.processData(MSP.MSP_SET_MOTOR, messageArray.buffer, null);

    expect(result).toBeNull();
  });

  it('should handle invalid command', () => {
    const messageArray = new Uint8Array([]);
    const result = msp.processData(9999, messageArray.buffer, null);

    expect(result).toBeNull();
  });

  it('should handle unsupported proccess data', () => {
    const messageArray = new Uint8Array([]);
    msp.unsupported = true;
    const result = msp.processData(MSP.MSP_BATTERY_STATE, messageArray.buffer, null);

    expect(result).toBeNull();
  });

  it('should handle unsupported proccess data (passthrough)', () => {
    const messageArray = new Uint8Array([]);
    msp.unsupported = true;
    const result = msp.processData(MSP.MSP_SET_PASSTHROUGH, messageArray.buffer, null);

    expect(result).toBeNull();
  });

  it('should stop motors', () => {
    const spinAllMotors = jest.fn();
    msp.spinAllMotors = spinAllMotors;
    msp.motorsSpinning = true;
    msp.getFeatures = () => ({});

    const result = msp.stopAllMotors();

    expect(result).toMatchObject({});
  });

  it('should stop motors (in 3D mode)', () => {
    const spinAllMotors = jest.fn();
    msp.spinAllMotors = spinAllMotors;
    msp.motorsSpinning = true;
    msp.getFeatures = () => ({ "3D": true });

    const result = msp.stopAllMotors();

    expect(result).toMatchObject({});
  });
});
