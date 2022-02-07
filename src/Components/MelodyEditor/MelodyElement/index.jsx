import { HighlightWithinTextarea } from 'react-highlight-within-textarea';
import { useTranslation } from 'react-i18next';
import Rtttl from 'bluejay-rtttl-parse';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import './style.scss';

const MelodyElement = forwardRef(({
  disabled,
  dummy,
  label,
  melody,
  accepted,
  onAccept,
  onPlay,
  onStop,
  onUpdate,
}, ref) => {
  const { t } = useTranslation();

  const [currentMelody, setCurrentMelody] = useState(melody);
  const [acceptedMelody, setAcceptedMelody] = useState(null);
  const [highlight, setHighlight] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isAccepted, setIsAccepted] = useState(accepted);
  const [isPlayable, setIsPlayable] = useState(false);
  const [playing, setPlaying] = useState(false);

  const oscillator = useRef(null);
  const highlighted = useRef(null);

  useImperativeHandle(ref, () => ({
    play(externalContext, gainModifier) {
      handlePlayMelody(null, externalContext, gainModifier);
    },
    stop() {
      handleStopMelody();
    },
  }));

  useEffect(() => {
    setCurrentMelody(melody);
  }, [melody]);

  useEffect(() => {
    try {
      const response = Rtttl.toBluejayStartupMelody(currentMelody);
      const errors = response.errorCodes;
      const notes = currentMelody.split(':')[2].split(',');

      const wrongNotes = [];
      const tooLongNotes = [];
      for(let i = 0; i < errors.length; i += 1) {
        switch(errors[i]) {
          case 1: {
            wrongNotes.push(notes[i].replace(',', ''));
          } break;

          case 2: {
            tooLongNotes.push(i);
          } break;
        }
      }

      let current = [];
      const uniqueWrongNotes = [ ...new Set(wrongNotes)];
      if(uniqueWrongNotes.length > 0) {
        current.push(uniqueWrongNotes);
      }

      if(tooLongNotes.length > 0) {
        const elements = currentMelody.split(':');
        const notes = elements[2].split(',');
        let offset = elements[0].length + elements[1].length + 2;
        for(let i = 0; i < tooLongNotes[0]; i += 1) {
          offset += notes[i].length + 1;
        }

        current.push([offset - 1, currentMelody.length]);
      }

      setHighlight(current);

      const isValid = uniqueWrongNotes.length === 0 && tooLongNotes.length === 0;
      setIsValid(isValid);
      setIsPlayable(true);
    } catch(e) {
      setIsPlayable(false);
      setIsValid(false);
    }

    onUpdate(currentMelody);
  }, [currentMelody, onUpdate]);

  const handleMelodyUpdate = useCallback((melody) => {
    setCurrentMelody(melody);

    // If an accepted melody changes
    if(isAccepted && melody !== acceptedMelody) {
      setIsAccepted(false);
      onAccept(false);
    }
  }, [onAccept, isAccepted, acceptedMelody]);

  const handleAcceptMelody = useCallback(() => {
    let convertedMelody = Rtttl.toBluejayStartupMelody(currentMelody).data;
    convertedMelody = Rtttl.fromBluejayStartupMelody(convertedMelody);

    setAcceptedMelody(convertedMelody);
    setCurrentMelody(convertedMelody);
    setIsAccepted(true);

    onAccept(convertedMelody);
  }, [currentMelody, onAccept]);

  // Can only be tested when the melody is acutally being played
  function highlightNote(index) {
    const elements = currentMelody.split(':');
    const notes = elements[2].split(',');

    let from = elements[0].length + elements[1].length + 2;
    for(let i = 0; i < index; i += 1) {
      from += notes[i].length + 1;
    }
    const to = from + notes[index].length;

    setHighlight([from, to]);
  }

  function handleStopMelody() {
    if (oscillator.current) {
      oscillator.current.stop();
      oscillator.current = null;
    }
  }

  function handlePlayMelody(e, externalContext = null, gainModifier = 1) {
    setPlaying(true);
    highlighted.current = highlight;
    try {
      const parsedRtttl = Rtttl.parse(currentMelody);
      onPlay();

      play(parsedRtttl.melody, externalContext, gainModifier);
    } catch(e) {
      setIsValid(false);
      setIsPlayable(false);
      setPlaying(false);
    }
  }

  function play(melody, externalContext, gainModifier) {
    const audioContext = externalContext || new window.AudioContext();

    const volume = audioContext.createGain();
    volume.gain.value = 0.05 * gainModifier;

    const osc = oscillator.current = audioContext.createOscillator();

    osc.type = 'square';
    osc.connect(volume);
    volume.connect(audioContext.destination);

    osc.onended = () => {
      volume.disconnect(audioContext.destination);

      if(!externalContext) {
        audioContext.close();
      }
      oscillator.current = null;

      setPlaying(false);
      setHighlight(highlighted.current);
      onStop();
    };

    let t = 0;
    for (const note of melody) {
      osc.frequency.setValueAtTime(note.frequency, t);
      t += note.duration / 1000;
    }

    const hl = (i) => {
      // highlight note if this oscillator is still playing
      if(oscillator.current === osc && melody[i]) {
        setTimeout(() => hl(i + 1), melody[i].duration);
        highlightNote(i);
      }
    };

    hl(0);
    osc.start(audioContext.currentTime);
    osc.stop(t);
  }

  return (
    <div className="esc-melody">
      <Stack spacing={1}>
        <header>
          <Typography>
            {label}
          </Typography>

          <ButtonGroup>
            <Button
              className="play"
              disabled={!isPlayable || disabled}
              onClick={playing ? handleStopMelody : handlePlayMelody}
              variant='outlined'
            >
              {playing ? t('common:melodyEditorStop') : t('common:melodyEditorPlay')}
            </Button>

            { !dummy &&
              <Button
                className={`accept ${isAccepted ? 'accepted' : ''}`}
                disabled={!isValid || playing || disabled}
                onClick={handleAcceptMelody}
                variant='outlined'
              >
                {t('common:melodyEditorAccept')}
              </Button>}
          </ButtonGroup>
        </header>

        <div
          className={`editor-wrapper ${playing ? 'playing' : ''}`}
          disabled={playing || disabled}
        >
          <HighlightWithinTextarea
            highlight={highlight}
            onChange={handleMelodyUpdate}
            value={currentMelody}
          />
        </div>
      </Stack>
    </div>
  );
});

MelodyElement.displayName = 'MelodyElement';

MelodyElement.propTypes = {
  accepted: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  dummy: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  melody: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default MelodyElement;
