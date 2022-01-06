import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import sources from '../../../sources';

let FirmwareSelector;

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

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
      />
    );

    expect(screen.getByText('forceFlashText')).toBeInTheDocument();
    expect(screen.getByText('migrateFlashText')).toBeInTheDocument();
    expect(screen.getByText('forceFlashText')).toBeInTheDocument();

    expect(screen.getByText('escButtonSelect')).toBeInTheDocument();
    expect(screen.getByText('escButtonSelectLocally')).toBeInTheDocument();
    expect(screen.getByText('buttonCancel')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'selectFirmware selectFirmware' })).toBeInTheDocument();
    expect(screen.getByText('selectTarget')).toBeInTheDocument();
  });

  it('should allow changing firmware options for BLHeli_S', async() => {
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

    const { container } = render(
      <FirmwareSelector
        configs={configs}
        esc={escMock}
        onCancel={onCancel}
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/migrateFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();

    expect(screen.getByText("escButtonSelect")).toBeInTheDocument();
    expect(screen.getByText(/escButtonSelectLocally/i)).toBeInTheDocument();
    expect(screen.getByText(/buttonCancel/i)).toBeInTheDocument();

    expect(screen.getByText(/selectFirmware/i)).toBeInTheDocument();
    expect(screen.getByText(/selectTarget/i)).toBeInTheDocument();

    // Firmware selection
    fireEvent.mouseDown(screen.getByRole('button', { name: 'selectFirmware BLHeli_S' }));

    let element = screen.getByRole('option', { name: 'Bluejay' });
    userEvent.click(element);

    // Layout selection
    fireEvent.mouseDown(screen.getByRole('button', { name: 'selectEsc S-H-90' }));

    element = screen.getByRole('option', { 'name': 'S-H-50' });
    userEvent.click(element);

    // Version selection
    fireEvent.mouseDown(screen.getByRole('button', { name: 'selectVersion selectVersion' }));

    element = screen.getByRole('option', { 'name': '0.15 (Test)' });
    userEvent.click(element);

    // PWM selection
    fireEvent.mouseDown(screen.getByRole('button', { name: 'selectPwmFrequency selectPwmFrequency' }));

    element = screen.getByRole('option', { 'name': '96' });
    userEvent.click(element);

    userEvent.click(screen.getByText('escButtonSelect'));
    expect(onSubmit).toHaveBeenCalled();

    userEvent.click(screen.getByText('escButtonSelectLocally'));
    fireEvent.change(container.querySelector('input[type=file]'));
    expect(onLocalSubmit).toHaveBeenCalled();

    userEvent.click(screen.getByText('buttonCancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('should allow changing firmware options for AM32', async() => {
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
    expect(screen.getByText(/migrateFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();

    expect(screen.getByText('escButtonSelect')).toBeInTheDocument();
    expect(screen.getByText('escButtonSelectLocally')).toBeInTheDocument();
    expect(screen.getByText('buttonCancel')).toBeInTheDocument();

    expect(screen.getByText('selectFirmware')).toBeInTheDocument();
    expect(screen.getByText('selectTarget')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('button', { 'name': 'selectVersion selectVersion' }));

    const element = screen.getByRole('option', { 'name': '1.78' });
    userEvent.click(element);

    userEvent.click(screen.getByText('escButtonSelect'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should show warning when forcing target', async() => {
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
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'forceFlashText' }));

    expect(screen.getByText(/forceFlashHint/i)).toBeInTheDocument();
  });

  it('should show warning when forcing migration', async() => {
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
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'migrateFlashText' }));

    expect(screen.getByText(/migrateFlashHint/i)).toBeInTheDocument();
  });
});
