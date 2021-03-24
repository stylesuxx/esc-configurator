import fs from 'fs';
import path from 'path';

import {
  NotEnoughDataError,
  TimeoutError,
  QueueProcessor,
} from '../QueueProcessor';

test('command times out', async() => {
  const qp = new QueueProcessor();
  const command = (buffer, resolve, reject) => {
    reject(new NotEnoughDataError());
  };

  const interval = setInterval(() => {
    qp.addData(new Uint8Array([1, 2, 3]));
  }, 200);

  try {
    const result = await qp.addCommand(command);
  } catch(e) {
    clearInterval(interval);
    expect(e).not.toBeNull();
  }
});

test('command times out while processing', async() => {
  const qp = new QueueProcessor();
  const command = (buffer, resolve, reject) => {
    setTimeout(() => {
      reject(new NotEnoughDataError());
    }, 2000);
  };

  setTimeout(() => {
    qp.addData(new Uint8Array([1, 2, 3]));
  }, 200);

  try {
    const result = await qp.addCommand(command);
  } catch(e) {
    expect(e).not.toBeNull();
  }
});

test('command fails', async() => {
  const qp = new QueueProcessor();
  const command = (buffer, resolve, reject) => {
    reject(new Error('command failed'));
  };

  setTimeout(() => {
    qp.addData(new Uint8Array([1, 2, 3]));
  }, 200);

  try {
    const result = await qp.addCommand(command);
  } catch(e) {
    expect(e).not.toBeNull();
  }
});

test('command resolves', async() => {
  const qp = new QueueProcessor();
  const command = (buffer, resolve, reject) => {
    resolve(true);
  };

  setTimeout(() => {
    qp.addData(new Uint8Array([1, 2, 3]));
  }, 200);

  const result = await qp.addCommand(command);
  expect(result).toBeTruthy();
});
