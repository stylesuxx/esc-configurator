import React from 'react';
import {
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

describe('MeldodyElement', () => {
  beforeEach(() => {
    onAccept = jest.fn();
    onPlay = jest.fn();
    onStop = jest.fn();
    onUpdate = jest.fn();
  });

  it('should display without melody', () => {
    render(
      <MelodyElement
        accepted={false}
        label="Label comes here"
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
    expect(screen.getAllByText(/Please supply a value and an onChange parameter./i).length).toEqual(2);

    userEvent.click(screen.getByText(/common:melodyEditorPlay/i));
    expect(onPlay).not.toHaveBeenCalled();

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('should display with unplayable melody', async() => {
    const melody = "UNPLAYABLE";

    render(
      <MelodyElement
        accepted={false}
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

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    expect(onAccept).not.toHaveBeenCalled();

    userEvent.click(screen.getByText(/common:melodyEditorPlay/i));
    expect(onPlay).not.toHaveBeenCalled();
  });

  it('should display with unsupported note', async() => {
    const melody = "Melody:o=3,b=900,d=4:32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.,32c2#.,32d5#.";

    const { container } = render(
      <MelodyElement
        accepted={false}
        label="Label comes here"
        melody={melody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    expect(container.querySelectorAll('mark').length).toEqual(32);
    expect(screen.getByText(/Label comes here/i)).toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorPlay/i)).toBeInTheDocument();
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorAccept/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Please supply a value and an onChange parameter./i).length).toEqual(0);

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    expect(onAccept).not.toHaveBeenCalled();

    userEvent.click(screen.getByText(/common:melodyEditorPlay/i));
    expect(onPlay).toHaveBeenCalled();
  });

  it('should load with too long melody', async() => {
    const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

    const { container } = render(
      <MelodyElement
        accepted={false}
        label="Label comes here"
        melody={melody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    expect(container.querySelectorAll('mark').length).toEqual(1);
    expect(screen.getByText(/Label comes here/i)).toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorPlay/i)).toBeInTheDocument();
    expect(screen.queryByText(/common:melodyEditorStop/i)).not.toBeInTheDocument();
    expect(screen.getByText(/common:melodyEditorAccept/i)).toBeInTheDocument();
    expect(screen.queryAllByText(/Please supply a value and an onChange parameter./i).length).toEqual(0);

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    expect(onAccept).not.toHaveBeenCalled();

    userEvent.click(screen.getByText(/common:melodyEditorPlay/i));
    expect(onPlay).toHaveBeenCalled();
  });

  it('should display with valid melody', async() => {
    const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

    render(
      <MelodyElement
        accepted={false}
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

  it('should be able to change to valid melody', async() => {
    const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, xxx";

    render(
      <MelodyElement
        accepted={false}
        label="Label comes here"
        melody={melody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));

    fireEvent.change(screen.getByRole(/textbox/i), { target: { value: 'simpsons:d=4,o=5,b=160:c.6' } });
    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));

    expect(onAccept).toHaveBeenCalled();
  });

  it('should be able to change to different melody', async() => {
    const melody = "Melody:b=160,o=5,d=4:c6.,e6,f#6,8a6,g6.,e6,c6,8a,8f#,8f#,8f#,2g,8p,8p,8f#,8f#,8f#,8g,a#.,8c6,8c6,8c6,c6";

    render(
      <MelodyElement
        accepted={false}
        label="Label comes here"
        melody={melody}
        onAccept={onAccept}
        onPlay={onPlay}
        onStop={onStop}
        onUpdate={onUpdate}
      />
    );

    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));

    fireEvent.change(screen.getByRole(/textbox/i), { target: { value: 'Melody:b=160,o=5,d=4:c6.,e6,f#6,8a6,g6.,e6,c6,8a,8f#,8f#,8f#,2g' } });
    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));

    expect(onAccept).toHaveBeenCalled();
  });

  it('should accept melody twice', async() => {
    const melody = "Melody:b=570,o=4,d=32:4b,p,4e5,p,4b,p,4f#5,2p,4e5,2b5,8b5";

    render(
      <MelodyElement
        accepted
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

    fireEvent.change(screen.getByRole(/textbox/i), { target: { value: 'Melody:b=570,o=4,d=32:4b,p,4e5,p,4b,p,4f#5,2p,4e5,2b5,8b5' } });
    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));
    userEvent.click(screen.getByText(/common:melodyEditorAccept/i));

    expect(onAccept).toHaveBeenCalled();
  });

  it('should play and stop through imperative handle', async() => {
    const ref = React.createRef();

    const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

    render(
      <MelodyElement
        accepted={false}
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
    const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

    const oscStart = jest.fn();
    const oscStop = jest.fn();
    const oscClose = jest.fn();
    const contextClose = jest.fn();

    const context = new MockedContext(contextClose, oscStart, oscStop, oscClose);

    render(
      <MelodyElement
        accepted={false}
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
        setTimeout(resolve, 2000);
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
    const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

    const oscStart = jest.fn();
    const oscStop = jest.fn();
    const oscClose = jest.fn();
    const contextClose = jest.fn();

    const context = new MockedContextOnended(contextClose, oscStart, oscStop, oscClose);

    render(
      <MelodyElement
        accepted={false}
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
        setTimeout(resolve, 2000);
      });
      ref.current.stop();
    });

    expect(onPlay).toHaveBeenCalled();
    expect(oscStart).toHaveBeenCalled();
    expect(oscStop).toHaveBeenCalled();
  });

  it('should play', async() => {
    const ref = React.createRef();
    const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

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
        setTimeout(resolve, 2000);
      });
    });

    expect(oscStart).toHaveBeenCalled();
    expect(oscStop).toHaveBeenCalled();
  });
});
