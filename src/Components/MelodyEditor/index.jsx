import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Checkbox from '../Input/Checkbox';
import LabeledSelect from '../Input/LabeledSelect';
import MelodyElement from './MelodyElement';
import Overlay from '../Overlay';

import {
  del,
  hide,
  save,
  selectCurrent,
  selectCustom,
  selectDefault,
  selectDummy,
} from './melodiesSlice';
import { selectIsWriting } from '../../Containers/App/stateSlice';

import './style.scss';

function SaveMelody({ onSave }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const updateName = useCallback((e) => {
    const name = e.target.value;
    setName(name);
  }, []);

  const handleSave = useCallback(() => {
    onSave(name);
  }, [name, onSave]);

  return (
    <div className="save-melody-wrapper">
      <input
        data-testid="save-melody-input"
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
  onDelete,
  onUpdateMelodies,
  customMelodies,
  defaultMelodies,
  selected,
}) {
  const { t } = useTranslation('common');

  const [selectedPreset, setSelectedPreset] = useState(selected);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    setSelectedPreset(selected);
  }, [selected]);

  useEffect(() => {
    let canDelete = false;
    const match = customMelodies.find((item) => item.name === selectedPreset);
    if(match) {
      canDelete = true;
    }

    setCanDelete(canDelete);
  }, [selectedPreset, customMelodies]);

  const handleUpdate = useCallback((e) => {
    const value = e.target.value;
    let selected = [];
    let match = null;
    if(value.startsWith('preset-')) {
      const name = value.split('preset-')[1];
      match = defaultMelodies.find((item) => item.name === name);
    } else {
      match = customMelodies.find((item) => item.name === value);
    }

    selected = match.tracks;

    setSelectedPreset(e.target.value);
    onUpdateMelodies(selected);
  }, [defaultMelodies, customMelodies, onUpdateMelodies]);

  const handleDelete = useCallback(() => {
    setSelectedPreset(defaultMelodies[0].name);
    onUpdateMelodies(defaultMelodies[0].tracks);

    onDelete(selectedPreset);
  }, [onUpdateMelodies, defaultMelodies, onDelete, selectedPreset]);

  const defaultPossibilities = defaultMelodies.filter((item) => item.tracks.length <= escs );
  const defaultOptions = defaultPossibilities.map((item) => ({
    key: `preset-${item.name}`,
    name: item.name,
    value: `preset-${item.name}`,
  }));

  const customPossibilities = customMelodies.filter((item) => item.tracks.length <= escs );
  const customOptions = customPossibilities.map((item) => ({
    key: item.name,
    name: item.name,
    value: item.name,
  }));

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
    <div className="melody-selection-wrapper">
      <LabeledSelect
        firstLabel={t('melodyPresetsLabel')}
        onChange={handleUpdate}
        options={options}
        selected={selectedPreset}
      />

      <div className="default-btn">
        <button
          disabled={!canDelete}
          onClick={handleDelete}
          type="button"
        >
          {t('melodyDelete')}
        </button>
      </div>
    </div>
  );
}
PresetSelect.defaultProps = { selected: -1 };
PresetSelect.propTypes = {
  customMelodies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  defaultMelodies: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    tracks: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  escs: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdateMelodies: PropTypes.func.isRequired,
  selected: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

function IndexedMelodyElement ({
  accepted,
  disabled,
  dummy,
  index,
  label,
  melody,
  onAccept,
  onAddRef,
  onPlay,
  onStop,
  onUpdate,
}) {
  const handleAcceptMelody = useCallback((accept) => {
    onAccept(index, accept);
  }, [index, onAccept]);

  const handleUpdate = useCallback((melody) => {
    onUpdate(index, melody);
  }, [index, onUpdate]);

  const handleAddRef = useCallback((ref) => {
    onAddRef(index, ref);
  }, [index, onAddRef]);

  return (
    <MelodyElement
      accepted={accepted}
      disabled={disabled}
      dummy={dummy}
      label={label}
      melody={melody}
      onAccept={handleAcceptMelody}
      onPlay={onPlay}
      onStop={onStop}
      onUpdate={handleUpdate}
      ref={handleAddRef}
    />
  );
}

IndexedMelodyElement.propTypes = {
  accepted: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  dummy: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  melody: PropTypes.string.isRequired,
  onAccept: PropTypes.func.isRequired,
  onAddRef: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

function MelodyEditor({ onWrite }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const writing = useSelector(selectIsWriting);
  const defaultMelodies = useSelector(selectDefault);
  const customMelodies = useSelector(selectCustom);
  const dummy = useSelector(selectDummy);
  const melodies = useSelector(selectCurrent);
  const melodiesRef = [...melodies];

  const defaultAccepted = melodies.map(() => null);
  const melodyElementReferences = useRef({});
  const uniqueMelodies = [...new Set(melodies)];
  const [allAccepted, setAllAccepted] = useState(false);
  const [sync, setSync] = useState(uniqueMelodies.length <= 1);
  const [currentMelodies, setCurrentMelodies] = useState(melodies);
  const [acceptedMelodies, setAcceptedMelodies] = useState(defaultAccepted);
  const [isAnyPlaying, setIsAnyPlaying] = useState(false);
  const latestMelodies = useRef(melodiesRef);
  const selectedMelody = useRef(-1);
  const totalPlaying = useRef(0);
  const audioContext = useRef(0);

  const checkAcceptedAll = useCallback(() => {
    let allAccepted = true;
    for(let i = 0; i < acceptedMelodies.length; i += 1) {
      if(!acceptedMelodies[i]) {
        allAccepted = false;
        break;
      }
    }

    setAllAccepted(allAccepted);
  }, [acceptedMelodies]);

  useEffect(() => {
    checkAcceptedAll();
  }, [acceptedMelodies, checkAcceptedAll]);

  const handleClose = useCallback(() => {
    if(!isAnyPlaying) {
      dispatch(hide());
    }
  }, [isAnyPlaying, dispatch]);

  const handleAcceptAll = useCallback((accept) => {
    const acceptedMelodiesNew = acceptedMelodies.map(() => accept);
    setAcceptedMelodies(acceptedMelodiesNew);
  }, [acceptedMelodies]);

  const handleAccept = useCallback((index, accept) => {
    acceptedMelodies[index] = accept;
    setAcceptedMelodies([...acceptedMelodies]);
  }, [acceptedMelodies]);

  const handleSave = useCallback(() => {
    setCurrentMelodies([...acceptedMelodies]);
    onWrite(acceptedMelodies);
  }, [acceptedMelodies, onWrite]);

  const handlePlay = useCallback(() => {
    totalPlaying.current += 1;
    setIsAnyPlaying(true);
  }, [totalPlaying]);

  const handleStop = useCallback(() => {
    totalPlaying.current -= 1;
    if(totalPlaying.current === 0) {
      setIsAnyPlaying(false);
      if(audioContext.current) {
        audioContext.current.close();
        audioContext.current = null;
      }
    }
  }, [totalPlaying, audioContext]);

  const handlePlayAll = useCallback(() => {
    setIsAnyPlaying(true);

    audioContext.current = new window.AudioContext();
    const length = Object.keys(melodyElementReferences.current).length;
    for(let i = 0; i < length; i += 1) {
      const child = melodyElementReferences.current[i];
      child.play(audioContext.current, 1 / length);
    }
  }, [audioContext, melodyElementReferences]);

  /* istanbul ignore next */
  const handleStopAll = useCallback(() => {
    const length = Object.keys(melodyElementReferences.current).length;
    for(let i = 0; i < length; i += 1) {
      const child = melodyElementReferences.current[i];
      child.stop();
    }
  }, [melodyElementReferences]);

  const toggleSync = useCallback(() => {
    handleAcceptAll(false);
    setSync(!sync);
  }, [sync, handleAcceptAll]);

  const handleMelodiesSave = useCallback((name) => {
    selectedMelody.current = name;
    const tracks = [...new Set(latestMelodies.current)];

    dispatch(save({
      name,
      tracks,
    }));
  }, [dispatch, selectedMelody, latestMelodies]);

  const handleDelete = useCallback((name) => {
    dispatch(del(name));
  }, [dispatch]);

  const handleMelodiesSelected = useCallback((selected) => {
    const newMelodies = [];
    let currentTrack = 0;
    while(newMelodies.length < melodies.length) {
      newMelodies[currentTrack] = selected[currentTrack % selected.length];
      currentTrack += 1;
    }

    setSync(selected.length === 1);
    setCurrentMelodies(newMelodies);
  }, [melodies]);

  const handleMelodiesUpdate = useCallback((index, melody) => {
    latestMelodies.current[index] = melody;
  }, [latestMelodies]);

  const handleMelodiesUpdateAll = useCallback((melody) => {
    for(let i = 0; i < melodies.length; i += 1) {
      latestMelodies.current[i] = melody;
    }
  }, [melodies, latestMelodies]);

  const handleAddRef = useCallback((index, ref) => {
    melodyElementReferences.current[index] = ref;
  }, [melodyElementReferences]);

  const melodyElements = currentMelodies.map((melody, index) => (
    <IndexedMelodyElement
      accepted={acceptedMelodies[index] ? true : false}
      disabled={writing}
      dummy={dummy}
      index={index}
      key={index}
      label={`ESC ${index + 1}`}
      melody={melody}
      onAccept={handleAccept}
      onAddRef={handleAddRef}
      onPlay={handlePlay}
      onStop={handleStop}
      onUpdate={handleMelodiesUpdate}
    />
  ));

  return (
    <div id="melody-editor">
      <Overlay
        headline={t('common:melodyEditorHeader')}
        onClose={handleClose}
      >
        <div className="line-wrapper">
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
            onDelete={handleDelete}
            onUpdateMelodies={handleMelodiesSelected}
            selected={selectedMelody.current}
          />
        </div>

        <SaveMelody
          onSave={handleMelodiesSave}
        />

        <div className={`melody-editor-escs ${sync ? 'all' : 'single'}`}>
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
      </Overlay>
    </div>
  );
}

MelodyEditor.propTypes = { onWrite: PropTypes.func.isRequired };

export default MelodyEditor;
