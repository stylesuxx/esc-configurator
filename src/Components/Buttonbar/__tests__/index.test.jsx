import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import melodiesReducer, { updateAll } from '../../MelodyEditor/melodiesSlice';

import Buttonbar from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({ reducer: { melodies: melodiesReducer } });
    refObj.store = store;
    refObj.wrapper = ({ children }) => (
      <Provider store={store}>
        {children}
      </Provider>
    );
  });

  return refObj;
}

describe('Buttonbar', () => {
  const storeRef = setupTestStore();

  it('should display buttons', () => {
    storeRef.store.dispatch(updateAll([
      'test',
      'test',
      'test',
      'test',
    ]));

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
      />,
      { wrapper: storeRef.wrapper }
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
      />,
      { wrapper: storeRef.wrapper }
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
      />,
      { wrapper: storeRef.wrapper }
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

  it('should trigger handlers when enabled', () => {
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
      />,
      { wrapper: storeRef.wrapper }
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
