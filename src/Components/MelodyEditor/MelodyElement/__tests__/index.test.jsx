import React from 'react';
import {
  createEvent,
  render,
  screen,
  fireEvent,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  MockedContext,
  MockedContextOnended,
} from './MockedAudioContext';
import MelodyElement from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

let onAccept;
let onPlay;
let onStop;
let onUpdate;

const invalidMelody = "UNPLAYABLE";
const tooLongMelody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";
const unsopportedNotesMelody = "Melody:o=3,b=900,d=4:32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.";
const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

describe('MeldodyElement', () => {
  beforeEach(() => {
    onAccept = jest.fn();
    onPlay = jest.fn();
    onStop = jest.fn();
    onUpdate = jest.fn();
  });

  it('should handle empty melody', () => {
    render(
      <MelodyElement
        accepted={false}
        disabled
        dummy={false}
        label="Label comes here"
        melody=""
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    expect(screen.getByText(/Label comes here/i)).toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorPlay/i)).toBeInTheDocument();
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorAccept/i)).toBeInTheDocument();

    expect(screen.getByText(/common:melodyEditorPlay/i)).toHaveAttribute('disabled');
    expect(onPlay).not.toHaveBeenCalled();

    expect(screen.getByText(/common:melodyEditorAccept/i)).toHaveAttribute('disabled');
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('should handle unplayable melody', async() => {
    render(
      <MelodyElement
        accepted={false}
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody={invalidMelody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    expect(screen.getByText(/Label comes here/i)).toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorPlay/i)).toBeInTheDocument();
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorAccept/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Please supply a value and an onChange parameter./i).length).toEqual(0);

    expect(screen.getByText(/common:melodyEditorAccept/i)).toHaveAttribute('disabled');
    expect(onAccept).not.toHaveBeenCalled();

    expect(screen.getByText(/common:melodyEditorPlay/i)).toHaveAttribute('disabled');
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('should handle unsupported notes', async() => {
    render(
      <MelodyElement
        accepted={false}
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody={unsopportedNotesMelody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    expect(screen.getAllByText(/32c2#./i).length).toEqual(32);
    expect(screen.getByText(/Label comes here/i)).toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorPlay/i)).toBeInTheDocument();
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorAccept/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Please supply a value and an onChange parameter./i).length).toEqual(0);

    expect(screen.getByText(/common:melodyEditorAccept/i)).toHaveAttribute('disabled');
    expect(onAccept).not.toHaveBeenCalled();

    userEvent.click(screen.getByText(/common:melodyEditorPlay/i));
    expect(onPlay).toHaveBeenCalled();
  });

  it('should handle too long melody', async() => {
    render(
      <MelodyElement
        accepted={false}
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody={tooLongMelody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    expect(screen.getByText(new RegExp(/^, 8p, 8f#, 8f#,/i))).toBeInTheDocument();
    expect(screen.getByText(/Label comes here/i)).toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorPlay/i)).toBeInTheDocument();
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorAccept/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Please supply a value and an onChange parameter./i).length).toEqual(0);

    expect(screen.getByText(/common:melodyEditorAccept/i)).toHaveAttribute('disabled');
    expect(onAccept).not.toHaveBeenCalled();

    userEvent.click(screen.getByText(/common:melodyEditorPlay/i));
    expect(onPlay).toHaveBeenCalled();
  });

  it('should handle a valid melody', async() => {
    const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

    render(
      <MelodyElement
        accepted={false}
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody={melody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    expect(screen.getByText(/Label comes here/i)).toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorPlay/i)).toBeInTheDocument();
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorAccept/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Please supply a value and an onChange parameter./i).length).toEqual(0);

    // Check accept before play, otherwise the button is in playing state...
    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    expect(onAccept).toHaveBeenCalled();

    userEvent.click(screen.getByText(/common:melodyEditorPlay/i));
    expect(onPlay).toHaveBeenCalled();

    // Since playing is instantly over with the mocked class, we can not test
    // stopping.
    // userEvent.click(screen.getByText(/common:melodyEditorStop/i));
    // expect(onStop).toHaveBeenCalled();
  });

  it('should handle a change to a valid melody', async() => {
    render(
      <MelodyElement
        accepted={false}
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody={invalidMelody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    expect(screen.getByText(/common:melodyEditorAccept/i)).toHaveAttribute('disabled');
    expect(onAccept).not.toHaveBeenCalled();

    const textarea = screen.getByRole('textbox');
    const event = createEvent.paste(textarea, {
      clipboardData: {
        types: ['text/plain'],
        getData: () => 'simpsons:d=4,o=5,b=160:c.6',
      },
    });
    fireEvent(textarea, event);

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    expect(onAccept).toHaveBeenCalled();
  });

  it('should handle a change to different melody', async() => {
    render(
      <MelodyElement
        accepted={false}
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody={melody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    expect(onAccept).toHaveBeenCalled();

    // TODO: Find a way to reset the textarea before pasting new content into it
    /*
    const textarea = screen.getByRole('textbox');
    const event = createEvent.paste(textarea, {
      clipboardData: {
        types: ['text/plain'],
        getData: () => 'Melody:b=160,o=5,d=4:c6.,e6,f#6,8a6,g6.,e6,c6,8a,8f#,8f#,8f#,2g',
      },
    });
    fireEvent(textarea, event);

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    expect(onAccept.callCount).toBe(2);
    */
  });

  it('should accept melody twice', async() => {
    const melody = "Melody:b=570,o=4,d=32:4b,p,4e5,p,4b,p,4f#5,2p,4e5,2b5,8b5";

    render(
      <MelodyElement
        accepted
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody=""
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    const textarea = screen.getByRole('textbox');
    const event = createEvent.paste(textarea, {
      clipboardData:{
        types: ['text/plain'],
        getData: () => melody,
      },
    });
    fireEvent(textarea, event);

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));

    // +1 because it is called once when initializing the component
    expect(onAccept.mock.calls.length).toBe(2 + 1);
  });

  it('should play and stop through imperative handle', async() => {
    const ref = React.createRef();

    render(
      <MelodyElement
        accepted={false}
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody={melody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
        ref={ref}
      />
    );

    act(()=> {
      ref.current.play();
      ref.current.stop();
    });
    expect(screen.getByText(/common:melodyEditorPlay/i)).toBeInTheDocument();
  });

  it('should play with external context', async() => {
    jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);

    const ref = React.createRef();

    const oscStart = jest.fn();
    const oscStop = jest.fn();
    const oscClose = jest.fn();
    const contextClose = jest.fn();

    const context = new MockedContext(contextClose, oscStart, oscStop, oscClose);

    render(
      <MelodyElement
        accepted={false}
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody={melody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
        ref={ref}
      />
    );

    await act(async()=> {
      ref.current.play(context, 1);
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      ref.current.stop();
    });

    expect(onPlay).toHaveBeenCalled();
    expect(oscStart).toHaveBeenCalled();
    expect(oscStop).toHaveBeenCalled();
  });

  it('should play with external context, onended', async() => {
    jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);

    const ref = React.createRef();

    const oscStart = jest.fn();
    const oscStop = jest.fn();
    const oscClose = jest.fn();
    const contextClose = jest.fn();

    const context = new MockedContextOnended(contextClose, oscStart, oscStop, oscClose);

    render(
      <MelodyElement
        accepted={false}
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody={melody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
        ref={ref}
      />
    );

    await act(async()=> {
      ref.current.play(context, 1);
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      ref.current.stop();
    });

    expect(onPlay).toHaveBeenCalled();
    expect(oscStart).toHaveBeenCalled();
    expect(oscStop).toHaveBeenCalled();
  });

  it('should play', async() => {
    const ref = React.createRef();

    const oscStart = jest.fn();
    const oscStop = jest.fn();
    const oscClose = jest.fn();
    const contextClose = jest.fn();

    class Mocked extends MockedContextOnended{
      constructor() {
        super(contextClose, oscStart, oscStop, oscClose);
      }
    }

    window.AudioContext = Mocked;

    render(
      <MelodyElement
        accepted={false}
        disabled={false}
        dummy={false}
        label="Label comes here"
        melody={melody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
        ref={ref}
      />
    );

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    expect(onAccept).toHaveBeenCalled();

    userEvent.click(screen.getByText(/common:melodyEditorPlay/i));
    expect(onPlay).toHaveBeenCalled();

    await act(async()=> {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    });

    expect(oscStart).toHaveBeenCalled();
    expect(oscStop).toHaveBeenCalled();
  });
});
