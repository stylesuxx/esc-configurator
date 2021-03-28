import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  HighlightWithinTextarea
} from 'react-highlight-within-textarea';

import Rtttl from '../../../utils/Rtttl';

import {
  useTranslation,
} from 'react-i18next';
import './style.scss';

function MelodyElement({
  label,
  melody,
  accepted,
  onAccept,
  onValid,
  onPlay,
  onStop,
}, ref) {
  const { t } = useTranslation();
  const [currentMelody, setCurrentMelody] = useState(melody);
  const [acceptedMelody, setAcceptedMelody] = useState(null);
  const [highlight, setHighlight] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isAccepted, setIsAccepted] = useState(accepted);
  const [isPlayable, setIsPlayable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const stop = useRef(false);

  useImperativeHandle(ref, () => ({
    play() {
      playMelody();
    },
    stop() {
      stop.current = true;
    }
  }));

  useEffect(() => {
    if(currentMelody) {
      try {
        const response = Rtttl.toBluejayStartupMelody(currentMelody);
        const errors = response.errorCodes;
        const notes = currentMelody.split(':')[2].split(',');

        const wrongNotes = [];
        for(let i = 0; i < errors.length; i += 1) {
          switch(errors[i]) {
            case 1: {
              wrongNotes.push(notes[i].replace(',', ''));
            }
          }
        }
        const uniqueWrongNotes = [ ...new Set(wrongNotes)];
        setHighlight(uniqueWrongNotes);

        const isValid = uniqueWrongNotes.length === 0;
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
    let convertedMelody = Rtttl.toBluejayStartupMelody(currentMelody).startupMelodyData;
    convertedMelody = Rtttl.fromBluejayStartupMelody(convertedMelody);

    setAcceptedMelody(convertedMelody);
    setCurrentMelody(convertedMelody);
    setIsAccepted(true);

    onAccept(convertedMelody);
  }

  function stopMelody() {
    stop.current = true;
  }

  function playMelody() {
    setPlaying(true);
    try {
      const parsedRtttl = Rtttl.parse(currentMelody);
      const audioContext = new AudioContext();
      onPlay();
      play(parsedRtttl.melody, audioContext);
    } catch(e) {
      setIsValid(false);
      setIsPlayable(false);
      setPlaying(false);
    }
  }

  function play(melody, audioContext) {
    if (melody.length === 0 || stop.current) {
      stop.current = false;
      setPlaying(false);
      onStop();
      return;
    }

    const osc = audioContext.createOscillator();
    osc.type = 'square';
    osc.start(0);

    const note = melody[0];
    osc.frequency.value = note.frequency;
    osc.connect(audioContext.destination);

    setTimeout(() => {
      osc.disconnect(audioContext.destination);
      play(melody.slice(1), audioContext, osc);
    }, note.duration);
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
            containerClassName="editor"
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
}

MelodyElement.propTypes = {
  accepted: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  melody: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onValid: PropTypes.func.isRequired,
};

export default forwardRef(MelodyElement);
