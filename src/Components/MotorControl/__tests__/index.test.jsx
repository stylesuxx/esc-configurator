import React from 'react';
import {
  render,
  screen,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MotorControl from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays MotorControl', () => {
  const onAllUpdate = jest.fn();
  const onSingleUpdate = jest.fn();

  render(
    <MotorControl
      onAllUpdate={onAllUpdate}
      onSingleUpdate={onSingleUpdate}
    />
  );

  expect(screen.getByText('motorControl')).toBeInTheDocument();
  expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
  expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
});

test('with motorcount', () => {
  const onAllUpdate = jest.fn();
  const onSingleUpdate = jest.fn();

  render(
    <MotorControl
      motorCount={4}
      onAllUpdate={onAllUpdate}
      onSingleUpdate={onSingleUpdate}
    />
  );

  expect(screen.getByText('motorControl')).toBeInTheDocument();
  expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
  expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
  expect(screen.getAllByText(/motorNr/i).length).toEqual(4);

  userEvent.click(screen.getByRole(/checkbox/i));
});

test('batteryState', async () => {
  const onAllUpdate = jest.fn();
  const onSingleUpdate = jest.fn();
  function getBatteryState() {
    return {
      cellCount: 1,
      voltage: 3.8,
    };
  }

  render(
    <MotorControl
      getBatteryState={getBatteryState}
      motorCount={4}
      onAllUpdate={onAllUpdate}
      onSingleUpdate={onSingleUpdate}
    />
  );

  expect(screen.getByText('motorControl')).toBeInTheDocument();
  expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
  expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
  expect(screen.getAllByText(/motorNr/i).length).toEqual(4);

  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
  });


  expect(screen.getByText(/battery 1S @ 3.8V/i)).toBeInTheDocument();
});

test('batteryState danger', async () => {
  const onAllUpdate = jest.fn();
  const onSingleUpdate = jest.fn();
  function getBatteryState() {
    return {
      cellCount: 1,
      voltage: 2.8,
    };
  }

  render(
    <MotorControl
      getBatteryState={getBatteryState}
      motorCount={4}
      onAllUpdate={onAllUpdate}
      onSingleUpdate={onSingleUpdate}
    />
  );

  expect(screen.getByText('motorControl')).toBeInTheDocument();
  expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
  expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
  expect(screen.getAllByText(/motorNr/i).length).toEqual(4);

  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
  });


  expect(screen.getByText(/battery 1S @ 2.8V/i)).toBeInTheDocument();
});
