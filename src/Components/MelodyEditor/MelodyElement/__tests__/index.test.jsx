import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MelodyElement from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays MelodyElement without melody', () => {
  const onAccept = jest.fn();
  const onPlay = jest.fn();
  const onStop = jest.fn();
  const onUpdate = jest.fn();

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

test('loads and displays with unplayable melody', async() => {
  const onAccept = jest.fn();
  const onPlay = jest.fn();
  const onStop = jest.fn();
  const onUpdate = jest.fn();

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

test('loads and displays with unsupported note', async() => {
  const onAccept = jest.fn();
  const onPlay = jest.fn();
  const onStop = jest.fn();
  const onUpdate = jest.fn();

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

test('loads and displays with too long melody', async() => {
  const onAccept = jest.fn();
  const onPlay = jest.fn();
  const onStop = jest.fn();
  const onUpdate = jest.fn();

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

test('loads and displays with valid melody', async() => {
  const onAccept = jest.fn();
  const onPlay = jest.fn();
  const onStop = jest.fn();
  const onUpdate = jest.fn();

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

  // Since AudioContext is mitting in the tests, we can't test stopping
  /*
  userEvent.click(screen.getByText(/common:melodyEditorStop/i));
  expect(onStop).toHaveBeenCalled();
  */
});

test('change melody', async() => {
  const onAccept = jest.fn();
  const onPlay = jest.fn();
  const onStop = jest.fn();
  const onUpdate = jest.fn();

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

  userEvent.click(screen.getByText(/common:melodyEditorAccept/i));

  fireEvent.change(screen.getByRole(/textbox/i), { target: { value: 'simpsons:d=4,o=5,b=160:c.6' } });
  expect(onAccept).toHaveBeenCalled();
});

test('imperative Handle', async() => {
  const onAccept = jest.fn();
  const onPlay = jest.fn();
  const onStop = jest.fn();
  const onUpdate = jest.fn();
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

test('play with external context', async() => {
  jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);

  const onAccept = jest.fn();
  const onPlay = jest.fn();
  const onStop = jest.fn();
  const onUpdate = jest.fn();
  const ref = React.createRef();
  const melody = "simpsons:d=4,o=5,b=160:c.6, e6, f#6, 8a6, g.6, e6, c6, 8a, 8f#, 8f#, 8f#, 2g, 8p, 8p, 8f#, 8f#, 8f#, 8g, a#., 8c6, 8c6, 8c6, c6";

  const oscStart = jest.fn();
  const oscStop = jest.fn();
  const oscClose = jest.fn();

  const context = {
    createGain: () => ({
      gain: { value: 1 },
      connect: () => ({}),
      disconnect: () => ({}),
    }),
    createOscillator: () => ({
      connect: () => ({}),
      frequency: { setValueAtTime: () => ({}) },
      onended: null,
      start: oscStart,
      stop: oscStop,
    }),
    close: oscClose,
  };

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
    console.log(ref.current);
    ref.current.stop();
  });

  expect(onPlay).toHaveBeenCalled();
  expect(oscStart).toHaveBeenCalled();
  expect(oscStop).toHaveBeenCalled();
  // expect(oscClose).toHaveBeenCalled();
});
