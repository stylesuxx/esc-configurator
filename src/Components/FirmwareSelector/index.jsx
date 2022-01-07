import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useState, useEffect, useRef,
} from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import Checkbox from '../Input/Checkbox';
import MainCard from '../MainCard';

import {
  isValidLayout,
  getSupportedSources,
} from '../../utils/helpers/General';

import { blheliSource } from '../../sources';

import LabeledSelect from '../Input/LabeledSelect';

const blheliModes = blheliSource.getEeprom().MODES;

function FirmwareSelector({
  configs,
  esc,
  onCancel,
  onLocalSubmit,
  onSubmit,
  selectedMode,
  warning,
}) {
  const { t } = useTranslation('common');
  const {
    escs,
    versions,
    pwm,
  } = configs;

  const [escLayout, setEscLayout] = useState(null);
  const [mode, setMode] = useState(null);
  const [force, setForce] = useState(false);
  const [migrate, setMigrate] = useState(false);
  const [validFirmware, setValidFirmware] = useState([]);
  const [options, setOptions] = useState({
    versions: [],
    frequencies: [],
    firmwares: [],
    escs: [],
    modes: [],
  });
  const [selection, setSelection] = useState({
    firmware: null,
    version: null,
    url: null,
    pwm: null,
  });

  const file = useRef(null);

  // Pre select current firmware and ESC layout if valid
  useEffect(async () => {
    const availableFirmware = Object.keys(escs);
    const validSources = getSupportedSources(esc.meta.signature);
    const validFirmware = availableFirmware.filter((name) =>
      validSources.some((source) => source.name === name)
    );

    const currentFirmware = validFirmware.find((name) => esc.firmwareName === name);

    setSelection({
      ...selection,
      firmware: currentFirmware || validFirmware[0],
    });

    setValidFirmware(validFirmware);
    setMode(selectedMode);

    if(isValidLayout(esc.settings.LAYOUT)) {
      setEscLayout(esc.settings.LAYOUT);
    }
  }, []);

  // Update firmware options when firmware has changed
  useEffect(async () => {
    if(selection.firmware) {
      /**
       * Build the actual Option set for the selected firmware
       */
      const layouts = escs[selection.firmware];
      const escOptions = Object.entries(layouts).map(([key, layout]) => ({
        key: key,
        value: key,
        name: layout.name,
      }));

      const versionsSelected = versions[selection.firmware];
      const versionOptions = Object.values(versionsSelected).map((version) => ({
        key: version.key,
        value: version.url,
        name: version.name,
      }));

      const frequencies = pwm[selection.firmware];
      const frequencyOptions = frequencies.map((item) => ({
        key: item,
        value: item,
        name: item,
      }));

      const firmwareOptions = validFirmware.map((key) => ({
        key,
        value: key,
        name: key,
      }));

      const modeOptions = [];
      for (const mode in blheliModes) {
        modeOptions.push({
          key: mode,
          value: mode,
          name: mode,
        });
      }

      const currentOptions = {
        firmwares: firmwareOptions,
        versions: versionOptions,
        frequencies: frequencyOptions,
        escs: escOptions,
        modes: modeOptions,
      };

      setOptions(currentOptions);
    }
  }, [selection.firmware]);

  function clickFile() {
    file.current.click();
  }

  /*
  // TODO: Not yet implemented - this might only be needed for ATMEL
  function updateMode(e) {
    setMode(e.target.value);
  }
  */

  function handleFirmwareChange(e) {
    const firmware = e.target.value;

    setSelection({
      firmware,
      url: null,
      pwm: null,
    });
  }

  function handleEscChange(e) {
    setEscLayout(e.target.value);
  }

  function handleLocalSubmit(e) {
    e.preventDefault();
    onLocalSubmit(e, force, migrate);
  }

  function handleVersionChange(e) {
    const selected = e.target.value;

    setSelection({
      ...selection,
      url: e.target.value,
      version: selected ? selected : 'N/A',
    });
  }

  function handleForceChange(e) {
    setForce(e.target.checked);
  }

  function handleMigrateChange(e) {
    setMigrate(e.target.checked);
  }

  function handlePwmChange(e) {
    setSelection({
      ...selection,
      pwm: e.target.value,
    });
  }

  function handleSubmit() {
    const escsAll = escs[selection.firmware];

    const format = (str2Format, ...args) =>
      str2Format.replace(/(\{\d+\})/g, (a) => args[+(a.substr(1, a.length - 2)) || 0] );

    const name = escsAll[escLayout].fileName || escsAll[escLayout].name.replace(/[\s-]/g, '_').toUpperCase();
    const pwmSuffix = selection.pwm ? '_' + selection.pwm : '';
    const formattedUrl = format(
      selection.url,
      `${name}${pwmSuffix}`,
      mode
    );

    onSubmit(formattedUrl, escLayout, selection.firmware, selection.version, selection.pwm, force, migrate);
  }

  const disableFlashButton = !selection.url || (!selection.pwm && options.frequencies.length > 0);

  return (
    <Container>
      <MainCard
        title={`${t('selectTarget')}${esc.displayName ? ` (${esc.displayName})` : ''}`}
      >
        <Stack spacing={1}>
          <Grid
            container
            spacing={1}
          >
            <Grid
              item
              xs={6}
            >
              <LabeledSelect
                firstLabel={t('selectFirmware')}
                label={t('selectFirmware')}
                onChange={handleFirmwareChange}
                options={options.firmwares}
                selected={selection.firmware}
              />
            </Grid>

            {selection.firmware &&
              <>
                <Grid
                  item
                  xs={6}
                >
                  <LabeledSelect
                    firstLabel={t('selectEsc')}
                    label={t('selectEsc')}
                    onChange={handleEscChange}
                    options={options.escs}
                    selected={escLayout}
                  />
                </Grid>

                {/*
                {type === blheliTypes.SILABS || type === blheliTypes.ATMEL &&
                  <LabeledSelect
                    firstLabel={t('selectMode')}
                    label="Mode"
                    onChange={updateMode}
                    options={options.modes}
                    selected={mode}
                  />}
                */}

                <Grid
                  item
                  xs={6}
                >
                  <LabeledSelect
                    firstLabel={t('selectVersion')}
                    label={t('selectVersion')}
                    onChange={handleVersionChange}
                    options={options.versions}
                    selected={selection.url}
                  />
                </Grid>

                {options.frequencies.length > 0 &&
                  <Grid
                    item
                    xs={6}
                  >
                    <LabeledSelect
                      firstLabel={t('selectPwmFrequency')}
                      label={t('selectPwmFrequency')}
                      onChange={handlePwmChange}
                      options={options.frequencies}
                      selected={selection.pwm}
                    />
                  </Grid>}
              </>}
          </Grid>

          <Checkbox
            help={force ? t('forceFlashHint') : null}
            key='force'
            label={t('forceFlashText')}
            name='force'
            onChange={handleForceChange}
            type="checkbox"
            value={force ? 1 : 0}
          />

          <Checkbox
            help={migrate ? t('migrateFlashHint') : null}
            key='migrate'
            label={t('migrateFlashText')}
            name='migrate'
            onChange={handleMigrateChange}
            type="checkbox"
            value={migrate ? 1 : 0}
          />

          <Alert severity="warning">
            {t('migrationNote')}
          </Alert>

          {warning &&
            <Alert severity="error">
              <p
                dangerouslySetInnerHTML={{ __html: warning }}
              />
            </Alert>}

          <Button
            className={disableFlashButton ? "disabled" : ""}
            disabled={disableFlashButton}
            onClick={handleSubmit}
            variant="outlined"
          >
            {t('escButtonSelect')}
          </Button>

          <input
            onChange={handleLocalSubmit}
            ref={file}
            style={{ display: 'none' }}
            type="file"
          />

          <Button
            onClick={clickFile}
            variant="outlined"
          >
            {t('escButtonSelectLocally')}
          </Button>

          <Button
            onClick={onCancel}
            variant="outlined"
          >
            {t('buttonCancel')}
          </Button>
        </Stack>
      </MainCard>
    </Container>
  );
}
FirmwareSelector.defaultProps = {
  esc: {
    meta: {},
    settings: {},
  },
  selectedMode: null,
  warning: null,
};
FirmwareSelector.propTypes = {
  configs: PropTypes.shape({
    escs: PropTypes.shape().isRequired,
    versions: PropTypes.shape().isRequired,
    pwm: PropTypes.shape().isRequired,
  }).isRequired,
  esc: PropTypes.shape({
    displayName: PropTypes.string,
    firmwareName: PropTypes.string,
    meta: PropTypes.shape({ signature: PropTypes.string }),
    settings: PropTypes.shape({ LAYOUT: PropTypes.string }),
  }),
  onCancel: PropTypes.func.isRequired,
  onLocalSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedMode: PropTypes.string,
  warning: PropTypes.string,
};

export default FirmwareSelector;
