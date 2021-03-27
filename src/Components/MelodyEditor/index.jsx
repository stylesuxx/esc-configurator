import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';

import {
  useTranslation,
} from 'react-i18next';
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
  const defaultAccepted = melodies.map(() => false);
  const { t } = useTranslation();
  const [currentMelodies, setCurrentMelodies] = useState(melodies);
  const [allAccepted, setAllAccepted] = useState(false);
  const [sync, setSync] = useState(false);
  const [validMelodies, setValidMelodies] = useState(defaultMelodies);
  const [accepted, setAccepted] = useState(defaultAccepted);

  useEffect(() => {
    checkAllAccepted();
  }, [accepted, validMelodies]);

  function handleClose() {
    onClose();
  }

  function checkAllAccepted() {
    let allAccepted = true;
    for(let i = 0; i < accepted.length; i += 1) {
      if(!accepted[i]) {
        allAccepted = false;
        break;
      }
    }

    console.log("all accepted", allAccepted, accepted);
    if(allAccepted) {
      const currentMelodies = [...validMelodies];
      setCurrentMelodies(currentMelodies);
    }

    setAllAccepted(allAccepted);
  }

  function handleAcceptAll(accept) {
    const acceptedNew = accepted.map(() => accept);
    setAccepted(acceptedNew);
  }

  function handleValidAll(melody) {
    console.log('all', melody);
    const validMelodies = [];
    for (let i = 0; i < melodies.length; i += 1) {
      validMelodies.push(melody);
    }

    setValidMelodies(validMelodies);
  }

  function handleAccept(index, accept) {
    accepted[index] = accept;
    const newAccepted = [...accepted];
    setAccepted(newAccepted);
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
    console.log('Save all melodies', validMelodies);
    //onSave();
  }

  function handlePlayAll() {
    console.log('Play all');
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
        onValid={handleValidMelody}
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
        accepted={accepted[index]}
        index={index}
        key={index}
        label={`ESC ${index + 1}`}
        melody={melody}
        onAccept={handleAccept}
        onValid={handleValid}
      />
    )), [currentMelodies]
  );

  console.log(validMelodies);


  const melodyElement = useMemo(
    () => (
      <MelodyElementAll
        accepted={accepted[0]}
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
              onClick={handlePlayAll}
              type="button"
            >
              {t('common:melodyEditorPlayAll')}
            </button>}

          <button
            disabled={!allAccepted}
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
