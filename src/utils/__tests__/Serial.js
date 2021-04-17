import Serial from '../Serial';

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
