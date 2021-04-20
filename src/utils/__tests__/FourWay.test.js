import FourWay from '../FourWay';

test('failed start', async() => {
  const serial = () => { throw new Error(); };
  const fourWay = new FourWay(serial);

  fourWay.start();

  await new Promise((r) => {
    setTimeout(() => {
      r();
    }, 1000);
  });
});

test('start', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.start();

  await new Promise((r) => {
    setTimeout(() => {
      r();
    }, 1000);
  });

  expect(serial).toHaveBeenCalled();
});

test('exit', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.exit();
  expect(serial).toHaveBeenCalled();
});

test('reset', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.reset();
  expect(serial).toHaveBeenCalled();
});

test('writeEEprom', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.writeEEprom();
  expect(serial).toHaveBeenCalled();
});

test('write', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.write();
  expect(serial).toHaveBeenCalled();
});

test('readEEprom', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.readEEprom();
  expect(serial).toHaveBeenCalled();
});

test('read', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.read();
  expect(serial).toHaveBeenCalled();
});

test('pageErase', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.pageErase();
  expect(serial).toHaveBeenCalled();
});

test('erasePages', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.erasePages();
  expect(serial).not.toHaveBeenCalled();

  fourWay.erasePages(0, 1);
  expect(serial).toHaveBeenCalled();
});

test('erasePage', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.erasePage(0);
  expect(serial).toHaveBeenCalled();
});

test('initFlash', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.initFlash();
  expect(serial).toHaveBeenCalled();
});

test('getInfo', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  await expect(fourWay.getInfo()).rejects.toThrow();
  expect(serial).toHaveBeenCalled();
});

test('logCallback', async() => {
  const serial = jest.fn();
  const logCallback = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.setLogCallback(logCallback);

  fourWay.addLogMessage();
  expect(logCallback).toHaveBeenCalled();
});

test('packetErrorCallback', async() => {
  const serial = jest.fn();
  const packetErrorsCallback = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.setPacketErrorsCallback(packetErrorsCallback);

  fourWay.increasePacketErrors(1);
  expect(packetErrorsCallback).toHaveBeenCalled();
});

test('commandToString', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);
  const string = fourWay.commandToString(0xDEADBEEF);

  expect(string).toBeNull();
});

test('valid ack', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);
  const string = fourWay.ackToString(0x00);

  expect(string).toEqual('ACK_OK');
});

test('invalid ack', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);
  const string = fourWay.ackToString(0xDEADBEEF);

  expect(string).toBeNull();
});

test('parse message without params', () => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);
  const buffer = fourWay.createMessage(0x30, []);

  expect(buffer.byteLength).toEqual(8);
});

test('parse message with too many params', () => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  expect(() => fourWay.createMessage(0x30, new Array(300))).toThrow();
});

test('parse empty message', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([], resolve, reject);

  expect(reject).toHaveBeenCalled();
});

test('parse message to short', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([0x2e], resolve, reject);

  expect(reject).toHaveBeenCalled();
});

test('parse parameters too short', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([0x2e, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0], resolve, reject);

  expect(reject).toHaveBeenCalled();
});

test('parse max parameters too short', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([0x2e, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], resolve, reject);

  expect(reject).toHaveBeenCalled();
});

test('parse checksum mismatch', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([0x2e, 1, 2, 3, 1, 5, 6, 7, 8, 9, 10], resolve, reject);

  expect(reject).toHaveBeenCalled();
});

test('parse valid message', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([46, 48, 0, 0, 1, 0, 0, 68, 194], resolve, reject);

  expect(resolve).toHaveBeenCalled();
});

test('serial error while sending', async() => {
  const serial = () => { throw new Error(); };

  const fourWay = new FourWay(serial);
  expect(fourWay.testAlive()).toMatchObject({});
});

test('serial resolve', async() => {
  const serial = () => ({
    "command": 48,
    "address": 0,
    "ack": 0,
    "checksum": 17602,
    "params": { "0": 0 },
  });

  const fourWay = new FourWay(serial);
  await expect(fourWay.testAlive()).resolves.toMatchObject(serial());
});
