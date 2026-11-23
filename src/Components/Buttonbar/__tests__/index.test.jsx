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
import stateReducer, { setWriting } from '../../../Containers/App/stateSlice';

import Buttonbar from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({
      reducer: {
        escs: escsReducer,
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
let onLoadSettings;
let onSaveSettings;

describe('Buttonbar', () => {
  const storeRef = setupTestStore();

  beforeEach(() => {
    onWriteSetup = jest.fn();
    onReadSetup = jest.fn();
    onResetDefaults = jest.fn();
    onLoadSettings = jest.fn();
    onSaveSettings = jest.fn();
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
        onLoadSettings={onLoadSettings}
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSaveSettings={onSaveSettings}
        onWriteSetup={onWriteSetup}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.queryAllByText(/resetDefaults/i).length).toEqual(2);
    expect(screen.getByText(/escButtonRead/i)).toBeInTheDocument();
    expect(screen.getByText(/escButtonWrite/i)).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
    expect(screen.getAllByText(/escButtonOpenMelodyEditor/i).length).toEqual(2);
  });

  it('should not trigger handlers when disabled', () => {
    storeRef.store.dispatch(setWriting(true));

    render(
      <Buttonbar
        onLoadSettings={onLoadSettings}
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSaveSettings={onSaveSettings}
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
        onLoadSettings={onLoadSettings}
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSaveSettings={onSaveSettings}
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
        onLoadSettings={onLoadSettings}
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSaveSettings={onSaveSettings}
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

  describe('settings file', () => {
    const renderButtonbar = () => render(
      <Buttonbar
        onLoadSettings={onLoadSettings}
        onReadSetup={onReadSetup}
        onResetDefaults={onResetDefaults}
        onSaveSettings={onSaveSettings}
        onWriteSetup={onWriteSetup}
      />,
      { wrapper: storeRef.wrapper }
    );

    it('should not show the buttons before the ESCs are read', () => {
      renderButtonbar();

      expect(screen.queryByText(/escButtonSaveSettings/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/escButtonLoadSettings/i)).not.toBeInTheDocument();
    });

    it('should save and load settings once the ESCs are read', () => {
      storeRef.store.dispatch(setIndividual([{}]));
      renderButtonbar();

      userEvent.click(screen.getByText(/escButtonSaveSettings/i));
      expect(onSaveSettings).toHaveBeenCalled();

      const input = screen.getByTestId('input-settings-file');
      const click = jest.spyOn(input, 'click');
      userEvent.click(screen.getByText(/escButtonLoadSettings/i));
      expect(click).toHaveBeenCalled();

      const file = new File(['{}'], 'esc-settings.json', { type: 'application/json' });
      userEvent.upload(input, file);
      expect(onLoadSettings).toHaveBeenCalled();
      expect(onLoadSettings.mock.calls[0][0].target.files[0]).toBe(file);
    });

    it('should not save or load while writing', () => {
      storeRef.store.dispatch(setIndividual([{}]));
      storeRef.store.dispatch(setWriting(true));
      renderButtonbar();

      userEvent.click(screen.getByText(/escButtonSaveSettings/i));
      expect(onSaveSettings).not.toHaveBeenCalled();

      const click = jest.spyOn(screen.getByTestId('input-settings-file'), 'click');
      userEvent.click(screen.getByText(/escButtonLoadSettings/i));
      expect(click).not.toHaveBeenCalled();
    });
  });
});
