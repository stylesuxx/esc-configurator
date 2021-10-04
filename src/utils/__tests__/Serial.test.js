jest.setTimeout(60000);

let port;
let cancel;
let releaseReadLock;
let releaseWriteLock;
let read;
let logCallback;
let packetErrorCallback;
let serial;
let Serial;

describe('Serial', () => {
  beforeAll(async() => {
    /**
     * require component instead of import so that we can properly
     * pre-populate the local storage
     */
    Serial = require('../Serial').default;
  });

  beforeEach(() => {
    cancel = jest.fn();
    releaseReadLock = jest.fn();
    releaseWriteLock = jest.fn();
    read = jest.fn();
    logCallback = jest.fn();
    packetErrorCallback = jest.fn();

    port = {
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

    serial = new Serial(port);
  });

  it('should throw without port', async() => {
    serial = new Serial();

    await expect(() => serial.open()).rejects.toThrow();
    await serial.close();
  });

  it('should read with port', async() => {
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

  it('should handle failed reads', async() => {
    const read = () => { throw new Error(); };

    port = {
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

    serial = new Serial(port);
    expect(() => serial.open()).not.toThrow();
  });

  it('should handle successful reads', async() => {
    const read = () => ({ value: { byteLength: 50 } });

    port = {
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

    serial = new Serial(port);
    expect(() => serial.open()).not.toThrow();
  });

  it('should execute MSP commands', async() => {
    const read = () => ({ value: { byteLength: 50 } });
    const write = jest.fn();

    port = {
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

    serial = new Serial(port);
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

  it('should toggle extended debugging', async() => {
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

    serial = new Serial(port);
    await serial.open();
    expect(port.open).toHaveBeenCalled();

    serial.setExtendedDebug(true);
    serial.setExtendedDebug(false);
  });

  it('should execute 4Way interface commands', async() => {
    const read = () => ({ value: { byteLength: 50 } });
    const write = jest.fn();

    port = {
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

    serial = new Serial(port);
    await serial.open();

    expect(serial.startFourWayInterface()).toBe(undefined);
    await expect(serial.exitFourWayInterface()).resolves.toBe(undefined);

    // Will throw errors without hardware being present
    await expect(serial.resetFourWayInterface()).rejects.toThrow();
    await expect(serial.getFourWayInterfaceInfo()).rejects.toThrow();
    await expect(serial.writeHex()).rejects.toThrow();
    await expect(serial.writeSettings()).rejects.toThrow();
  });
});
