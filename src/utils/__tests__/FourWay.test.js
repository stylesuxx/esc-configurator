import FourWay from '../FourWay';

test('FourWay start', async() => {
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

test('FourWay exit', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.exit();
  expect(serial).toHaveBeenCalled();
});

test('FourWay reset', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.reset();
  expect(serial).toHaveBeenCalled();
});

test('FourWay writeEEprom', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.writeEEprom();
  expect(serial).toHaveBeenCalled();
});

test('FourWay write', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.write();
  expect(serial).toHaveBeenCalled();
});

test('FourWay readEEprom', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.readEEprom();
  expect(serial).toHaveBeenCalled();
});

test('FourWay read', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.read();
  expect(serial).toHaveBeenCalled();
});

test('FourWay pageErase', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.pageErase();
  expect(serial).toHaveBeenCalled();
});

test('FourWay erasePages', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.erasePages();
  expect(serial).not.toHaveBeenCalled();

  fourWay.erasePages(0, 1);
  expect(serial).toHaveBeenCalled();
});

test('FourWay erasePage', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.erasePage(0);
  expect(serial).toHaveBeenCalled();
});

test('FourWay initFlash', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.initFlash();
  expect(serial).toHaveBeenCalled();
});

test('FourWay getInfo', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  fourWay.getInfo();
  expect(serial).toHaveBeenCalled();
});

test('FourWay logCallback', async() => {
  const serial = jest.fn();
  const logCallback = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.setLogCallback(logCallback);

  fourWay.addLogMessage();
  expect(logCallback).toHaveBeenCalled();
});

test('FourWay packetErrorCallback', async() => {
  const serial = jest.fn();
  const packetErrorsCallback = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.setPacketErrorsCallback(packetErrorsCallback);

  fourWay.increasePacketErrors(1);
  expect(packetErrorsCallback).toHaveBeenCalled();
});

test('FourWay commandToString', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);
  const string = fourWay.commandToString(0xDEADBEEF);

  expect(string).toBeNull();
});

test('FourWay valid ack', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);
  const string = fourWay.ackToString(0x00);

  expect(string).toEqual('ACK_OK');
});

test('FourWay invalid ack', async() => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);
  const string = fourWay.ackToString(0xDEADBEEF);

  expect(string).toBeNull();
});

test('FourWay command, no params', () => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);
  const buffer = fourWay.createMessage(0x30, []);

  expect(buffer.byteLength).toEqual(8);
});

test('FourWay command too many params', () => {
  const serial = jest.fn();
  const fourWay = new FourWay(serial);

  expect(() => fourWay.createMessage(0x30, new Array(300))).toThrow();
});

test('FourWay parseMessage no forway', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([], resolve, reject);

  expect(reject).toHaveBeenCalled();
});

test('FourWay parseMessage too short', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([0x2e], resolve, reject);

  expect(reject).toHaveBeenCalled();
});

test('FourWay parseMessage with param too short', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([0x2e, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0], resolve, reject);

  expect(reject).toHaveBeenCalled();
});

test('FourWay parseMessage max param too short', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([0x2e, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], resolve, reject);

  expect(reject).toHaveBeenCalled();
});

test('FourWay parseMessage checksum mismatch', () => {
  const serial = jest.fn();
  const resolve = jest.fn();
  const reject = jest.fn();
  const fourWay = new FourWay(serial);
  fourWay.parseMessage([0x2e, 1, 2, 3, 1, 5, 6, 7, 8, 9, 10], resolve, reject);

  expect(reject).toHaveBeenCalled();
});
