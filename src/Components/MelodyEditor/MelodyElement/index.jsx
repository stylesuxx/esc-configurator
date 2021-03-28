import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
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
}) {
  const { t } = useTranslation();
  const [currentMelody, setCurrentMelody] = useState(melody);
  const [highlight, setHighlight] = useState(/[ae]/g);
  const [isValid, setIsValid] = useState(false);
  const [isAccepted, setIsAccepted] = useState(accepted);
  const [acceptedMelody, setAcceptedMelody] = useState(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if(currentMelody) {
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

      if(isValid) {
        onValid(melody);
      }
    }
  }, [currentMelody]);

  function validateMelody(e) {
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

    onAccept(true);
  }

  function playMelody() {
    setDisabled(true);
    const parsedRtttl = Rtttl.parse(currentMelody);
    const audioContext = new AudioContext();
    play(parsedRtttl.melody, audioContext);
  }

  function play(melody, audioContext) {
    if (melody.length === 0) {
      setDisabled(false);
      return;
    }

    const osc = audioContext.createOscillator();
    osc.type = 'square';
    osc.start(0);

    const note = melody[0];
    console.log(note);
    osc.frequency.value = note.frequency;
    osc.connect(audioContext.destination);

    setTimeout(() => {
      osc.disconnect(audioContext.destination);
      play(melody.slice(1), audioContext, osc);
    }, note.duration);
  }

  return (
    <div className="esc-melody-wrapper">
      <div
        className="esc-melody"
        onChange={validateMelody}
      >
        <header>
          <div className="index">
            <h3>
              {label}
            </h3>
          </div>

          <div className="default-btn">
            <button
              className="play"
              disabled={disabled}
              onClick={playMelody}
              type="button"
            >
              {t('common:melodyEditorPlay')}
            </button>

            <button
              className={`accept ${isAccepted ? 'accepted' : ''}`}
              disabled={!isValid || disabled}
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
            disabled={disabled}
            highlight={highlight}
            onChange={validateMelody}
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
  onValid: PropTypes.func.isRequired,
};

export default MelodyElement;
