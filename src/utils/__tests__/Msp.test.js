import Msp from '../Msp';

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
    const data = [];

    const result = msp.encodeV2(code, data);
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

    console.log(result);
  });
});
