// IMPROVE: * Refactor the selects to seperate components
//          * Check the hints outside of the component

import PropTypes from 'prop-types';
import React, {
  useState, useEffect,
} from 'react';
import {
  useTranslation,
} from 'react-i18next';

import {
  findMCU,
} from '../../utils/helpers/General';

import {
  BLUEJAY_ESCS,
} from '../../utils/escs/Bluejay';
import {
  BLHELI_ESCS,
} from '../../utils/escs/Blheli';
import {
  OPEN_ESC_ESCS,
} from '../../utils/escs/OpenEsc';

import {
  BLHELI_TYPES,
  BLHELI_MODES,
} from '../../utils/Blheli';

import {
  BLUEJAY_TYPES,
} from '../../utils/Bluejay';

function FirmwareSelector({
  onCancel,
  escHint,
  signatureHint,
  selectedMode,
  versions,
  onSubmit,
}) {
  const { t } = useTranslation('common');

  const [selectedEsc, setSelectedEsc] = useState(null);
  const [type, setType] = useState(null);
  const [mode, setMode] = useState(selectedMode);
  const [url, setUrl] = useState(null);
  const [pwm, setPwm] = useState(null);
  const [force, setForce] = useState(false);

  useEffect(async () => {
    if(
      BLUEJAY_ESCS.layouts[BLUEJAY_TYPES.EFM8][escHint] ||
      BLHELI_TYPES.BLHELI_S_SILABS[escHint] ||
      BLHELI_TYPES.SILABS[escHint] ||
      BLHELI_ESCS.layouts[BLHELI_TYPES.ATMEL][escHint]
    ) {
      await setSelectedEsc(escHint);
    }

    if(findMCU(signatureHint, BLUEJAY_ESCS.signatures[BLUEJAY_TYPES.EFM8])) {
      setType(BLUEJAY_TYPES.EFM8);
    } else if (findMCU(signatureHint, BLHELI_ESCS.signatures[BLHELI_TYPES.BLHELI_S_SILABS])) {
      setType(BLHELI_TYPES.BLHELI_S_SILABS);
    } else if (findMCU(signatureHint, BLHELI_ESCS.signatures[BLHELI_TYPES.SILABS])) {
      setType(BLHELI_TYPES.SILABS);
    } else if (findMCU(signatureHint, BLHELI_ESCS.signatures[BLHELI_TYPES.ATMEL])) {
      setType(BLHELI_TYPES.ATMEL);
    } else {
      throw new Error('Unknown MCU signature: ' + signatureHint.toString(0x10));
    }


  }, []);

  function updateEsc(e) {
    setSelectedEsc(e.target.value);
  }

  function updateMode(e) {
    setMode(e.target.value);
  }

  function updateVersion(e) {
    setUrl(e.target.value);
  }

  function updateForce(e) {
    setForce(e.target.checked);
  }

  function updatePwm(e) {
    setPwm(e.target.value);
  }

  function submit(e) {
    e.preventDefault();
    const escs = BLHELI_ESCS.layouts[type] || BLUEJAY_ESCS.layouts[type] || OPEN_ESC_ESCS.layouts[type];

    const format = (str2Format, ...args) =>
      str2Format.replace(/(\{\d+\})/g, (a) => args[+(a.substr(1, a.length - 2)) || 0] );

    const formattedUrl = format(
      url,
      (escs[selectedEsc].name.replace(/[\s-]/g, '_').toUpperCase() + (pwm ? '_' + pwm : '')),
      mode,
    );

    onSubmit(formattedUrl, force);
  }

  function EscSelect() {
    const descriptions = BLHELI_ESCS.layouts[type] || BLUEJAY_ESCS.layouts[type] || OPEN_ESC_ESCS.layouts[type];

    const escs = [];
    for (const layout in descriptions) {
      const esc = descriptions[layout];

      escs.push((
        <option
          key={layout}
          value={layout}
        >
          {esc.name}
        </option>
      ));
    }

    return (
      <div className="select">
        <label>
          <select
            defaultValue={selectedEsc}
            onChange={updateEsc}
          >
            <option
              className="hidden"
              disabled
              key="label"
            >
              Select ESC
            </option>

            {escs}
          </select>

          <span>
            ESC
          </span>
        </label>
      </div>
    );
  }

  function ModeSelect() {
    if(type === BLHELI_TYPES.SILABS || type === BLHELI_TYPES.ATMEL) {
      const modes = [];
      for (const mode in BLHELI_MODES) {
        modes.push(
          <option
            key={mode}
            value={mode}
          >
            {mode}
          </option>
        );
      }

      return(
        <div className="select">
          <label>

            <select
              defaultValue={mode || -1}
              onChange={updateMode}
            >
              <option
                className="hidden"
                disabled
              >
                Select Mode
              </option>

              {modes}
            </select>

            <span>
              Mode
            </span>
          </label>
        </div>
      );
    }

    return null;
  }

  function VersionSelect() {
    const versionsSelected = versions.blheli[type] || versions.bluejay[type] || versions.openEsc[type];

    const options = [];
    for (const version in versionsSelected) {
      const current = versionsSelected[version];
      const url = current.url;

      options.push((
        <option
          key={current.key}
          value={url}
        >
          {current.name}
        </option>
      ));
    }

    return (
      <div className="select">
        <label>
          <select
            defaultValue={url || -1}
            onChange={updateVersion}
          >
            <option
              className="hidden"
              disabled
              value={-1}
            >
              Select Version
            </option>

            {options}
          </select>

          <span>
            Version
          </span>
        </label>
      </div>
    );
  }

  function RpmSelect() {
    if (type === BLUEJAY_TYPES.EFM8) {
      const frequencies = [24, 48, 96];

      const options = frequencies.map((item) => (
        <option
          key={item}
          value={item}
        >
          {item}
        </option>
      ));

      return (
        <div className="select">
          <label>
            <select
              defaultValue={pwm || -1}
              onChange={updatePwm}
            >
              <option
                className="hidden"
                disabled
                value={-1}
              >
                Select PWM Frequency
              </option>

              {options}
            </select>

            <span>
              PWM Frequency
            </span>
          </label>
        </div>
      );
    }

    return null;
  }

  return (
    <>
      <div className="checkbox">
        <label>
          <input
            defaultValue={force}
            onChange={updateForce}
            type="checkbox"
          />

          <span>
            <span>
              Ignore inappropriate MCU and Layout?
            </span>

            <span className={force ? "red" : "hidden"}>
              (Flashing inappropriate firmware may damage your ESC, do so at your own risk)
            </span>
          </span>
        </label>
      </div>

      <div className="centerWrapper">
        <div className="gui_box grey">
          <div className="gui_box_titlebar">
            <div className="spacer_box_title">
              Select Target
            </div>
          </div>

          <div className="spacer_box">

            <EscSelect />

            <ModeSelect />

            <VersionSelect />

            <RpmSelect />

            <div className="default_btn">
              <a
                className={(!url || !pwm) ? "disabled" : ""}
                href="#"
                onClick={submit}
              >
                {/*
                className={
                  this.state.selectedEsc &&
                  ([BLHELI_TYPES.BLHELI_S_SILABS, OPEN_ESC_TYPES.ARM ].includes(this.state.type) ||
                  (this.state.selectedMode && this.state.type !== BLUEJAY_TYPES.EFM8 ) ||
                  (this.state.type === BLUEJAY_TYPES.EFM8 && this.state.selectedPwmFreq)) &&
                  this.state.selectedVersion !== -1 ? "" : "disabled"
                }
                onClick={this.onlineFirmwareSelected}
                */}

                {t('escButtonSelect')}
              </a>
            </div>

            {/*
            <div className="default_btn">
              <a
                href="#"
                onClick={this.localFirmwareSelected}
              >
                {t('escButtonSelectLocally')}
              </a>
            </div>
            */}

            <div className="default_btn">
              <a
                href="#"
                onClick={onCancel}
              >

                {t('buttonCancel')}

              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

FirmwareSelector.defaultProps = { selectedMode: null };

FirmwareSelector.propTypes = {
  escHint: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedMode: PropTypes.string,
  signatureHint: PropTypes.number.isRequired,
  versions: PropTypes.shape().isRequired,
};

export default FirmwareSelector;
