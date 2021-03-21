import PropTypes from 'prop-types';
import React, {
  useState,
} from 'react';
import {
  useTranslation,
} from 'react-i18next';
import InputRange from 'react-input-range';

import Checkbox from '../Input/Checkbox';

import './style.scss';

function MotorControl({
  motorCount,
  onAllUpdate,
  onSingleUpdate,
}) {
  const { t } = useTranslation('common');
  const [unlock, setUnlock] = useState(false);
  const [masterValue, setMasterValue] = useState(1000);

  function toggleUnlock() {
    setUnlock(!unlock);
  }

  function displayValue() {
    return masterValue;
  }

  function updateValue(value) {
    setMasterValue(value);
    onAllUpdate(value);
  }

  function updateSingleValue(index, speed) {
    onSingleUpdate(index, speed);
  }

  function MotorSlider({
    index,
    onChange
  }) {
    const [value, setValue] = useState(1000);

    function update(value) {
      setValue(value);
      onChange(index + 1, value);
    }

    function displayValue() {
      return value;
    }

    return(
      <div className={`slider slider-${index}`}>
        <h3>
          {t("motorNr", { index: index + 1 })}
        </h3>

        <InputRange
          defaultValue={displayValue()}
          disabled={!unlock}
          maxValue={2000}
          minValue={1000}
          name={`speed-slider-${index}`}
          onChange={update}
          step={1}
          value={displayValue()}
        />

      </div>
    );
  }

  MotorSlider.propTypes = {
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  const singleSliderElements = [];
  for(let i = 0; i < motorCount; i += 1) {
    singleSliderElements.push(
      <MotorSlider
        index={i}
        key={i}
        onChange={updateSingleValue}
      />
    );
  }

  return (
    <div id="motor-control-wrapper">
      <div className="gui-box grey">
        <div className="gui-box-titlebar">
          <div className="spacer-box-title">
            {t('motorControl')}
          </div>
        </div>

        <div className="spacer-box">
          <div>
            <Checkbox
              label={t('enableMotorControl')}
              name="enable-motor-control"
              onChange={toggleUnlock}
              value={unlock ? 1 : 0}
            />
          </div>

          <div id="slider-wrapper">
            <div id="single-slider">
              {singleSliderElements}
            </div>

            <div id="master-slider">
              <h3>
                {t('masterSpeed')}
              </h3>

              <InputRange
                disabled={!unlock}
                maxValue={2000}
                minValue={1000}
                name="master-speed"
                onChange={updateValue}
                step={1}
                value={displayValue()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

MotorControl.propTypes = {
  motorCount: PropTypes.number.isRequired,
  onAllUpdate: PropTypes.func.isRequired,
  onSingleUpdate: PropTypes.func.isRequired,
};

export default MotorControl;
