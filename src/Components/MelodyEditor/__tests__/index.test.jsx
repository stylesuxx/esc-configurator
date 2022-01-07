import React from 'react';
import {
  act,
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import defaultMelodies from '../../../melodies.json';

import { MockedContextOnended } from '../MelodyElement/__tests__/MockedAudioContext';

import MelodyEditor from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

let onClose;
let onDelete;
let onWrite;
let onSave;
let oscStart;
let oscStop;
let oscClose;
let contextClose;

describe('MelodyEditor', () => {
  beforeEach(() => {
    onClose = jest.fn();
    onDelete = jest.fn();
    onWrite = jest.fn();
    onSave = jest.fn();
    oscStart = jest.fn();
    oscStop = jest.fn();
    oscClose = jest.fn();
    contextClose = jest.fn();
  });

  it('should display without melodies', () => {
    const melodies = [null, null, null, null];

    render(
      <MelodyEditor
        customMelodies={[]}
        defaultMelodies={[]}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        writing={false}
      />
    );

    expect(screen.getAllByText('common:melodyEditorPlay').length).toEqual(1);
    expect(screen.getAllByText(/common:melodyEditorAccept/i).length).toEqual(1);
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Please supply a value and an onChange parameter./i).length).toEqual(2);
    expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
    expect(screen.getByText(/write/i)).toBeInTheDocument();

    userEvent.click(screen.getByText(/write/i));
    expect(onWrite).not.toHaveBeenCalled();

    userEvent.click(screen.getByTestId('CloseIcon'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should display with different melodies', () => {
    const melodies = [melody, melody, melody, `${melody}, f#6`];

    render(
      <MelodyEditor
        customMelodies={[]}
        defaultMelodies={[]}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        writing={false}
      />
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
    expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
    expect(screen.getByText(/write/i)).toBeInTheDocument();

    const acceptButtons = screen.getAllByText(/common:melodyEditorAccept/i);
    for(let i = 0; i < acceptButtons.length; i += 1) {
      userEvent.click(acceptButtons[i]);
    }
    userEvent.click(screen.getByText(/write/i));
    expect(onWrite).toHaveBeenCalled();

    userEvent.click(screen.getByTestId('CloseIcon'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should be possible to click accept', () => {
    const melodies = [melody, melody, melody, `${melody}, f#6`];

    render(
      <MelodyEditor
        customMelodies={[]}
        defaultMelodies={[]}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        writing={false}
      />
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
    expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
    expect(screen.getByText(/write/i)).toBeInTheDocument();

    const acceptButtons = screen.getAllByText(/common:melodyEditorAccept/i);
    for(let i = 0; i < acceptButtons.length; i += 1) {
      userEvent.click(acceptButtons[i]);
    }
  });

  it('should display while writing', () => {
    const melodies = [melody, melody, melody, `${melody}, f#6`];

    render(
      <MelodyEditor
        customMelodies={[]}
        defaultMelodies={[]}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        writing
      />
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
    expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
    expect(screen.getByText(/write/i)).toBeInTheDocument();

    userEvent.click(screen.getByText(/write/i));
    expect(onWrite).not.toHaveBeenCalled();

    userEvent.click(screen.getByTestId('CloseIcon'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should display single editor when sycned', () => {
    const melodies = [melody, melody, melody, melody];

    render(
      <MelodyEditor
        customMelodies={[]}
        defaultMelodies={[]}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        writing={false}
      />
    );

    expect(screen.getByText(/common:allEscs/i)).toBeInTheDocument();
    expect(screen.getAllByText('common:melodyEditorPlay').length).toEqual(1);
    expect(screen.getAllByText(/common:melodyEditorAccept/i).length).toEqual(1);
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Please supply a value and an onChange parameter./i)).not.toBeInTheDocument();
    expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
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
    const melodies = [melody, melody, melody, melody];

    render(
      <MelodyEditor
        customMelodies={[]}
        defaultMelodies={defaultMelodies}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        writing={false}
      />
    );

    fireEvent.mouseDown(screen.getByText('melodyPresetsLabel'));

    const listbox = screen.getByRole('listbox');
    const element = listbox.querySelector('li[data-value="preset-Bluejay Default"]');
    userEvent.click(element);

    expect(screen.queryAllByText(/bluejay:b=570,o=4,d=32/i).length).toEqual(2);
  });

  it('should update when custom melody is selected', () => {
    const melodies = [melody, melody, melody, melody];

    render(
      <MelodyEditor
        customMelodies={defaultMelodies}
        defaultMelodies={[]}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        selected="Bluejay Default"
        writing={false}
      />
    );

    fireEvent.mouseDown(screen.getByText('melodyPresetsLabel'));

    const listbox = screen.getByRole('listbox');
    const element = listbox.querySelector(`li[data-value="Simpsons Theme"]`);
    userEvent.click(element);

    expect(screen.queryAllByText(/simpsons:d=4,o=5,b=160:c.6,e6,f#6,8a6/i).length).toEqual(2);
  });

  it('should be possible to delete custom melody', () => {
    const onDelete = jest.fn();
    const melodies = [melody, melody, melody, melody];

    const { container } = render(
      <MelodyEditor
        customMelodies={defaultMelodies}
        defaultMelodies={defaultMelodies}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        selected="Bluejay Default"
        writing={false}
      />
    );

    fireEvent.mouseDown(screen.getByText('melodyPresetsLabel'));

    const listbox = screen.getByRole('listbox');
    const element = listbox.querySelector(`li[data-value="Simpsons Theme"]`);
    userEvent.click(element);

    userEvent.click(screen.getByText(/melodyDelete/i));
    expect(onDelete).toHaveBeenCalled();
  });

  it('should be possible to save a melody', () => {
    const onDelete = jest.fn();
    const melodies = [melody, melody, melody, melody];

    const { container } = render(
      <MelodyEditor
        customMelodies={[]}
        defaultMelodies={defaultMelodies}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        writing={false}
      />
    );

    userEvent.click(screen.getByText(/common:melodyEditorSave/i));
    expect(onSave).not.toHaveBeenCalled();

    const element = screen.getAllByRole('textbox')[0];
    expect(element).toBeInTheDocument();

    fireEvent.change(element, {
      target: {
        name: "",
        value: "TestName",
      },
    });
    userEvent.click(screen.getByText(/common:melodyEditorSave/i));
    expect(onSave).toHaveBeenCalled();

    userEvent.click(screen.getByText(/melodyDelete/i));
  });

  it('should be possible to play a melody', async() => {
    const onDelete = jest.fn();
    const melodies = [melody, melody, melody, `${melody}, f#6`];

    class Mocked extends MockedContextOnended{
      constructor() {
        super(contextClose, oscStart, oscStop, oscClose);
      }
    }

    window.AudioContext = Mocked;

    render(
      <MelodyEditor
        customMelodies={[]}
        defaultMelodies={defaultMelodies}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        writing={false}
      />
    );

    userEvent.click(screen.getByText(/common:melodyEditorPlayAll/i));

    await act(async()=> {
      await new Promise((resolve) => {
        setTimeout(resolve, 400);
      });
    });

    expect(oscStart).toHaveBeenCalled();
    expect(oscStop).toHaveBeenCalled();
  });

  it('should be possible to stop a playing melody', async() => {
    const melodies = [melody, melody, melody, `${melody}, f#6`];

    class Mocked extends MockedContextOnended{
      constructor() {
        super(contextClose, oscStart, oscStop, oscClose);
      }
    }

    window.AudioContext = Mocked;

    render(
      <MelodyEditor
        customMelodies={[]}
        defaultMelodies={defaultMelodies}
        dummy={false}
        melodies={melodies}
        onClose={onClose}
        onDelete={onDelete}
        onSave={onSave}
        onWrite={onWrite}
        open
        writing={false}
      />
    );

    userEvent.click(screen.getByText(/common:melodyEditorPlayAll/i));

    // Since playing is instantly over with the mocked class, we can not test
    // stopping.
    // userEvent.click(screen.getByText(/common:melodyEditorStopAll/i));

    expect(oscStart).toHaveBeenCalled();
    expect(oscStop).toHaveBeenCalled();
    // expect(oscClose).toHaveBeenCalled();
  });
});
