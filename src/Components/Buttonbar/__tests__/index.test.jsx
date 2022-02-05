import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Buttonbar from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

describe('Buttonbar', () => {
  it('should display buttons', () => {
    const onWriteSetup = jest.fn();
    const onReadSetup = jest.fn();
    const onResetDefaults = jest.fn();
    const onSaveLog = jest.fn();
    const onSeletFirmwareForAll = jest.fn();
    const onOpenMelodyEditor = jest.fn();

    render(
      <Buttonbar
        canFlash={false}
        canRead={false}
        canReadDefaults={false}
        canResetDefaults={false}
        canWrite={false}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSaveLog={onSaveLog}
        onSeletFirmwareForAll={onSeletFirmwareForAll}
        onWriteSetup={onWriteSetup}
        showMelodyEditor
      />
    );

    expect(screen.queryAllByText(/resetDefaults/i).length).toEqual(2);
    expect(screen.getByText(/escButtonRead/i)).toBeInTheDocument();
    expect(screen.getByText(/escButtonWrite/i)).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
    expect(screen.getByText(/escButtonSaveLog/i)).toBeInTheDocument();
    expect(screen.getAllByText(/escButtonOpenMelodyEditor/i).length).toEqual(2);
  });

  it('should always trigger log save', () => {
    const onWriteSetup = jest.fn();
    const onReadSetup = jest.fn();
    const onResetDefaults = jest.fn();
    const onSaveLog = jest.fn();
    const onSeletFirmwareForAll = jest.fn();
    const onOpenMelodyEditor = jest.fn();

    render(
      <Buttonbar
        canFlash={false}
        canRead={false}
        canReadDefaults={false}
        canResetDefaults={false}
        canWrite={false}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSaveLog={onSaveLog}
        onSeletFirmwareForAll={onSeletFirmwareForAll}
        onWriteSetup={onWriteSetup}
        showMelodyEditor
      />
    );

    userEvent.click(screen.getByText(/escButtonSaveLog/i));
    expect(onSaveLog).toHaveBeenCalled();
  });

  it('should not trigger handlers when disabled', () => {
    const onWriteSetup = jest.fn();
    const onReadSetup = jest.fn();
    const onResetDefaults = jest.fn();
    const onSaveLog = jest.fn();
    const onSelectFirmwareForAll = jest.fn();
    const onOpenMelodyEditor = jest.fn();

    render(
      <Buttonbar
        canFlash={false}
        canRead={false}
        canReadDefaults={false}
        canResetDefaults={false}
        canWrite={false}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSaveLog={onSaveLog}
        onSeletFirmwareForAll={onSelectFirmwareForAll}
        onWriteSetup={onWriteSetup}
        showMelodyEditor
      />
    );

    expect(screen.queryAllByText(/resetDefaults/i)[1]).toHaveAttribute('disabled');
    expect(onResetDefaults).not.toHaveBeenCalled();

    expect(screen.getByText(/escButtonRead/i)).toHaveAttribute('disabled');
    expect(onReadSetup).not.toHaveBeenCalled();

    expect(screen.getByText(/escButtonWrite/i)).toHaveAttribute('disabled');
    expect(onWriteSetup).not.toHaveBeenCalled();

    expect(screen.getByText(/escButtonFlashAll/i)).toHaveAttribute('disabled');
    expect(onSelectFirmwareForAll).not.toHaveBeenCalled();
  });

  it('should trigger handlers when enabled', () => {
    const onWriteSetup = jest.fn();
    const onReadSetup = jest.fn();
    const onResetDefaults = jest.fn();
    const onSaveLog = jest.fn();
    const onSelectFirmwareForAll = jest.fn();
    const onOpenMelodyEditor = jest.fn();

    render(
      <Buttonbar
        canFlash
        canRead
        canReadDefaults
        canResetDefaults
        canWrite
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSaveLog={onSaveLog}
        onSeletFirmwareForAll={onSelectFirmwareForAll}
        onWriteSetup={onWriteSetup}
        showMelodyEditor
      />
    );

    userEvent.click(screen.queryAllByText(/resetDefaults/i)[1]);
    expect(onResetDefaults).toHaveBeenCalled();

    userEvent.click(screen.getByText(/escButtonRead/i));
    expect(onReadSetup).toHaveBeenCalled();

    userEvent.click(screen.getByText(/escButtonWrite/i));
    expect(onWriteSetup).toHaveBeenCalled();

    userEvent.click(screen.getByText(/escButtonFlashAll/i));
    expect(onSelectFirmwareForAll).toHaveBeenCalled();
  });
});
