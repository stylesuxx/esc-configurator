import {
  NotEnoughDataError,
  TimeoutError,
  QueueProcessor,
} from '../QueueProcessor';

test('command times out', async() => {
  const qp = new QueueProcessor();
  const receive = (buffer, resolve, reject) => {
    reject(new NotEnoughDataError());
  };

  const transmit = () => {
    qp.addData(new Uint8Array([1, 2, 3]));
  };

  await expect(qp.addCommand(transmit, receive)).rejects.toThrow(TimeoutError);
});

test('command times out while processing', async() => {
  const qp = new QueueProcessor();

  const transmit = () => {
    setTimeout(() => {
      qp.addData(new Uint8Array([1, 2, 3]));
    }, 200);
  };

  const command = (buffer, resolve, reject) => {
    setTimeout(() => {
      reject(new NotEnoughDataError());
    }, 2000);
  };

  await expect(qp.addCommand(transmit, command)).rejects.toThrow(TimeoutError);
});

test('command fails', async() => {
  const qp = new QueueProcessor();
  const command = (buffer, resolve, reject) => {
    reject(new Error('command failed'));
  };

  const transmit = () => {
    setTimeout(() => {
      qp.addData(new Uint8Array([1, 2, 3]));
    }, 200);
  };

  await expect(qp.addCommand(transmit, command)).rejects.toThrow(Error);
});

test('transmit fails', async() => {
  const qp = new QueueProcessor();
  const command = (buffer, resolve) => {
    resolve(true);
  };

  const transmit = () => {
    throw new RangeError('invalid or out-of-range index');
  };

  await expect(qp.addCommand(transmit, command)).rejects.toThrow(RangeError);
});

test('transmit fails - queue keeps working', async() => {
  const qp = new QueueProcessor();
  const command = (buffer, resolve) => {
    resolve(buffer);
  };

  const failingTransmit = async() => {
    throw new RangeError('invalid or out-of-range index');
  };

  const transmit = () => {
    qp.addData(new Uint8Array([1, 2, 3]));
  };

  const failed = qp.addCommand(failingTransmit, command);
  const succeeded = qp.addCommand(transmit, command);

  await expect(failed).rejects.toThrow(RangeError);
  expect(await succeeded).toEqual(new Uint8Array([1, 2, 3]));
});

test('command resolves', async() => {
  const qp = new QueueProcessor();
  const command = (buffer, resolve) => {
    resolve(true);
  };

  const transmit = () => {
    setTimeout(() => {
      qp.addData(new Uint8Array([1, 2, 3]));
    }, 200);
  };

  const result = await qp.addCommand(transmit, command);
  expect(result).toBeTruthy();
});

test('command no receive handler', async() => {
  const qp = new QueueProcessor();

  const transmit = () => {
    setTimeout(() => {
      qp.addData(new Uint8Array([1, 2, 3]));
    }, 200);
  };

  const result = await qp.addCommand(transmit);
  expect(result).toBeTruthy();
});

test('command has Data instantly', async() => {
  const qp = new QueueProcessor();
  const command = (buffer, resolve) => {
    resolve(true);
  };

  const transmit = () => {
    qp.addData(new Uint8Array([1, 2, 3]));
  };

  const result = await qp.addCommand(transmit, command);
  expect(result).toBeTruthy();
});
