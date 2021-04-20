import Msp from '../Msp';

test('log callback', async() => {
  const serial = jest.fn();
  const logCallback = jest.fn();
  const msp = new Msp(serial);

  msp.setLogCallback(logCallback);
  msp.addLogMessage();

  expect(logCallback).toHaveBeenCalled();
});

test('packet errror callback', async() => {
  const serial = jest.fn();
  const errorCallback = jest.fn();
  const msp = new Msp(serial);

  msp.setPacketErrorsCallback(errorCallback);
  msp.increasePacketErrors();

  expect(errorCallback).toHaveBeenCalled();
});

test('get API version', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.getApiVersion()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('get FC variant', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.getFcVariant()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('get FC version', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.getFcVersion()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('get Build info', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.getBuildInfo()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('get Board info', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.getBoardInfo()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('get UUID', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.getUid()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('get motor data', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.getMotorData()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('get battery state', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.getBatteryState()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('get features', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.getFeatures()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('set 4 way interface', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.set4WayIf()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('spin all motors', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.spinAllMotors()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('spin one motor', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);

  await expect(msp.spinMotor()).resolves.toEqual(undefined);
  expect(serial).toHaveBeenCalled();
});

test('encode V1 - no data', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);
  const code = '';
  const data = [];

  const result = msp.encodeV1(code, data);
  expect(result.byteLength).toEqual(6);
});

test('encode V1', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);
  const code = 114;
  const data = new Uint8Array([220, 5, 220, 5, 220, 5, 220, 5, 0, 0, 0, 0, 0, 0, 0, 0]);

  const result = msp.encodeV1(code, data);
  expect(result.byteLength).toEqual(22);
});

test('encode V2 - no data', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);
  const code = '';
  const data = [];

  const result = msp.encodeV2(code, data);
  expect(result.byteLength).toEqual(9);
});

test('encode V2', async() => {
  const serial = jest.fn();
  const msp = new Msp(serial);
  const code = 114;
  const data = new Uint8Array([220, 5, 220, 5, 220, 5, 220, 5, 0, 0, 0, 0, 0, 0, 0, 0]);

  const result = msp.encodeV2(code, data);
  expect(result.byteLength).toEqual(25);
});
