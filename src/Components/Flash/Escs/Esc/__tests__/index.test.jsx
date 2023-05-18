import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Esc from '../';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      exists: (name) => {
        if(name === 'hints:STARTUP_BEEP') {
          return false;
        }

        return true;
      },
    },
  }),
}));

let onCommonSettingsUpdate;
let onFlash;
let onFirmwareDump;
let onSettingsUpdate;

describe('Esc', () => {
  beforeEach(() => {
    onCommonSettingsUpdate = jest.fn();
    onFlash = jest.fn();
    onFirmwareDump = jest.fn();
    onSettingsUpdate = jest.fn();
  });

  it('should display ESC details', () => {
    const esc = { individualSettings: {} };

    render(
      <Esc
        directInput={false}
        esc={esc}
        index={0}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/Unsupported\/Unrecognized/i)).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlash/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 1/i)).toBeInTheDocument();
  });

  it('should show name, version and bootloader', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      displayName: 'displayName 1234',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
      },
    };

    render(
      <Esc
        directInput={false}
        esc={esc}
        index={0}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        progress={50}
      />
    );

    expect(screen.getByText(/displayName 1234/i)).toBeInTheDocument();
  });

  it('should handle empty name', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      displayName: 'displayName 1234',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: '',
      },
    };

    render(
      <Esc
        directInput={false}
        esc={esc}
        index={0}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/displayName 1234/i)).toBeInTheDocument();
  });

  it('should not trigger flash when disabled', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
      },
    };

    render(
      <Esc
        canFlash={false}
        directInput={false}
        esc={esc}
        index={0}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    userEvent.click(screen.getByText(/escButtonFlash/i));
    expect(onFlash).not.toHaveBeenCalled();
  });

  it('should trigger flash when enabled', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
      },
    };

    render(
      <Esc
        canFlash
        directInput={false}
        esc={esc}
        index={0}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    userEvent.click(screen.getByText(/escButtonFlash/i));
    expect(onFlash).toHaveBeenCalled();
  });

  it('should show custom settings and handle change', () => {
    const esc = {
      firmwareName: 'BLHeli_S',
      layoutRevision: 33,
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
        MOTOR_DIRECTION: 1,
        _PPM_MIN_THROTTLE: 125,
        STARTUP_BEEP: 0,
      },
    };

    render(
      <Esc
        canFlash
        directInput={false}
        esc={esc}
        index={0}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();
    expect(screen.getByText(/escPPMMinThrottle/i)).toBeInTheDocument();
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();

    // Change select
    fireEvent.change(screen.getByRole(/combobox/i), {
      taget: {
        value: 3,
        name: 'MOTOR_DIRECTION',
      },
    });
  });

  it('should show custom settings and handle direct input', () => {
    const esc = {
      firmwareName: 'BLHeli_S',
      layoutRevision: 33,
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
        MOTOR_DIRECTION: 1,
        _PPM_MIN_THROTTLE: 125,
        STARTUP_BEEP: 1,
      },
    };

    render(
      <Esc
        canFlash
        directInput
        esc={esc}
        index={0}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();
    expect(screen.getByText(/escPPMMinThrottle/i)).toBeInTheDocument();
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('PPM_MIN_THROTTLE'), {
      target: {
        value: 1250,
        name: 'PPM_MIN_THROTTLE',
      },
    });
    fireEvent.blur(screen.getByTestId('PPM_MIN_THROTTLE'));
  });

  it('should update the progress bar', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
        MOTOR_DIRECTION: 1,
        _PPM_MIN_THROTTLE: 125,
        STARTUP_BEEP: 1,
      },
    };

    const ref = React.createRef();

    render(
      <Esc
        canFlash
        directInput
        disableCommon={false}
        enableAdvanced={false}
        esc={esc}
        index={0}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        ref={ref}
      />
    );

    act(() => {
      ref.current.setProgress(50);
    });

    const progressbar = screen.getByRole(/progressbar/i);
    expect(progressbar).toBeInTheDocument();
    expect(progressbar.value).toEqual(50);
  });

  it('should show common settings and handle change', () => {
    const esc = {
      firmwareName: 'Bluejay',
      layoutRevision: 207,
      settings: {},
      individualSettings: { MOTOR_DIRECTION: 1 },
    };

    render(
      <Esc
        canFlash
        directInput={false}
        disableCommon
        enableAdvanced={false}
        esc={esc}
        index={0}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/hints:MOTOR_DIRECTION/i)).toBeInTheDocument();
    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();

    userEvent.click(screen.getByRole(/checkbox/i, { name: 'DITHERING' }));

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'MOTOR_DIRECTION' }), {
      taget: {
        value: 3,
        name: 'MOTOR_DIRECTION',
      },
    });
  });

  it('should trigger firmware dump', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
      },
    };

    render(
      <Esc
        canFlash
        directInput={false}
        disableCommon={false}
        enableAdvanced
        esc={esc}
        index={0}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    userEvent.click(screen.getByText(/escButtonFirmwareDump/i));
    expect(onFirmwareDump).toHaveBeenCalled();
  });
});
