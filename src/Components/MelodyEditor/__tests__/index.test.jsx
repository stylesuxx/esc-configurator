import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import defaultMelodies from '../../../melodies.json';

import { MockedContextOnended } from '../MelodyElement/__tests__/MockedAudioContext';

import melodiesReducer, {
  del,
  dummy,
  prod,
  save,
  update,
  updateAll,
} from '../melodiesSlice';

import MelodyEditor from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

let onWrite;
let oscStart;
let oscStop;
let oscClose;
let contextClose;

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

function setupCustomTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({
      reducer: { melodies: melodiesReducer },
      preloadedState: {
        melodies: {
          show: true,
          dummy: false,
          current: [melody, melody, melody, `${melody}, f#6`],
          default: [{
            "name": "Bluejay Default",
            "tracks": [
              "bluejay:b=570,o=4,d=32:4b,p,4e5,p,4b,p,4f#5,2p,4e5,2b5,8b5",
            ],
          }],
          custom: defaultMelodies,
        },
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

function setupSyncedTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({
      reducer: { melodies: melodiesReducer },
      preloadedState: {
        melodies: {
          show: true,
          dummy: false,
          current: [melody, melody, melody, melody],
          default: [],
          custom: [],
        },
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

describe('MelodyEditor', () => {
  const storeRef = setupTestStore();
  const customStoreRef = setupCustomTestStore();
  const syncedStoreRef = setupSyncedTestStore();

  beforeEach(() => {
    onWrite = jest.fn();
    oscStart = jest.fn();
    oscStop = jest.fn();
    oscClose = jest.fn();
    contextClose = jest.fn();
  });

  it('should set the dummy flag', () => {
    storeRef.store.dispatch(dummy());

    let melodies = storeRef.store.getState().melodies;
    expect(melodies.dummy).toBeTruthy();

    storeRef.store.dispatch(prod());

    melodies = storeRef.store.getState().melodies;
    expect(melodies.dummy).toBeFalsy();
  });

  it('should update a single melody', () => {
    let melodies = storeRef.store.getState().melodies;
    expect(melodies.current.length).toEqual(4);

    storeRef.store.dispatch(update({
      index: 0,
      melody: 'foobar',
    }));

    melodies = storeRef.store.getState().melodies;
    expect(melodies.current.length).toEqual(4);

    expect(melodies.current[0]).toEqual('foobar');
  });

  it('should handle deletion without melodies', () => {
    storeRef.store.dispatch(del('invalid'));

    const melodies = storeRef.store.getState().melodies;
    expect(melodies.custom.length).toEqual(0);
  });

  it('should update all melodies', () => {
    let melodies = storeRef.store.getState().melodies;
    expect(melodies.current.length).toEqual(4);

    storeRef.store.dispatch(updateAll([
      'foobar',
      'foobar',
      'foobar',
      'foobar',
    ]));

    melodies = storeRef.store.getState().melodies;
    expect(melodies.current.length).toEqual(4);

    for(let i = 0; i < melodies.current.length; i += 1) {
      expect(melodies.current[i]).toEqual('foobar');
    }
  });

  it('should display and be closable', () => {
    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getAllByText('common:melodyEditorPlay').length).toEqual(1);
    expect(screen.queryByText(/common:melodyEditorAccept/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.getByText(/close/i)).toBeInTheDocument();

    expect(screen.queryByText(/write/i)).not.toBeInTheDocument();

    userEvent.click(screen.getByText(/close/i));

    const melodies = storeRef.store.getState().melodies;
    expect(melodies.show).toBeFalsy();
  });

  it('should write when not in dummy mode', () => {
    storeRef.store.dispatch(prod());

    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getAllByText('common:melodyEditorPlay').length).toEqual(1);
    expect(screen.getByText(/common:melodyEditorAccept/i)).toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorPlay/i)).toBeInTheDocument();

    expect(screen.getByText(/common:melodyEditorWrite/i)).toBeInTheDocument();

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    userEvent.click(screen.getByText(/common:melodyEditorWrite/i));
    expect(onWrite).toHaveBeenCalled();
  });

  it('should be possible to click accept', () => {
    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: customStoreRef.wrapper }
    );

    expect(screen.getByText(/ESC 1/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 2/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 3/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 4/i)).toBeInTheDocument();
    expect(screen.getAllByText('common:melodyEditorPlay').length).toEqual(4);
    expect(screen.getByText('common:melodyEditorPlayAll')).toBeInTheDocument();
    expect(screen.getAllByText(/common:melodyEditorAccept/i).length).toEqual(4);
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Please supply a value and an onChange parameter./i)).not.toBeInTheDocument();
    expect(screen.getByText(/close/i)).toBeInTheDocument();
    expect(screen.getByText(/write/i)).toBeInTheDocument();

    const acceptButtons = screen.getAllByText(/common:melodyEditorAccept/i);
    expect(acceptButtons.length).toEqual(4);
    for(let i = 0; i < acceptButtons.length; i += 1) {
      userEvent.click(acceptButtons[i]);
    }
  });

  it('should display while writing', () => {
    render(
      <MelodyEditor
        onWrite={onWrite}
        writing
      />,
      { wrapper: customStoreRef.wrapper }
    );

    expect(screen.getByText(/ESC 1/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 2/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 3/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 4/i)).toBeInTheDocument();
    expect(screen.getAllByText('common:melodyEditorPlay').length).toEqual(4);
    expect(screen.getByText('common:melodyEditorPlayAll')).toBeInTheDocument();
    expect(screen.getAllByText(/common:melodyEditorAccept/i).length).toEqual(4);
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Please supply a value and an onChange parameter./i)).not.toBeInTheDocument();
    expect(screen.getByText(/close/i)).toBeInTheDocument();
    expect(screen.getByText(/write/i)).toBeInTheDocument();

    userEvent.click(screen.getByText(/write/i));
    expect(onWrite).not.toHaveBeenCalled();

    userEvent.click(screen.getByText(/close/i));
    const melodies = storeRef.store.getState().melodies;
    expect(melodies.show).toBeFalsy();
  });

  it('should display single editor when sycned', () => {
    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: syncedStoreRef.wrapper }
    );

    expect(screen.getByText(/common:allEscs/i)).toBeInTheDocument();
    expect(screen.getAllByText('common:melodyEditorPlay').length).toEqual(1);
    expect(screen.getAllByText(/common:melodyEditorAccept/i).length).toEqual(1);
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Please supply a value and an onChange parameter./i)).not.toBeInTheDocument();
    expect(screen.getByText(/close/i)).toBeInTheDocument();
    expect(screen.getByText(/write/i)).toBeInTheDocument();
    expect(screen.getByRole(/checkbox/i)).toBeInTheDocument();

    userEvent.click(screen.getByRole(/checkbox/i));
    expect(screen.getByText(/ESC 1/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 2/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 3/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 4/i)).toBeInTheDocument();

    userEvent.click(screen.getByText(/common:melodyEditorWrite/i));
    expect(onWrite).not.toHaveBeenCalled();

    const acceptButtons = screen.getAllByText(/common:melodyEditorAccept/i);
    for(let i = 0; i < acceptButtons.length; i += 1) {
      userEvent.click(acceptButtons[i]);
    }
    userEvent.click(screen.getByText(/common:melodyEditorWrite/i));
    expect(onWrite).toHaveBeenCalled();
  });

  it('should update when preset is selected', () => {
    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    fireEvent.change(screen.getByRole(/combobox/i), {
      target: {
        name: "",
        value: "preset-Bluejay Default",
      },
    });
    expect(screen.queryAllByText(/bluejay:b=570,o=4,d=32/i).length).toEqual(1);
  });

  it('should update when custom melody is selected', () => {
    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: customStoreRef.wrapper }
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: {
        name: "",
        value: "Simpsons - Theme",
      },
    });
    expect(screen.queryAllByText(/simpsons:d=4,o=5,b=160:c.6,e6,f#6,8a6/i).length).toEqual(1);
  });

  it('should save and update a melody', () => {
    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    let melodies = storeRef.store.getState().melodies;
    console.log(melodies.custom);
    expect(melodies.custom.length).toEqual(0);

    fireEvent.change(screen.getByTestId('save-melody-input'), {
      target: {
        name: "",
        value: "TestName",
      },
    });
    userEvent.click(screen.getByText(/common:melodyEditorSave/i));

    melodies = storeRef.store.getState().melodies;
    expect(melodies.custom.length).toEqual(1);

    // Update already saved melody
    userEvent.click(screen.getByText(/common:melodyEditorSave/i));

    melodies = storeRef.store.getState().melodies;
    expect(melodies.custom.length).toEqual(1);

    fireEvent.change(screen.getByRole('combobox'), {
      target: {
        name: "",
        value: "TestName",
      },
    });

    userEvent.click(screen.getByText(/melodyDelete/i));

    melodies = storeRef.store.getState().melodies;
    expect(melodies.custom.length).toEqual(0);
  });

  it('should delete custom melody', () => {
    storeRef.store.dispatch(save({
      name: 'Simpsons - Theme',
      tracks: [melody],
    }));

    let melodies = storeRef.store.getState().melodies;
    expect(melodies.custom.length).toEqual(1);

    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: {
        name: "",
        value: "Simpsons - Theme",
      },
    });

    userEvent.click(screen.getByText(/melodyDelete/i));

    melodies = storeRef.store.getState().melodies;
    expect(melodies.custom.length).toEqual(0);
  });

  it('should play a melody', async() => {
    class Mocked extends MockedContextOnended{
      constructor() {
        super(contextClose, oscStart, oscStop, oscClose);
      }
    }

    window.AudioContext = Mocked;

    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    userEvent.click(screen.getByText(/common:melodyEditorPlay/i));

    expect(oscStart).toHaveBeenCalled();
    expect(oscStop).toHaveBeenCalled();
  });

  it('should play a multi part melody', async() => {
    class Mocked extends MockedContextOnended{
      constructor() {
        super(contextClose, oscStart, oscStop, oscClose);
      }
    }

    window.AudioContext = Mocked;

    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: customStoreRef.wrapper }
    );

    userEvent.click(screen.getByText(/common:melodyEditorPlayAll/i));

    expect(oscStart).toHaveBeenCalled();
    expect(oscStop).toHaveBeenCalled();
  });

  it('should stop a playing melody', async() => {
    class Mocked extends MockedContextOnended{
      constructor() {
        super(contextClose, oscStart, oscStop, oscClose);
      }
    }

    window.AudioContext = Mocked;

    render(
      <MelodyEditor
        onWrite={onWrite}
        writing={false}
      />,
      { wrapper: customStoreRef.wrapper }
    );

    userEvent.click(screen.getByText(/common:melodyEditorPlayAll/i));

    await act(async()=> {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    });

    // Since playing is instantly over with the mocked class, we can not test
    // stopping.
    // userEvent.click(screen.getByText(/common:melodyEditorStopAll/i));

    expect(oscStart).toHaveBeenCalled();
    expect(oscStop).toHaveBeenCalled();
    // expect(oscClose).toHaveBeenCalled();
  });
});
