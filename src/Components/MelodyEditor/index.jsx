import PropTypes from 'prop-types';
import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import './style.scss';

import LabeledSelect from '../Input/LabeledSelect';
import Checkbox from '../Input/Checkbox';
import MelodyElement from './MelodyElement';

function SaveMelody({ onSave }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  function updateName(e) {
    const name = e.target.value;
    setName(name);
  }

  function handleSave() {
    onSave(name);
  }

  return (
    <div className="save-melody-wrapper">
      <input
        name="save-melody-name"
        onChange={updateName}
        placeholder={t('common:melodyEditorName')}
        type="text"
        value={name}
      />

      <div className="default-btn">

        <button
          disabled={name === ''}
          onClick={handleSave}
          type="button"
        >
          {t('common:melodyEditorSave')}
        </button>
      </div>
    </div>
  );
}
SaveMelody.propTypes = { onSave: PropTypes.func.isRequired };

function PresetSelect({
  escs,
  onUpdateMelodies,
  customMelodies,
  defaultMelodies,
}) {
  const { t } = useTranslation('common');

  const [selectedPreset, setSelectedPreset] = useState(-1);


  function handleUpdate(e) {
    const value = e.target.value;
    const selected = JSON.parse(value);

    setSelectedPreset(value);
    onUpdateMelodies(selected);
  }

  const defaultPossibilities = defaultMelodies.filter((item) => item.tracks.length <= escs );
  const defaultOptions = defaultPossibilities.map((melody) => {
    if(melody.tracks.length <= escs) {
      return {
        key: melody.name,
        name: melody.name,
        value: JSON.stringify(melody.tracks),
      };
    }
  });

  const customPossibilities = customMelodies.filter((item) => item.tracks.length <= escs );
  const customOptions = customPossibilities.map((melody) => {
    if(melody.tracks.length <= escs) {
      return {
        key: melody.name,
        name: melody.name,
        value: JSON.stringify(melody.tracks),
      };
    }
  });

  const options = [
    ...defaultOptions,
    {
      key: 'spacer',
      name: t('melodyEditorCustom'),
      disabled: true,
    },
    ...customOptions,
  ];

  return(
    <LabeledSelect
      firstLabel={t('melodyPresetsLabel')}
      onChange={handleUpdate}
      options={options}
      selected={selectedPreset}
    />
  );
}
PresetSelect.propTypes = {
  customMelodies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  defaultMelodies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  escs: PropTypes.number.isRequired,
  onUpdateMelodies: PropTypes.func.isRequired,
};

function MelodyEditor({
  dummy,
  melodies,
  onClose,
  onSave,
  onWrite,
  customMelodies,
  defaultMelodies,
  writing,
}) {
  const { t } = useTranslation();

  const defaultAccepted = melodies.map(() => null);
  const references = melodies.map(() => useRef());
  const uniqueMelodies = [...new Set(melodies)];
  const [allAccepted, setAllAccepted] = useState(false);
  const [sync, setSync] = useState(uniqueMelodies.length <= 1);
  const [currentMelodies, setCurrentMelodies] = useState(melodies);
  const [acceptedMelodies, setAcceptedMelodies] = useState(defaultAccepted);
  const [isAnyPlaying, setIsAnyPlaying] = useState(false);
  const latestMelodies = useRef(melodies);
  const totalPlaying = useRef(0);
  const audioContext = useRef(0);

  useEffect(() => {
    checkAcceptedAll();
  }, [acceptedMelodies]);

  function handleClose() {
    if(!isAnyPlaying) {
      onClose();
    }
  }

  function checkAcceptedAll() {
    let allAccepted = true;
    for(let i = 0; i < acceptedMelodies.length; i += 1) {
      if(!acceptedMelodies[i]) {
        allAccepted = false;
        break;
      }
    }

    setAllAccepted(allAccepted);
  }

  function handleAcceptAll(accept) {
    const acceptedMelodiesNew = acceptedMelodies.map(() => accept);
    setAcceptedMelodies(acceptedMelodiesNew);
  }

  function handleAccept(index, accept) {
    acceptedMelodies[index] = accept;
    setAcceptedMelodies([...acceptedMelodies]);
  }

  function handleChildClick(e) {
    e.stopPropagation();
  }

  function handleSave() {
    setCurrentMelodies([...acceptedMelodies]);
    onWrite(acceptedMelodies);
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
      child.current.play(audioContext.current, 1 / references.length);
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
    setSync(!sync);
  }

  function handleMelodiesSave(name) {
    onSave(name, latestMelodies.current);
  }

  function handleMelodiesSelected(selected) {
    const newMelodies = [];
    let currentTrack = 0;
    while(newMelodies.length < melodies.length) {
      newMelodies[currentTrack] = selected[currentTrack % selected.length];
      currentTrack += 1;
    }

    setSync(selected.length === 1);
    setCurrentMelodies(newMelodies);
  }

  function handleMelodiesUpdate(index, melody) {
    latestMelodies.current[index] = melody;
  }

  function handleMelodiesUpdateAll(melody) {
    for(let i = 0; i < melodies.length; i += 1) {
      latestMelodies.current[i] = melody;
    }
  }

  const melodyElements = currentMelodies.map((melody, index) => {
    function handleAcceptMelody(accept) {
      handleAccept(index, accept);
    }

    function handleUpdate(melody) {
      handleMelodiesUpdate(index, melody);
    }

    return (
      <MelodyElement
        accepted={acceptedMelodies[index] ? true : false}
        disabled={writing}
        dummy={dummy}
        key={index}
        label={`ESC ${index + 1}`}
        melody={melody}
        onAccept={handleAcceptMelody}
        onPlay={handlePlay}
        onStop={handleStop}
        onUpdate={handleUpdate}
        ref={references[index]}
      />
    );
  });

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
            disabled={isAnyPlaying || writing}
            hint={t("common:syncMelodiesHint")}
            label={t("common:syncMelodies")}
            name="syncMelodies"
            onChange={toggleSync}
            value={sync ? 1 : 0}
          />
        </div>

        <PresetSelect
          customMelodies={customMelodies}
          defaultMelodies={defaultMelodies}
          escs={melodies.length}
          onUpdateMelodies={handleMelodiesSelected}
        />

        <SaveMelody
          onSave={handleMelodiesSave}
        />

        <div className={`melody-editor-escs ${sync ? 'all' : ''}`}>
          {!sync && melodyElements}

          {sync &&
            <MelodyElement
              accepted={acceptedMelodies[0] ? true : false}
              disabled={writing}
              dummy={dummy}
              label={t("common:allEscs")}
              melody={currentMelodies[0]}
              onAccept={handleAcceptAll}
              onPlay={handlePlay}
              onStop={handleStop}
              onUpdate={handleMelodiesUpdateAll}
            />}
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

          { !dummy &&
            <button
              disabled={!allAccepted || isAnyPlaying || writing}
              onClick={handleSave}
              type="button"
            >
              {t('common:melodyEditorWrite')}
            </button>}
        </div>
      </div>
    </div>
  );
}

MelodyEditor.propTypes = {
  customMelodies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  defaultMelodies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  dummy: PropTypes.bool.isRequired,
  melodies: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onWrite: PropTypes.func.isRequired,
  writing: PropTypes.bool.isRequired,
};

export default MelodyEditor;
