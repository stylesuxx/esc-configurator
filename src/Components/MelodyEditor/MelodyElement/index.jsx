import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { HighlightWithinTextarea } from 'react-highlight-within-textarea';
import Rtttl from 'bluejay-rtttl-parse';

import { useTranslation } from 'react-i18next';
import './style.scss';

const MelodyElement = forwardRef(({
  label,
  melody,
  accepted,
  onAccept,
  onValid,
  onPlay,
  onStop,
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
    play(externalContext) {
      playMelody(null, externalContext);
    },
    stop() {
      stopMelody();
    },
  }));

  useEffect(() => {
    if(currentMelody) {
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

        const highlight = [];
        const uniqueWrongNotes = [ ...new Set(wrongNotes)];
        highlight.push(uniqueWrongNotes);

        if(tooLongNotes.length > 0) {
          const elements = currentMelody.split(':');
          const notes = elements[2].split(',');
          let offset = elements[0].length + elements[1].length + 2;
          for(let i = 0; i < tooLongNotes[0]; i += 1) {
            offset += notes[i].length + 1;
          }

          highlight.push([offset - 1, currentMelody.length]);
        }

        setHighlight(highlight);

        const isValid = uniqueWrongNotes.length === 0 && tooLongNotes.length === 0;
        setIsValid(isValid);
        setIsPlayable(true);

        if(isValid) {
          onValid(melody);
        }
      } catch(e) {
        setIsPlayable(false);
        setIsValid(false);
      }
    }
  }, [currentMelody]);

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

  function updateMelody(e) {
    const melody = e.target.value;
    setCurrentMelody(melody);

    // If an accepted melody changes
    if(isAccepted) {
      if(melody !== acceptedMelody) {
        setIsAccepted(false);
        onAccept(false);
      }
    }
  }

  function acceptMelody() {
    let convertedMelody = Rtttl.toBluejayStartupMelody(currentMelody).data;
    convertedMelody = Rtttl.fromBluejayStartupMelody(convertedMelody);

    setAcceptedMelody(convertedMelody);
    setCurrentMelody(convertedMelody);
    setIsAccepted(true);

    onAccept(convertedMelody);
  }

  function stopMelody() {
    if (oscillator.current) {
      oscillator.current.stop();
      oscillator.current = null;
    }
  }

  function playMelody(e, externalContext = null) {
    setPlaying(true);
    highlighted.current = highlight;
    try {
      const parsedRtttl = Rtttl.parse(currentMelody);
      onPlay();

      play(parsedRtttl.melody, externalContext);
    } catch(e) {
      setIsValid(false);
      setIsPlayable(false);
      setPlaying(false);
    }
  }

  function play(melody, externalContext = null) {
    let audioContext = new window.AudioContext();
    if(externalContext) {
      audioContext = externalContext;
    }

    const osc = oscillator.current = audioContext.createOscillator();
    osc.type = 'square';

    const volume = audioContext.createGain();
    osc.connect(volume);
    volume.connect(audioContext.destination);
    volume.gain.value = 0.05;

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
    <div className="esc-melody-wrapper">
      <div className="esc-melody">
        <header>
          <div className="index">
            <h3>
              {label}
            </h3>
          </div>

          <div className="default-btn">
            <button
              className="play"
              disabled={!isPlayable}
              onClick={playing ? stopMelody : playMelody}
              type="button"
            >
              {playing ? t('common:melodyEditorStop') : t('common:melodyEditorPlay')}
            </button>

            <button
              className={`accept ${isAccepted ? 'accepted' : ''}`}
              disabled={!isValid || playing}
              onClick={acceptMelody}
              type="button"
            >
              {t('common:melodyEditorAccept')}
            </button>
          </div>
        </header>

        <div className="editor-wrapper">
          <HighlightWithinTextarea
            containerClassName={`editor ${playing ? 'playing' : ''}`}
            disabled={playing}
            highlight={highlight}
            onChange={updateMelody}
            rows={10}
            spellCheck="false"
            value={currentMelody}
          />
        </div>
      </div>
    </div>
  );
});

MelodyElement.displayName = 'MelodyElement';

MelodyElement.propTypes = {
  accepted: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  melody: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onValid: PropTypes.func.isRequired,
};

export default MelodyElement;
