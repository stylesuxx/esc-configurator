import PropTypes from 'prop-types';
import React, {
  useState, useEffect, useRef,
} from 'react';
import {
  useTranslation,
} from 'react-i18next';

import {
  isValidLayout,
  getPossibleTypes,
} from '../../utils/helpers/General';

import LabeledSelect from '../LabeledSelect';

import {
  BLHELI_TYPES,
  BLHELI_MODES,
} from '../../sources/Blheli/eeprom';

import {
  EEPROM as BLUEJAY_EEPROM
} from '../../sources/Bluejay';
const BLUEJAY_TYPES = BLUEJAY_EEPROM.TYPES;

import {
  PLATFORMS,
  SILABS_TYPES,
  ARM_TYPES,
} from '../../sources';

import './style.scss';

function FirmwareSelector({
  onCancel,
  escHint,
  signatureHint,
  selectedMode,
  onSubmit,
  onLocalSubmit,
  configs,
}) {
  const { t } = useTranslation('common');
  const {
    escs,
    versions,
    pwm,
    platforms,
  } = configs;
  const file = useRef(null);

  const [esc, setEsc] = useState(null);
  const [type, setType] = useState(null);
  const [mode, setMode] = useState(selectedMode);
  const [force, setForce] = useState(false);
  const [migrate, setMigrate] = useState(true);
  const [validFirmware, setValidFirmware] = useState([]);
  const [possibleTypes, setPossibleTypes] = useState([]);
  const [options, setOptions] = useState({
    versions: [],
    frequencies: [],
    firmwares: [],
    escs: [],
    modes: [],
  });

  const [selection, setSelection] = useState({
    firmware: null,
    url: null,
    pwm: null,
  });

  // Pre select ESC if escHint is a valid layout
  useEffect(async () => {
    const availableFirmware = Object.keys(escs);
    const siLabsFirmwares = availableFirmware.filter((name) => platforms[name] === PLATFORMS.SILABS);
    const armFirmwares = availableFirmware.filter((name) => platforms[name] === PLATFORMS.ARM);

    const types = getPossibleTypes(signatureHint);
    const siLabs = types.filter((value) => SILABS_TYPES.includes(value));
    const arm = types.filter((value) => ARM_TYPES.includes(value));

    const validFirmware = availableFirmware.filter((key) => {
      if((siLabs.length > 0 && siLabsFirmwares.includes(key)) ||
         (arm.length > 0 && armFirmwares.includes(key))
      ) {
        return true;
      }

      return false;
    });

    const newSelection = Object.assign({}, selection, { firmware: validFirmware[0] });
    setSelection(newSelection);

    setValidFirmware(validFirmware);
    setPossibleTypes(types);

    if(isValidLayout(escHint)) {
      setEsc(escHint);
    }
  }, []);

  // Update firmware options when firmware has changed
  useEffect(async () => {
    if(selection.firmware) {
      /**
       * If only one type has been returned, that is our selection, in the other
       * case, we need to set the type based on the selected firmware.
       */
      let newType = null;
      if(possibleTypes.length === 1) {
        newType = possibleTypes[0];
      } else {
        switch(selection.firmware) {
          case 'Bluejay': {
            newType = BLUEJAY_TYPES.EFM8;
          } break;

          default: {
            newType = BLHELI_TYPES.BLHELI_S_SILABS;
          }
        }
      }

      /**
       * Build the actual Option set for the selected firmware
       */
      const descriptions = escs[selection.firmware].layouts[newType];
      const escOptions = [];
      for (const layout in descriptions) {
        const esc = descriptions[layout];

        escOptions.push({
          key: layout,
          value: layout,
          name: esc.name,
        });
      }

      const versionOptions = [];
      const versionsSelected = versions[selection.firmware][newType];
      for (const version in versionsSelected) {
        const current = versionsSelected[version];
        const url = current.url;

        versionOptions.push({
          key: current.key,
          value: url,
          name: current.name
        });
      }

      const frequencies = pwm[selection.firmware];
      const frequencyOptions = frequencies.map((item) => (
        {
          key: item,
          value: item,
          name: item,
        }
      ));

      const firmwareOptions = validFirmware.map((key) => (
        {
          key,
          value: key,
          name: key,
        }
      ));

      const modeOptions = [];
      for (const mode in BLHELI_MODES) {
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
      setType(newType);
    }
  }, [selection.firmware]);

  function updateFirmware(e) {
    const firmware = e.target.value;

    const newSelection = {
      firmware,
      url: null,
      pwm: null,
    };

    setSelection(newSelection);
  }

  function updateEsc(e) {
    setEsc(e.target.value);
  }

  function clickFile() {
    file.current.click();
  }

  function submitLocalFile(e) {
    e.preventDefault();
    onLocalSubmit(e, force, migrate);
  }

  function updateMode(e) {
    setMode(e.target.value);
  }

  function updateVersion(e) {
    const newSelection = Object.assign({}, selection, { url: e.target.value });
    setSelection(newSelection);
  }

  function updateForce(e) {
    setForce(e.target.checked);
  }

  function updateMigrate(e) {
    setMigrate(e.target.checked);
  }

  function updatePwm(e) {
    const newSelection = Object.assign({}, selection, { pwm: e.target.value });
    setSelection(newSelection);
  }

  function submit() {
    const escsAll = escs[selection.firmware].layouts[type];

    const format = (str2Format, ...args) =>
      str2Format.replace(/(\{\d+\})/g, (a) => args[+(a.substr(1, a.length - 2)) || 0] );

    const name = escsAll[esc].fileName ? escsAll[esc].fileName : escsAll[esc].name.replace(/[\s-]/g, '_').toUpperCase();
    const pwmSuffix = selection.pwm ? '_' + selection.pwm : '';
    const formattedUrl = format(
      selection.url,
      `${name}${pwmSuffix}`,
      mode,
    );

    onSubmit(formattedUrl, force, migrate);
  }

  const disableFlashButton = !selection.url || (!selection.pwm && options.frequencies.length > 0);

  return (
    <div id="firmware-selector">
      <div className="center-wrapper">
        <div className="checkbox force">
          <label>
            <input
              defaultChecked={force}
              onChange={updateForce}
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
              onChange={updateMigrate}
              type="checkbox"
            />

            <span>
              <span>
                {t('migrateFlashText')}
              </span>

              <span className={!migrate ? "red" : "hidden"}>
                {t('migrateFlashHint')}
              </span>
            </span>
          </label>
        </div>

        <div className="gui-box grey">
          <div className="gui-box-titlebar">
            <div className="spacer-box-title">
              Select Target
            </div>
          </div>

          <div className="spacer-box">

            <LabeledSelect
              firstLabel="Select Firmware"
              label="Firmware"
              onChange={updateFirmware}
              options={options.firmwares}
              selected={selection.firmware}
            />

            {selection.firmware &&
              <>
                <LabeledSelect
                  firstLabel="Select ESC"
                  label="ESC"
                  onChange={updateEsc}
                  options={options.escs}
                  selected={esc}
                />

                {type === BLHELI_TYPES.SILABS || type === BLHELI_TYPES.ATMEL &&
                  <LabeledSelect
                    firstLabel="Select Mode"
                    label="Mode"
                    onChange={updateMode}
                    options={options.modes}
                    selected={mode}
                  />}

                <LabeledSelect
                  firstLabel="Select Version"
                  label="Version"
                  onChange={updateVersion}
                  options={options.versions}
                  selected={selection.url}
                />

                {options.frequencies.length > 0 &&
                  <LabeledSelect
                    firstLabel="Select PWM Frequency"
                    label="PWM Frequency"
                    onChange={updatePwm}
                    options={options.frequencies}
                    selected={selection.pwm}
                  />}
              </>}

            <div className="default-btn">
              <button
                className={disableFlashButton ? "disabled" : ""}
                disabled={disableFlashButton}
                onClick={submit}
                type="button"
              >
                {t('escButtonSelect')}
              </button>
            </div>

            <div className="default-btn">
              <input
                onChange={submitLocalFile}
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

FirmwareSelector.defaultProps = { selectedMode: null };

FirmwareSelector.propTypes = {
  configs: PropTypes.shape({
    escs: PropTypes.shape().isRequired,
    versions: PropTypes.shape().isRequired,
    platforms: PropTypes.shape().isRequired,
    pwm: PropTypes.shape().isRequired,
  }).isRequired,
  escHint: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onLocalSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedMode: PropTypes.string,
  signatureHint: PropTypes.number.isRequired,
};

export default FirmwareSelector;
