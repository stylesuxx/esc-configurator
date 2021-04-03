import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Buttonbar from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays Buttonbar', () => {
  const onWriteSetup = jest.fn();
  const onReadSetup = jest.fn();
  const onResetDefaults = jest.fn();
  const onSaveLog = jest.fn();
  const onSeletFirmwareForAll = jest.fn();

  render(
    <Buttonbar
      canFlash={false}
      canRead={false}
      canReadDefaults={false}
      canResetDefaults={false}
      canWrite={false}
      onReadSetup={onReadSetup}
      onResetDefaults={onResetDefaults}
      onSaveLog={onSaveLog}
      onSeletFirmwareForAll={onSeletFirmwareForAll}
      onWriteSetup={onWriteSetup}
    />
  );

  expect(screen.queryAllByText(/resetDefaults/i).length).toEqual(2);
  expect(screen.getByText(/escButtonRead/i)).toBeInTheDocument();
  expect(screen.getByText(/escButtonWrite/i)).toBeInTheDocument();
  expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
  expect(screen.getByText(/escButtonSaveLog/i)).toBeInTheDocument();
});

test('trigger onSaveLog', () => {
  const onWriteSetup = jest.fn();
  const onReadSetup = jest.fn();
  const onResetDefaults = jest.fn();
  const onSaveLog = jest.fn();
  const onSeletFirmwareForAll = jest.fn();

  render(
    <Buttonbar
      canFlash={false}
      canRead={false}
      canReadDefaults={false}
      canResetDefaults={false}
      canWrite={false}
      onReadSetup={onReadSetup}
      onResetDefaults={onResetDefaults}
      onSaveLog={onSaveLog}
      onSeletFirmwareForAll={onSeletFirmwareForAll}
      onWriteSetup={onWriteSetup}
    />
  );

  userEvent.click(screen.getByText(/escButtonSaveLog/i));
  expect(onSaveLog).toHaveBeenCalled();
});

test('does not trigger handlers when inactive', () => {
  const onWriteSetup = jest.fn();
  const onReadSetup = jest.fn();
  const onResetDefaults = jest.fn();
  const onSaveLog = jest.fn();
  const onSelectFirmwareForAll = jest.fn();

  render(
    <Buttonbar
      canFlash={false}
      canRead={false}
      canReadDefaults={false}
      canResetDefaults={false}
      canWrite={false}
      onReadSetup={onReadSetup}
      onResetDefaults={onResetDefaults}
      onSaveLog={onSaveLog}
      onSeletFirmwareForAll={onSelectFirmwareForAll}
      onWriteSetup={onWriteSetup}
    />
  );

  userEvent.click(screen.queryAllByText(/resetDefaults/i)[1]);
  expect(onResetDefaults).not.toHaveBeenCalled();

  userEvent.click(screen.getByText(/escButtonRead/i));
  expect(onReadSetup).not.toHaveBeenCalled();

  userEvent.click(screen.getByText(/escButtonWrite/i));
  expect(onWriteSetup).not.toHaveBeenCalled();

  userEvent.click(screen.getByText(/escButtonFlashAll/i));
  expect(onSelectFirmwareForAll).not.toHaveBeenCalled();
});

test('does trigger handlers when enabled', () => {
  const onWriteSetup = jest.fn();
  const onReadSetup = jest.fn();
  const onResetDefaults = jest.fn();
  const onSaveLog = jest.fn();
  const onSelectFirmwareForAll = jest.fn();

  render(
    <Buttonbar
      canFlash
      canRead
      canReadDefaults
      canResetDefaults
      canWrite
      onReadSetup={onReadSetup}
      onResetDefaults={onResetDefaults}
      onSaveLog={onSaveLog}
      onSeletFirmwareForAll={onSelectFirmwareForAll}
      onWriteSetup={onWriteSetup}
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
