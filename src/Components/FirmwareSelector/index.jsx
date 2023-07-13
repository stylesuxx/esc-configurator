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
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import {
  isValidLayout,
  getSupportedSources,
  getPwm,
} from '../../utils/helpers/General';
import { blheliAtmelSource as blheliSource } from '../../sources';
import sources from '../../sources';
import LabeledSelect from '../Input/LabeledSelect';

import {
  selectEscs,
  selectVersions,
} from '../../Containers/App/configsSlice';
import { selectSettingsObject } from '../AppSettings/settingsSlice';
import { setSelecting } from '../../Containers/App/stateSlice';
import { setTargets } from '../../Containers/App/escsSlice';

import './style.scss';

const blheliModes = blheliSource.getEeprom().MODES;

function FirmwareSelector({
  esc,
  onLocalSubmit,
  onSubmit,
  selectedMode,
  warning,
}) {
  const { t } = useTranslation('common');

  const dispatch = useDispatch();

  const settings = useSelector(selectSettingsObject);

  const escs = useSelector(selectEscs);
  const versions = useSelector(selectVersions);

  const [preselected, setPreselected] = useState(false);
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

  const [layoutSelectionDisabled, setLayoutSelectionDisabled] = useState(false);

  const file = useRef(null);

  // Pre select current firmware and ESC layout if valid
  async function preselect() {
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
  }

  if(!preselected) {
    setPreselected(true);
    preselect();
  }

  useEffect(() => {
    /**
     * If layout selection is disabled, automatically set the 1st layout to be
     * selected.
     */
    if(layoutSelectionDisabled) {
      setEscLayout(options.escs[0].name);
      setPreselected(true);
    }
  }, [options, layoutSelectionDisabled]);

  // Update firmware options when firmware has changed
  useEffect(() => {
    async function updateOptions() {
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

        const versionsSelected = Object.values(
          versions[selection.firmware].filter((v) => settings.unstableVersions || !v.prerelease)
        );

        const versionOptions = versionsSelected.map((version) => ({
          key: version.key,
          value: version.url,
          name: version.name,
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

        const source = sources.find((s) => s.getName() === selection.firmware);
        const layoutSelectionDisabled = source.getDisabledLayoutSelection(esc);

        const currentOptions = {
          firmwares: firmwareOptions,
          versions: versionOptions,
          frequencies: [],
          escs: layoutSelectionDisabled ? [{
            key: 0,
            value: 0,
            name: esc.settings.NAME,
          }] : escOptions,
          modes: modeOptions,
        };

        setOptions(currentOptions);
        setLayoutSelectionDisabled(layoutSelectionDisabled);
      }
    }

    updateOptions();
  }, [selection.firmware, escs, settings, validFirmware, versions, esc]);

  const clickFile = useCallback(() => {
    file.current.click();
  }, [file]);

  const handleCancel = useCallback(() => {
    dispatch(setSelecting(false));
    dispatch(setTargets([]));
  }, [dispatch]);

  const handleFirmwareChange = useCallback((e) => {
    const firmware = e.target.value;

    setSelection({
      firmware,
      url: null,
      pwm: null,
    });
  }, []);

  const handleEscChange = useCallback((e) => {
    setEscLayout(e.target.value);
  }, [setEscLayout]);

  const handleLocalSubmit = useCallback((e) => {
    e.preventDefault();
    onLocalSubmit(e, force, migrate);
  }, [onLocalSubmit, force, migrate]);

  const handleVersionChange = useCallback((e) => {
    const selected = e.target.options.selectedIndex;
    const selectedOption = e.target.options[selected];

    const firmwareName = selection.firmware;
    const firmwareVersion = options.versions[selected - 1].key;

    const frequencies = getPwm(firmwareName, firmwareVersion);
    const frequencyOptions = frequencies.map((item) => ({
      key: item,
      value: item,
      name: item,
    }));

    setOptions({
      ...options,
      frequencies: frequencyOptions,
    });

    setSelection({
      ...selection,
      url: e.target.value,
      version: selectedOption && options.versions[selected - 1].key,
    });
  }, [options, selection]);

  const handleForceChange = useCallback((e) => {
    setForce(e.target.checked);
  }, [setForce]);

  const handleMigrateChange = useCallback((e) => {
    setMigrate(e.target.checked);
  }, [setMigrate]);

  const handlePwmChange = useCallback((e) => {
    setSelection({
      ...selection,
      pwm: e.target.value,
    });
  }, [selection]);

  const handleSubmit = useCallback(() => {
    const source = sources.find((s) => s.getName() === selection.firmware);
    const firmwareUrl = source.getFirmwareUrl({
      escKey: escLayout,
      mode: mode,
      pwm: selection.pwm,
      settings: esc.settings,
      url: selection.url,
      version: selection.version,
      esc: esc,
    });

    onSubmit(firmwareUrl, escLayout, selection.firmware, selection.version, selection.pwm, force, migrate);
  }, [esc, escLayout, selection, mode, force, migrate, onSubmit]);

  const disableFlashButton = !selection.url || (!selection.pwm && options.frequencies.length > 0);

  return (
    <div id="firmware-selector">
      <div className="center-wrapper">
        <div className="checkbox force">
          <label>
            <input
              defaultChecked={force}
              onChange={handleForceChange}
              type="checkbox"
            />

            <span>
              <span>
                {t('forceFlashText')}
              </span>

              <span className={force ? "red" : "hidden"}>
                {t('forceFlashHint')}
              </span>
            </span>
          </label>
        </div>

        <div className="checkbox migrate">
          <label>
            <input
              defaultChecked={migrate}
              onChange={handleMigrateChange}
              type="checkbox"
            />

            <span>
              <span>
                {t('migrateFlashText')}
              </span>

              <span className={migrate ? "red" : "hidden"}>
                {t('migrateFlashHint')}
              </span>
            </span>
          </label>
        </div>

        <div className="note">
          <p>
            <b>
              { t('note') }
            </b>

            <span>
              { t('migrationNote') }
            </span>
          </p>
        </div>

        {warning &&
          <div className="note alert">
            {warning}
          </div>}

        <div className="gui-box grey">
          <div className="gui-box-titlebar">
            <div className="spacer-box-title">
              {`${t('selectTarget')}${esc.displayName ? ` (${esc.displayName})` : ''}`}
            </div>
          </div>

          <div className="spacer-box">
            <LabeledSelect
              firstLabel={t('selectFirmware')}
              label="Firmware"
              onChange={handleFirmwareChange}
              options={options.firmwares}
              selected={selection.firmware}
            />

            {selection.firmware &&
              <>
                <LabeledSelect
                  disabled={layoutSelectionDisabled}
                  firstLabel={t('selectEsc')}
                  label="ESC"
                  onChange={handleEscChange}
                  options={options.escs}
                  selected={escLayout}
                />

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

                <LabeledSelect
                  firstLabel={t('selectVersion')}
                  label="Version"
                  onChange={handleVersionChange}
                  options={options.versions}
                  selected={selection.url}
                />

                {options.frequencies.length > 0 &&
                  <LabeledSelect
                    firstLabel={t('selectPwmFrequency')}
                    label="PWM Frequency"
                    onChange={handlePwmChange}
                    options={options.frequencies}
                    selected={selection.pwm}
                  />}
              </>}

            <div className="default-btn">
              <button
                className={disableFlashButton ? "disabled" : ""}
                disabled={disableFlashButton}
                onClick={handleSubmit}
                type="button"
              >
                {t('escButtonSelect')}
              </button>
            </div>

            <div className="default-btn">
              <input
                data-testid="input-file"
                onChange={handleLocalSubmit}
                ref={file}
                style={{ display: 'none' }}
                type="file"
              />

              <button
                onClick={clickFile}
                type="button"
              >
                {t('escButtonSelectLocally')}
              </button>
            </div>

            <div className="default-btn">
              <button
                onClick={handleCancel}
                type="button"
              >
                {t('buttonCancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

FirmwareSelector.defaultProps = {
  esc: {
    displayName: 'UNKNOWN',
    firmwareName: 'UNKNOWN',
    meta: {},
    settings: {},
  },
  selectedMode: null,
  warning: null,
};
FirmwareSelector.propTypes = {
  esc: PropTypes.shape({
    displayName: PropTypes.string,
    firmwareName: PropTypes.string,
    meta: PropTypes.shape({ signature: PropTypes.number }),
    settings: PropTypes.shape({
      LAYOUT: PropTypes.string,
      NAME: PropTypes.string,
    }),
  }),
  onLocalSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedMode: PropTypes.string,
  warning: PropTypes.node,
};

export default FirmwareSelector;
