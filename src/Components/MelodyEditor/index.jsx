import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import './style.scss';

import Checkbox from '../Input/Checkbox';
import MelodyElement from './MelodyElement';

function MelodyEditor({
  melodies,
  onClose,
  onSave,
  writing,
}) {
  const defaultMelodies = melodies.map(() => null);
  const defaultAccepted = melodies.map(() => null);
  const references = melodies.map(() => useRef());

  const { t } = useTranslation();
  const [currentMelodies, setCurrentMelodies] = useState(melodies);
  const [allAccepted, setAllAccepted] = useState(false);
  const [sync, setSync] = useState(false);
  const [validMelodies, setValidMelodies] = useState(defaultMelodies);
  const [acceptedMelodies, setAcceptedMelodies] = useState(defaultAccepted);
  const [isAnyPlaying, setIsAnyPlaying] = useState(false);
  const totalPlaying = useRef(0);
  const audioContext = useRef(0);

  useEffect(() => {
    checkAllAccepted();
  }, [acceptedMelodies]);

  function handleClose() {
    onClose();
  }

  function checkAllAccepted() {
    let allAccepted = true;
    for(let i = 0; i < acceptedMelodies.length; i += 1) {
      if(!acceptedMelodies[i]) {
        allAccepted = false;
        break;
      }
    }

    if(allAccepted) {
      const currentMelodies = [...acceptedMelodies];
      setCurrentMelodies(currentMelodies);
    }

    setAllAccepted(allAccepted);
  }

  function handleAcceptAll(accept) {
    const acceptedMelodiesNew = acceptedMelodies.map(() => accept);
    setAcceptedMelodies(acceptedMelodiesNew);
  }

  function handleValidAll(melody) {
    const validMelodies = [];
    for (let i = 0; i < melodies.length; i += 1) {
      validMelodies.push(melody);
    }

    setValidMelodies(validMelodies);
  }

  function handleAccept(index, accept) {
    acceptedMelodies[index] = accept;
    const newAccepted = [...acceptedMelodies];
    setAcceptedMelodies(newAccepted);
  }

  function handleValid(index, melody) {
    validMelodies[index] = melody;
    const newValidMelodies = [...validMelodies];
    setValidMelodies(newValidMelodies);
  }

  function handleChildClick(e) {
    e.stopPropagation();
  }

  function handleSave() {
    onSave(validMelodies);
  }

  function handlePlay() {
    totalPlaying.current += 1;
    setIsAnyPlaying(true);
  }

  function handleStop() {
    totalPlaying.current -= 1;
    if(totalPlaying.current === 0) {
      setIsAnyPlaying(false);
      if(audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
      }
    }
  }

  function handlePlayAll() {
    setIsAnyPlaying(true);

    audioContext.current = new window.AudioContext();
    for(let i = 0; i < references.length; i += 1) {
      const child = references[i];
      child.current.play(audioContext.current);
    }
  }

  function handleStopAll() {
    for(let i = 0; i < references.length; i += 1) {
      const child = references[i];
      child.current.stop();
    }
  }

  function toggleSync() {
    handleAcceptAll(false);
    setCurrentMelodies(validMelodies);
    setSync(!sync);
  }

  function MelodyElementSingle({
    accepted,
    index,
    label,
    melody,
    onAccept,
  }) {
    function handleValidMelody(melody) {
      handleValid(index, melody);
    }

    function handleAcceptMelody(accept) {
      onAccept(index, accept);
    }

    return(
      <MelodyElement
        accepted={accepted}
        label={label}
        melody={melody}
        onAccept={handleAcceptMelody}
        onPlay={handlePlay}
        onStop={handleStop}
        onValid={handleValidMelody}
        ref={references[index]}
      />
    );
  }
  MelodyElementSingle.propTypes = {
    accepted: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    melody: PropTypes.string.isRequired,
    onAccept: PropTypes.func.isRequired,
  };

  function MelodyElementAll({
    accepted,
    label,
    melody,
  }) {
    return(
      <MelodyElement
        accepted={accepted}
        label={label}
        melody={melody}
        onAccept={handleAcceptAll}
        onPlay={handlePlay}
        onStop={handleStop}
        onValid={handleValidAll}
      />
    );
  }
  MelodyElementAll.propTypes = {
    accepted: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    melody: PropTypes.string.isRequired,
  };

  const melodyElements = useMemo(
    () => currentMelodies.map((melody, index) => (
      <MelodyElementSingle
        accepted={acceptedMelodies[index] ? true : false}
        index={index}
        key={index}
        label={`ESC ${index + 1}`}
        melody={melody}
        onAccept={handleAccept}
        onValid={handleValid}
      />
    )), [currentMelodies]
  );

  const melodyElement = useMemo(
    () => (
      <MelodyElementAll
        accepted={acceptedMelodies[0] ? true : false}
        label={t("common:allEscs")}
        melody={currentMelodies[0]}
      />
    ), [currentMelodies]
  );

  return (
    <div
      id="melody-editor"
      onClick={handleClose}
    >
      <div
        className="melody-editor-wrapper"
        onClick={handleChildClick}
      >
        <div
          className="close"
          onClick={handleClose}
        >
          {t('settings:closeText')}
        </div>

        <h3>
          {t('common:melodyEditorHeader')}
        </h3>

        <div className="sync-wrapper">
          <Checkbox
            disabled={isAnyPlaying}
            hint={t("common:syncMelodiesHint")}
            label={t("common:syncMelodies")}
            name="syncMelodies"
            onChange={toggleSync}
            value={sync ? 1 : 0}
          />
        </div>

        <div className={`melody-editor-escs ${sync ? 'all' : ''}`}>
          {!sync && melodyElements}

          {sync && melodyElement}
        </div>

        <div className="default-btn button-wrapper">
          { !sync &&
            <button
              disabled={writing}
              onClick={isAnyPlaying ? handleStopAll : handlePlayAll}
              type="button"
            >
              {isAnyPlaying ? t('common:melodyEditorStopAll') : t('common:melodyEditorPlayAll')}
            </button>}

          <button
            disabled={!allAccepted || isAnyPlaying || writing}
            onClick={handleSave}
            type="button"
          >
            {t('common:melodyEditorSave')}
          </button>
        </div>
      </div>
    </div>
  );
}

MelodyEditor.propTypes = {
  melodies: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  writing: PropTypes.bool.isRequired,
};

export default MelodyEditor;
