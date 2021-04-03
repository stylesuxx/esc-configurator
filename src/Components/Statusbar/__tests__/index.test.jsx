import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import StatusBar from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays StatusBar', () => {
  const ref = React.createRef();

  render(
    <StatusBar
      packetErrors={0}
      ref={ref}
      version="version"
    />
  );

  expect(screen.getByText('statusbarPortUtilization')).toBeInTheDocument();
  expect(screen.getByText('statusbarPacketError')).toBeInTheDocument();
  expect(screen.getByText('version')).toBeInTheDocument();

  ref.current.updateBatteryState({
    cellCount: 1,
    voltage: 4.2,
  });
  expect(screen.getByText('battery')).toBeInTheDocument();
  expect(screen.getByText('1S @ 4.2V')).toBeInTheDocument();

  ref.current.updateBatteryState({
    cellCount: 1,
    voltage: 3.5,
  });
  expect(screen.getByText('battery')).toBeInTheDocument();
  expect(screen.getByText('1S @ 3.5V')).toBeInTheDocument();

  ref.current.updateBatteryState(null);
  expect(screen.queryByText('battery')).not.toBeInTheDocument();
  expect(screen.queryByText('1S @ 4.2V')).not.toBeInTheDocument();

  ref.current.updateUtilization({
    up: 10,
    down: 20,
  });
  expect(screen.getByText('D: 20%')).toBeInTheDocument();
  expect(screen.getByText('U: 10%')).toBeInTheDocument();
});
