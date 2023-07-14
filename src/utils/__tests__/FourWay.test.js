let serial;
let resolve;
let reject;
let fourWay;
let FourWay;

describe('FourWay', () => {
  beforeAll(async() => {
    /**
     * require component instead of import so that we can properly
     * pre-populate the local storage
     */
    FourWay = require('../FourWay').default;
  });

  beforeEach(() => {
    serial = jest.fn();
    resolve = jest.fn();
    reject = jest.fn();
    fourWay = new FourWay(serial);
  });

  it('should handle starting with invalid serial', async() => {
    const failingSerial = () => { throw new Error(); };
    fourWay = new FourWay(failingSerial);

    expect(() => fourWay.start()).not.toThrow();

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  });

  it('should start with valid  serial', async() => {
    fourWay.start();

    await new Promise((r) => {
      setTimeout(() => {
        r();
      }, 1000);
    });

    expect(serial).toHaveBeenCalled();
  });

  it('should exit', async() => {
    fourWay.exit();
    expect(serial).toHaveBeenCalled();
  });

  it('should reset', async() => {
    fourWay.reset();
    expect(serial).toHaveBeenCalled();
  });

  it('should writeEEprom', async() => {
    fourWay.writeEEprom();
    expect(serial).toHaveBeenCalled();
  });

  it('should write', async() => {
    fourWay.write();
    expect(serial).toHaveBeenCalled();
  });

  it('should readEEprom', async() => {
    fourWay.readEEprom();
    expect(serial).toHaveBeenCalled();
  });

  it('should read', async() => {
    fourWay.read();
    expect(serial).toHaveBeenCalled();
  });

  it('should page erase', async() => {
    fourWay.erasePage();
    expect(serial).toHaveBeenCalled();
  });

  it('should erase pages', async() => {
    fourWay.erasePages();
    expect(serial).not.toHaveBeenCalled();

    fourWay.erasePages(0, 1);
    expect(serial).toHaveBeenCalled();
  });

  it('should erase page', async() => {
    fourWay.erasePage(0);
    expect(serial).toHaveBeenCalled();
  });

  it('should init flash', async() => {
    fourWay.initFlash();
    expect(serial).toHaveBeenCalled();
  });

  it('should get info', async() => {
    await expect(fourWay.getInfo()).rejects.toThrow();
    expect(serial).toHaveBeenCalled();
  });

  it('should be possible to log', async() => {
    const logCallback = jest.fn();
    fourWay.setLogCallback(logCallback);

    fourWay.addLogMessage();
    expect(logCallback).toHaveBeenCalled();
  });

  it('should parse message without params', () => {
    const buffer = fourWay.createMessage(0x30, []);
    expect(buffer.byteLength).toEqual(8);
  });

  it('should parse message with too many params', () => {
    expect(() => fourWay.createMessage(0x30, new Array(300))).toThrow();
  });

  it('should parse empty message', () => {
    fourWay.parseMessage([], resolve, reject);
    expect(reject).toHaveBeenCalled();
  });

  it('should parse message which is too short', () => {
    fourWay.parseMessage([0x2e], resolve, reject);
    expect(reject).toHaveBeenCalled();
  });

  it('should parse message where parameters are too short', () => {
    fourWay.parseMessage([0x2e, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0], resolve, reject);
    expect(reject).toHaveBeenCalled();
  });

  it('should parse message where max parameters are too short', () => {
    fourWay.parseMessage([0x2e, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], resolve, reject);
    expect(reject).toHaveBeenCalled();
  });

  it('should handle a checksum mismatch', () => {
    fourWay.parseMessage([0x2e, 1, 2, 3, 1, 5, 6, 7, 8, 9, 10], resolve, reject);
    expect(reject).toHaveBeenCalled();
  });

  it('should parse a valid message', () => {
    fourWay.parseMessage([46, 48, 0, 0, 1, 0, 0, 68, 194], resolve, reject);
    expect(resolve).toHaveBeenCalled();
  });

  it('should handle serial error while sending', async() => {
    const failingSerial = () => { throw new Error(); };
    fourWay = new FourWay(failingSerial);
    expect(fourWay.testAlive()).toMatchObject({});
  });

  it('should handle serial resolve', async() => {
    const serial = () => ({
      "command": 48,
      "address": 0,
      "ack": 0,
      "checksum": 17602,
      "params": { "0": 0 },
    });

    fourWay = new FourWay(serial);
    await expect(fourWay.testAlive()).resolves.toMatchObject(serial());
  });

  it('should handle extended debug', async() => {
    const serial = () => ({
      "command": 48,
      "address": 0,
      "ack": 0,
      "checksum": 17602,
      "params": { "0": 0 },
    });

    fourWay = new FourWay(serial);
    await expect(fourWay.testAlive()).resolves.toMatchObject(serial());
  });
});
