import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import sources from '../../../sources';

import FirmwareSelector from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays FirmwareSelector', () => {
  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
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

test('loads and displays FirmwareSelector with Bluejay config', async() => {
  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  for(let i = 0; i < sources.length; i += 1) {
    const source = sources[i];
    const name = source.getName();

    configs.versions[name] = await source.getVersions();
    configs.escs[name] = await source.getEscs();
    configs.platforms[name] = source.getPlatform();
    configs.pwm[name] = source.getPwm();
  }

  const onSubmit = jest.fn();
  const onLocalSubmit = jest.fn();
  const onCancel = jest.fn();

  const { container } = render(
    <FirmwareSelector
      configs={configs}
      escHint="#S_H_90#"
      onCancel={onCancel}
      onLocalSubmit={onLocalSubmit}
      onSubmit={onSubmit}
      signatureHint={59570}
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
      value: 'Blheli',
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
      value: 'https://github.com/mathiasvr/bluejay/releases/download/v0.10/{0}_v0.10.hex',
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
  fireEvent.change(container.querySelector('input[type=file]'));
  expect(onLocalSubmit).toHaveBeenCalled();

  userEvent.click(screen.getByText('buttonCancel'));
  expect(onCancel).toHaveBeenCalled();
});

test('loads and displays FirmwareSelector with AM32 config', async() => {
  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  for(let i = 0; i < sources.length; i += 1) {
    const source = sources[i];
    const name = source.getName();

    configs.versions[name] = await source.getVersions();
    configs.escs[name] = await source.getEscs();
    configs.platforms[name] = source.getPlatform();
    configs.pwm[name] = source.getPwm();
  }

  const onSubmit = jest.fn();
  const onLocalSubmit = jest.fn();
  const onCancel = jest.fn();

  render(
    <FirmwareSelector
      configs={configs}
      escHint="T-MOTOR 55A"
      onCancel={onCancel}
      onLocalSubmit={onLocalSubmit}
      onSubmit={onSubmit}
      signatureHint={7942}
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
      value: 'https://github.com/AlkaMotors/AM32-MultiRotor-ESC-firmware/releases/download/v1.65/{0}_1.65.hex',
      name: 'Version',
    },
  });

  userEvent.click(screen.getByText('escButtonSelect'));
  expect(onSubmit).toHaveBeenCalled();
});
