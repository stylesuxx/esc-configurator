import PropTypes from 'prop-types';
import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';

import Checkbox from '../Input/Checkbox';
import LabeledSelect from '../Input/LabeledSelect';
import MelodyElement from './MelodyElement';
import Overlay from '../Overlay';

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
    <Grid
      alignItems="end"
      container
      spacing={2}
    >
      <Grid
        item
        xs={4}
      >
        <Input
          aria-label="save-melody"
          data-testid="save-melody-input"
          fullWidth
          name="save-melody-name"
          onChange={updateName}
          placeholder={t('common:melodyEditorName')}
          value={name}
        />
      </Grid>

      <Grid
        item
        xs={2}
      >
        <Button
          disabled={name === ''}
          fullWidth
          onClick={handleSave}
          variant="outlined"
        >
          {t('common:melodyEditorSave')}
        </Button>
      </Grid>
    </Grid>
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

    let match = null;
    if(value.startsWith('preset-')) {
      const name = value.split('preset-')[1];
      match = defaultMelodies.find((item) => item.name === name);
    } else {
      match = customMelodies.find((item) => item.name === value);
    }

    setSelectedPreset(e.target.value);
    onUpdateMelodies(match.tracks);
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
    <Grid
      alignItems="end"
      container
      spacing={2}
    >
      <Grid
        item
        xs={4}
      >
        <LabeledSelect
          firstLabel={t('melodyPresetsLabel')}
          onChange={handleUpdate}
          options={options}
          selected={selectedPreset}
        />
      </Grid>

      <Grid
        item
        xs={2}
      >
        <Button
          disabled={!canDelete}
          fullWidth
          onClick={handleDelete}
          variant="outlined"
        >
          {t('melodyDelete')}
        </Button>
      </Grid>
    </Grid>
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

function MelodyEditor({
  dummy,
  melodies,
  onClose,
  onDelete,
  onSave,
  onWrite,
  open,
  customMelodies,
  defaultMelodies,
  writing,
}) {
  const { t } = useTranslation();

  const defaultAccepted = melodies.map(() => null);
  const melodyElementReferences = useRef({});
  const uniqueMelodies = [...new Set(melodies)];
  const [allAccepted, setAllAccepted] = useState(false);
  const [sync, setSync] = useState(uniqueMelodies.length <= 1);
  const [currentMelodies, setCurrentMelodies] = useState(melodies);
  const [acceptedMelodies, setAcceptedMelodies] = useState(defaultAccepted);
  const [isAnyPlaying, setIsAnyPlaying] = useState(false);
  const latestMelodies = useRef(melodies);
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
      onClose();
    }
  }, [isAnyPlaying, onClose]);

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
    const unique = [...new Set(latestMelodies.current)];
    onSave(name, unique);
  }, [selectedMelody, latestMelodies, onSave]);

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
    <Grid
      item
      key={index}
      md={6}
      xs={12}
    >
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
    </Grid>
  ));

  return (
    <Overlay
      headline={t('common:melodyEditorHeader')}
      maxWidth='xl'
      onClose={handleClose}
      open={open}
    >
      <div id="melody-editor">
        <Stack spacing={1}>
          <Checkbox
            disabled={isAnyPlaying || writing}
            hint={t("common:syncMelodiesHint")}
            label={t("common:syncMelodies")}
            name="syncMelodies"
            onChange={toggleSync}
            value={sync ? 1 : 0}
          />

          <div>
            <PresetSelect
              customMelodies={customMelodies}
              defaultMelodies={defaultMelodies}
              escs={melodies.length}
              onDelete={onDelete}
              onUpdateMelodies={handleMelodiesSelected}
              selected={selectedMelody.current}
            />
          </div>

          <div>
            <SaveMelody onSave={handleMelodiesSave} />
          </div>

          <br />

          <div className={`melody-editor-escs ${sync ? 'all' : 'single'}`}>
            {!sync &&
              <Grid
                container
                spacing={2}
              >
                {melodyElements}
              </Grid>}

            {sync &&
              <Grid
                item
                md={12}
                xs={12}
              >
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
                />
              </Grid>}
          </div>

          <Grid
            container
            justifyContent="end"
          >
            <ButtonGroup>
              { !sync &&
                <Button
                  disabled={writing}
                  onClick={isAnyPlaying ? handleStopAll : handlePlayAll}
                  variant='outlined'
                >
                  {isAnyPlaying ? t('common:melodyEditorStopAll') : t('common:melodyEditorPlayAll')}
                </Button>}

              { !dummy &&
                <Button
                  disabled={!allAccepted || isAnyPlaying || writing}
                  onClick={handleSave}
                  variant='outlined'
                >
                  {t('common:melodyEditorWrite')}
                </Button>}
            </ButtonGroup>
          </Grid>
        </Stack>
      </div>
    </Overlay>
  );
}

MelodyEditor.propTypes = {
  customMelodies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  defaultMelodies: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  dummy: PropTypes.bool.isRequired,
  melodies: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onWrite: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  writing: PropTypes.bool.isRequired,
};

export default MelodyEditor;
