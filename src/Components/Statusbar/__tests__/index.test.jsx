import React from 'react';
import {
  render, screen, fireEvent, act, rerender,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StatusBar from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays StatusBar', () => {
  render(
    <StatusBar
      packetErrors={0}
      version="version"
    />
  );

  expect(screen.getByText('statusbarPortUtilization')).toBeInTheDocument();
  expect(screen.getByText('statusbarPacketError')).toBeInTheDocument();
  expect(screen.getByText('version')).toBeInTheDocument();
});


test('update utilization', async() => {
  const getUtilization = jest.fn();
  const getUtilization1 = jest.fn();
  getUtilization.mockReturnValueOnce({
    up: 10,
    down: 10,
  });

  const { rerender } = render(
    <StatusBar
      getUtilization={getUtilization}
      packetErrors={0}
      version="version"
    />
  );

  expect(screen.getByText('statusbarPortUtilization')).toBeInTheDocument();
  expect(screen.getByText('statusbarPacketError')).toBeInTheDocument();
  expect(screen.getByText('version')).toBeInTheDocument();

  await act(async() => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    expect(getUtilization).toHaveBeenCalled();
  });

  // Re-render with new utilization function
  rerender(
    <StatusBar
      getUtilization={getUtilization1}
      packetErrors={0}
      version="version"
    />
  );
});
