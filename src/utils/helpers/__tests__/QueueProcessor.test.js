import fs from 'fs';
import path from 'path';

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

  try {
    const result = await qp.addCommand(transmit, receive);
  } catch(e) {
    expect(e).not.toBeNull();
  }
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

  try {
    const result = await qp.addCommand(transmit, command);
  } catch(e) {
    expect(e).not.toBeNull();
  }
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

  try {
    const result = await qp.addCommand(transmit, command);
  } catch(e) {
    expect(e).not.toBeNull();
  }
});

test('command resolves', async() => {
  const qp = new QueueProcessor();
  const command = (buffer, resolve, reject) => {
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
  const command = (buffer, resolve, reject) => {
    resolve(true);
  };

  const transmit = () => {
    qp.addData(new Uint8Array([1, 2, 3]));
  };

  const result = await qp.addCommand(transmit, command);
  expect(result).toBeTruthy();
});
