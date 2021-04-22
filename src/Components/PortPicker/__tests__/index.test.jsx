import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PortPicker from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

let onChangePort;
let onConnect;
let onDisconnect;
let onSetBaudRate;
let onSetPort;

describe('PortPicker', () => {
  beforeEach(() => {
    onChangePort = jest.fn();
    onConnect = jest.fn();
    onDisconnect = jest.fn();
    onSetBaudRate = jest.fn();
    onSetPort = jest.fn();
  });

  it('should show warning screen', () => {
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

  it('should allow port choice', () => {
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

  it('should display ports', () => {
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

  it('should allow to change port and baudrate', () => {
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
});
