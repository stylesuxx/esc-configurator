import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import escsReducer, { setIndividual } from '../../../Containers/App/escsSlice';
import melodiesReducer, { updateAll } from '../../MelodyEditor/melodiesSlice';
import logReducer, { add } from '../../Log/logSlice';
import stateReducer, { setWriting } from '../../../Containers/App/stateSlice';

import Buttonbar from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({
      reducer: {
        escs: escsReducer,
        log: logReducer,
        melodies: melodiesReducer,
        state: stateReducer,
      },
    });
    refObj.store = store;
    refObj.wrapper = ({ children }) => (
      <Provider store={store}>
        {children}
      </Provider>
    );
  });

  return refObj;
}

let onWriteSetup;
let onReadSetup;
let onResetDefaults;

describe('Buttonbar', () => {
  const storeRef = setupTestStore();

  beforeEach(() => {
    onWriteSetup = jest.fn();
    onReadSetup = jest.fn();
    onResetDefaults = jest.fn();
  });

  it('should display buttons', () => {
    storeRef.store.dispatch(updateAll([
      'test',
      'test',
      'test',
      'test',
    ]));

    render(
      <Buttonbar
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
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
    global.URL.createObjectURL = jest.fn();

    render(
      <Buttonbar
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onWriteSetup={onWriteSetup}
      />,
      { wrapper: storeRef.wrapper }
    );

    userEvent.click(screen.getByText(/escButtonSaveLog/i));
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('should not trigger handlers when disabled', () => {
    storeRef.store.dispatch(setWriting(true));

    render(
      <Buttonbar
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
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

    const flashButton = screen.getByText(/escButtonFlashAll/i);
    userEvent.click(flashButton);
    expect(flashButton.getAttribute("disabled")).toBe("");

    const { targets } = storeRef.store.getState().escs;
    expect(targets.length).toBe(0);
  });

  it('should trigger handlers when enabled', () => {
    storeRef.store.dispatch(setIndividual([{}]));

    render(
      <Buttonbar
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
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

    const { targets } = storeRef.store.getState().escs;
    expect(targets.length).toBe(1);
  });

  it('should open melody editor', () => {
    storeRef.store.dispatch(updateAll([
      'test',
      'test',
      'test',
      'test',
    ]));

    const onWriteSetup = jest.fn();
    const onReadSetup = jest.fn();
    const onResetDefaults = jest.fn();
    const onSeletFirmwareForAll = jest.fn();

    render(
      <Buttonbar
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSeletFirmwareForAll={onSeletFirmwareForAll}
        onWriteSetup={onWriteSetup}
      />,
      { wrapper: storeRef.wrapper }
    );

    const openButtons = screen.getAllByText(/escButtonOpenMelodyEditor/i);
    expect(openButtons.length).toEqual(2);

    userEvent.click(openButtons[1]);

    const melodies = storeRef.store.getState().melodies;
    expect(melodies.show).toBeTruthy();
  });

  it('should clear log', () => {
    const onWriteSetup = jest.fn();
    const onReadSetup = jest.fn();
    const onResetDefaults = jest.fn();
    const onSeletFirmwareForAll = jest.fn();

    storeRef.store.dispatch(add('line1'));

    let log = storeRef.store.getState().log;
    expect(log.log.length).toEqual(1);

    render(
      <Buttonbar
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSeletFirmwareForAll={onSeletFirmwareForAll}
        onWriteSetup={onWriteSetup}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/escButtonClearLog/i)).toBeInTheDocument();

    userEvent.click(screen.getByText(/escButtonClearLog/i));

    log = storeRef.store.getState().log;
    expect(log.log.length).toEqual(0);
  });
});
