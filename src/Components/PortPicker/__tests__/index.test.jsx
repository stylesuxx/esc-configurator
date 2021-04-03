import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PortPicker from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays MotorControl', () => {
  const onChangePort = jest.fn();
  const onConnect = jest.fn();
  const onDisconnect = jest.fn();
  const onSetBaudRate = jest.fn();
  const onSetPort = jest.fn();

  render(
    <PortPicker
      onChangePort={onChangePort}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      onSetBaudRate={onSetBaudRate}
      onSetPort={onSetPort}
    />
  );

  expect(screen.getByText('Web Serial')).toBeInTheDocument();
});

test('hasSerial', () => {
  const onChangePort = jest.fn();
  const onConnect = jest.fn();
  const onDisconnect = jest.fn();
  const onSetBaudRate = jest.fn();
  const onSetPort = jest.fn();

  render(
    <PortPicker
      hasSerial
      onChangePort={onChangePort}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      onSetBaudRate={onSetBaudRate}
      onSetPort={onSetPort}
    />
  );

  expect(screen.getByText(/serialPermission/i)).toBeInTheDocument();
  expect(screen.getByText(/openPortSelection/i)).toBeInTheDocument();

  userEvent.click(screen.getByText(/openPortSelection/i));
  expect(onSetPort).toHaveBeenCalled();
});

test('hasPort', () => {
  const onChangePort = jest.fn();
  const onConnect = jest.fn();
  const onDisconnect = jest.fn();
  const onSetBaudRate = jest.fn();
  const onSetPort = jest.fn();

  render(
    <PortPicker
      hasPort
      hasSerial
      onChangePort={onChangePort}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      onSetBaudRate={onSetBaudRate}
      onSetPort={onSetPort}
    />
  );

  expect(screen.getByText(/openPortSelection/i)).toBeInTheDocument();
});

test('open', () => {
  const onChangePort = jest.fn();
  const onConnect = jest.fn();
  const onDisconnect = jest.fn();
  const onSetBaudRate = jest.fn();
  const onSetPort = jest.fn();
  const ports = ['p1', 'p2'];

  render(
    <PortPicker
      hasPort
      hasSerial
      onChangePort={onChangePort}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      onSetBaudRate={onSetBaudRate}
      onSetPort={onSetPort}
      open
      ports={ports}
    />
  );

  expect(screen.getByText(/openPortSelection/i)).toBeInTheDocument();

  fireEvent.change(screen.getByRole(/combobox/i, { name: 'baudRate' }), {
    target: {
      value: '57600',
      name: 'baudRate',
    },
  });

  fireEvent.change(screen.getByRole(/combobox/i, { name: 'port' }), {
    target: {
      value: '1',
      name: 'port',
    },
  });
});
