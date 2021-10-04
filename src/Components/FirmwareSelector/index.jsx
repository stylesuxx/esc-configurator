import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useState, useEffect, useRef,
} from 'react';

import {
  isValidLayout,
  getSupportedSources,
} from '../../utils/helpers/General';

import { blheliSource } from '../../sources';

import LabeledSelect from '../Input/LabeledSelect';

import './style.scss';

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

    const newSelection = {
      ...selection,
      firmware: currentFirmware || validFirmware[0],
    };
    setSelection(newSelection);

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

    const newSelection = {
      firmware,
      url: null,
      pwm: null,
    };

    setSelection(newSelection);
  }

  function handleEscChange(e) {
    setEscLayout(e.target.value);
  }

  function handleLocalSubmit(e) {
    e.preventDefault();
    onLocalSubmit(e, force, migrate);
  }

  function handleVersionChange(e) {
    const selected = e.target.options.selectedIndex;
    const selecteOption = e.target.options[selected];

    const newSelection = {
      ...selection,
      url: e.target.value,
      version: selecteOption ? selecteOption.text : 'N/A',
    };
    setSelection(newSelection);
  }

  function handleForceChange(e) {
    setForce(e.target.checked);
  }

  function handleMigrateChange(e) {
    setMigrate(e.target.checked);
  }

  function handlePwmChange(e) {
    const newSelection = {
      ...selection,
      pwm: e.target.value,
    };
    setSelection(newSelection);
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
          <p
            dangerouslySetInnerHTML={{ __html: t('migrationNote') }}
          />
        </div>

        {warning &&
          <div className="note alert">
            <p
              dangerouslySetInnerHTML={{ __html: warning }}
            />
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
                onClick={onCancel}
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
