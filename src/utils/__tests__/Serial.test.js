import Serial from '../Serial';

jest.setTimeout(60000);

test('without port', async() => {
  const serial = new Serial();

  await expect(() => serial.open()).rejects.toThrow();
  await serial.close();
});

test('with port', async() => {
  const cancel = jest.fn();
  const releaseReadLock = jest.fn();
  const releaseWriteLock = jest.fn();
  const read = jest.fn();
  const logCallback = jest.fn();
  const packetErrorCallback = jest.fn();

  const port = {
    open: jest.fn(),
    close: jest.fn(),
    writable: { getWriter:  () => ({ releaseLock: releaseWriteLock }) },
    readable: {
      getReader:  () => ({
        releaseLock: releaseReadLock,
        read,
        cancel,
      }),
    },
  };

  const serial = new Serial(port);

  await serial.open();
  expect(port.open).toHaveBeenCalled();

  serial.setLogCallback(logCallback);
  serial.setPacketErrorsCallback(packetErrorCallback);

  const utilization = serial.getUtilization();
  expect(utilization.up).toEqual(0);
  expect(utilization.down).toEqual(0);

  await serial.close();
  expect(port.close).toHaveBeenCalled();
  expect(cancel).toHaveBeenCalled();
  expect(releaseReadLock).toHaveBeenCalled();
  expect(releaseWriteLock).toHaveBeenCalled();

  expect(read).toHaveBeenCalled();
});

test('fails reading', async() => {
  const cancel = jest.fn();
  const releaseReadLock = jest.fn();
  const releaseWriteLock = jest.fn();
  const read = () => { throw new Error(); };

  const port = {
    open: jest.fn(),
    close: jest.fn(),
    writable: { getWriter:  () => ({ releaseLock: releaseWriteLock }) },
    readable: {
      getReader:  () => ({
        releaseLock: releaseReadLock,
        read,
        cancel,
      }),
    },
  };

  const serial = new Serial(port);
  expect(() => serial.open()).not.toThrow();
});

test('succeeds reading', async() => {
  const cancel = jest.fn();
  const releaseReadLock = jest.fn();
  const releaseWriteLock = jest.fn();
  const read = () => ({ value: { byteLength: 50 } });

  const port = {
    open: jest.fn(),
    close: jest.fn(),
    writable: { getWriter:  () => ({ releaseLock: releaseWriteLock }) },
    readable: {
      getReader:  () => ({
        releaseLock: releaseReadLock,
        read,
        cancel,
      }),
    },
  };

  const serial = new Serial(port);
  expect(() => serial.open()).not.toThrow();
});

test('MSP', async() => {

  const cancel = jest.fn();
  const releaseReadLock = jest.fn();
  const releaseWriteLock = jest.fn();
  const read = () => ({ value: { byteLength: 50 } });
  const write = jest.fn();

  const port = {
    open: jest.fn(),
    close: jest.fn(),
    writable: {
      getWriter:  () => ({
        releaseLock: releaseWriteLock,
        write,
      }),
    },
    readable: {
      getReader:  () => ({
        releaseLock: releaseReadLock,
        read,
        cancel,
      }),
    },
  };

  const serial = new Serial(port);
  await serial.open();

  // commands will all time out
  await expect(() => serial.enable4WayInterface()).rejects.toThrow();
  await expect(() => serial.getApiVersion()).rejects.toThrow();
  await expect(() => serial.getBatteryState()).rejects.toThrow();
  await expect(() => serial.getBoardInfo()).rejects.toThrow();
  await expect(() => serial.getBuildInfo()).rejects.toThrow();
  await expect(() => serial.getFcVariant()).rejects.toThrow();
  await expect(() => serial.getFcVersion()).rejects.toThrow();
  await expect(() => serial.getFeatures()).rejects.toThrow();
  await expect(() => serial.getMotorData()).rejects.toThrow();
  await expect(() => serial.getUid()).rejects.toThrow();
  await expect(() => serial.spinAllMotors()).rejects.toThrow();
  await expect(() => serial.spinMotor()).rejects.toThrow();
});

test('4Way interface', async() => {

  const cancel = jest.fn();
  const releaseReadLock = jest.fn();
  const releaseWriteLock = jest.fn();
  const read = () => ({ value: { byteLength: 50 } });
  const write = jest.fn();

  const port = {
    open: jest.fn(),
    close: jest.fn(),
    writable: {
      getWriter:  () => ({
        releaseLock: releaseWriteLock,
        write,
      }),
    },
    readable: {
      getReader:  () => ({
        releaseLock: releaseReadLock,
        read,
        cancel,
      }),
    },
  };

  const serial = new Serial(port);
  await serial.open();

  expect(serial.startFourWayInterface()).toBe(undefined);
  await expect(serial.exitFourWayInterface()).resolves.toBe(undefined);

  // Will return null because no hardware is connected

  // Will throw errors without hardware being present
  await expect(serial.resetFourWayInterface()).rejects.toThrow();
  await expect(serial.getFourWayInterfaceInfo()).rejects.toThrow();
  await expect(serial.writeHex()).rejects.toThrow();
  await expect(serial.writeSettings()).rejects.toThrow();
});
