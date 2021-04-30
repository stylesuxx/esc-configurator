import React from 'react';
import {
  act,
  render,
  screen,
} from '@testing-library/react';

import StatusBar from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

describe('Statusbar', () => {
  it('should render without utilization callback', async () => {
    render(
      <StatusBar
        packetErrors={0}
        version="version"
      />
    );

    expect(screen.getByText(/statusbarPortUtilization/i)).toBeInTheDocument();
    expect(screen.getByText(/statusbarPacketError 0/i)).toBeInTheDocument();
    expect(screen.getByText('version')).toBeInTheDocument();

    await act(async ()=> {
      await new Promise((r) => {
        setTimeout(r, 1200);
      });
    });
    expect(screen.getByText('statusbarPortUtilization D: 0% U: 0%')).toBeInTheDocument();
  });

  it('should render with utilization callback', async () => {
    function getUtilization() {
      return {
        up: 10,
        down: 20,
      };
    }

    render(
      <StatusBar
        getUtilization={getUtilization}
        packetErrors={0}
        version="version"
      />
    );

    expect(screen.getByText(/statusbarPortUtilization/i)).toBeInTheDocument();
    expect(screen.getByText(/statusbarPacketError 0/i)).toBeInTheDocument();
    expect(screen.getByText('version')).toBeInTheDocument();

    await act(async ()=> {
      await new Promise((r) => {
        setTimeout(r, 1200);
      });
    });
    expect(screen.getByText('statusbarPortUtilization D: 20% U: 10%')).toBeInTheDocument();
  });
});
