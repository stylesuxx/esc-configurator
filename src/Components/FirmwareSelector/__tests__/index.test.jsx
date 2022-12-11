import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import sources from '../../../sources';

let FirmwareSelector;

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

const mockJsonResponse = (content) =>
  new window.Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Time-Cached': Date.now().toString(),
    },
  });

describe('FirmwareSelector', () => {
  beforeAll(async () => {
    /**
     * require component instead of import so that we can properly
     * pre-populate the local storage
     */
    FirmwareSelector = require('../').default;
  });

  it('should display firmware selection', () => {
    const configs = {
      versions: {},
      escs: {},
      pwm: {},
    };

    const onSubmit = jest.fn();
    const onLocalSubmit = jest.fn();
    const onCancel = jest.fn();

    render(
      <FirmwareSelector
        configs={configs}
        onCancel={onCancel}
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
        showUnstable={false}
      />
    );

    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/forceFlashHint/i)).toBeInTheDocument();
    expect(screen.getByText(/migrateFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/migrateFlashHint/i)).toBeInTheDocument();
    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();

    expect(screen.getByText("escButtonSelect")).toBeInTheDocument();
    expect(screen.getByText(/escButtonSelectLocally/i)).toBeInTheDocument();
    expect(screen.getByText(/buttonCancel/i)).toBeInTheDocument();

    expect(screen.getByText(/selectFirmware/i)).toBeInTheDocument();
    expect(screen.getByText(/selectTarget/i)).toBeInTheDocument();
  });

  it('should allow changing firmware options for BLHeli_S', async() => {
    const json = `[{ "tag_name": "v0.10", "assets": [{}] }]`;
    global.caches = {
      open: jest.fn().mockImplementation(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse(json))) });
        })
      ),
    };

    const configs = {
      versions: {},
      escs: {},
      pwm: {},
    };

    for(let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const name = source.getName();

      configs.versions[name] = await source.getVersions();
      configs.escs[name] = source.getEscLayouts();
      configs.pwm[name] = source.getPwm();
    }

    const onSubmit = jest.fn();
    const onLocalSubmit = jest.fn();
    const onCancel = jest.fn();

    const escMock = {
      settings: { LAYOUT: "#S_H_90#" },
      meta: { signature: 0xE8B2 },
    };

    render(
      <FirmwareSelector
        configs={configs}
        esc={escMock}
        onCancel={onCancel}
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/forceFlashHint/i)).toBeInTheDocument();
    expect(screen.getByText(/migrateFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/migrateFlashHint/i)).toBeInTheDocument();
    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();

    expect(screen.getByText("escButtonSelect")).toBeInTheDocument();
    expect(screen.getByText(/escButtonSelectLocally/i)).toBeInTheDocument();
    expect(screen.getByText(/buttonCancel/i)).toBeInTheDocument();

    expect(screen.getByText(/selectFirmware/i)).toBeInTheDocument();
    expect(screen.getByText(/selectTarget/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Firmware' }), {
      target: {
        value: 'BLHeli_S',
        name: 'Firmware',
      },
    });

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'ESC' }), {
      target: {
        value: '#S_H_50#',
        name: 'ESC',
      },
    });

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Version' }), {
      target: {
        value: '16.7 [Official]',
        name: 'Version',
      },
    });

    const checkboxes = screen.getAllByRole(/checkbox/i);
    for(let i = 0; i < checkboxes.length; i += 1) {
      userEvent.click(checkboxes[i]);
    }

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Firmware' }), {
      target: {
        value: 'Bluejay',
        name: 'Firmware',
      },
    });

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'ESC' }), {
      target: {
        value: '#S_H_50#',
        name: 'ESC',
      },
    });

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Version' }), {
      target: {
        value: 'https://github.com/bird-sanctuary/bluejay/releases/download/v0.10/',
        name: 'Version',
      },
    });

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'PWM Frequency' }), {
      target: {
        value: '96',
        name: 'PWM Frequency',
      },
    });

    userEvent.click(screen.getByText('escButtonSelect'));
    expect(onSubmit).toHaveBeenCalled();

    userEvent.click(screen.getByText('escButtonSelectLocally'));
    fireEvent.change(screen.getByTestId('input-file'));
    expect(onLocalSubmit).toHaveBeenCalled();

    userEvent.click(screen.getByText('buttonCancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('should display title', async() => {
    const json = `[{ "tag_name": "v0.10", "assets": [{}] }]`;
    global.caches = {
      open: jest.fn().mockImplementation(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse(json))) });
        })
      ),
    };

    const configs = {
      versions: {},
      escs: {},
      pwm: {},
    };

    for(let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const name = source.getName();

      configs.versions[name] = await source.getVersions();
      configs.escs[name] = source.getEscLayouts();
      configs.pwm[name] = source.getPwm();
    }

    const onSubmit = jest.fn();
    const onLocalSubmit = jest.fn();
    const onCancel = jest.fn();

    const escMock = {
      displayName: 'Display Name',
      settings: { LAYOUT: "#S_H_90#" },
      meta: { signature: 0xE8B2 },
    };

    render(
      <FirmwareSelector
        configs={configs}
        esc={escMock}
        onCancel={onCancel}
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText('selectTarget (Display Name)')).toBeInTheDocument();
  });

  it('should allow changing firmware options for AM32', async() => {
    const json = `[{ "tag_name": "v1.88", "assets": [{}] }]`;
    global.caches = {
      open: jest.fn().mockImplementation(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse(json))) });
        })
      ),
    };

    const configs = {
      versions: {},
      escs: {},
      pwm: {},
    };

    for(let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const name = source.getName();

      configs.versions[name] = await source.getVersions();
      configs.escs[name] = source.getEscLayouts();
      configs.pwm[name] = source.getPwm();
    }

    const onSubmit = jest.fn();
    const onLocalSubmit = jest.fn();
    const onCancel = jest.fn();

    const escMock = {
      settings: { LAYOUT: "T-MOTOR 55A" },
      meta: { signature: 0x1F06 },
    };

    render(
      <FirmwareSelector
        configs={configs}
        esc={escMock}
        onCancel={onCancel}
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/forceFlashHint/i)).toBeInTheDocument();
    expect(screen.getByText(/migrateFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/migrateFlashHint/i)).toBeInTheDocument();
    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();

    expect(screen.getByText("escButtonSelect")).toBeInTheDocument();
    expect(screen.getByText(/escButtonSelectLocally/i)).toBeInTheDocument();
    expect(screen.getByText(/buttonCancel/i)).toBeInTheDocument();

    expect(screen.getByText(/selectFirmware/i)).toBeInTheDocument();
    expect(screen.getByText(/selectTarget/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Version' }), {
      target: {
        value: 'https://github.com/AlkaMotors/AM32-MultiRotor-ESC-firmware/releases/download/v1.88/',
        name: 'Version',
      },
    });

    userEvent.click(screen.getByText('escButtonSelect'));
    expect(onSubmit).toHaveBeenCalled();
  });
});
