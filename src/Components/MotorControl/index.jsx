import Slider, { createSliderWithTooltip } from 'rc-slider';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useState,
  useMemo,
} from 'react';
import 'rc-slider/assets/index.css';

import Checkbox from '../Input/Checkbox';

import './style.scss';

const SliderWithTooltip = createSliderWithTooltip(Slider);

function MotorControl({
  motorCount,
  onAllUpdate,
  onSingleUpdate,
  startValue,
}) {
  const { t } = useTranslation('common');

  const minValue = 1000;
  const maxValue = 2000;

  const [unlock, setUnlock] = useState(false);
  const [unlockIndividual, setUnlockIndividual] = useState(true);

  function toggleUnlock() {
    setUnlock(!unlock);
    onAllUpdate(startValue);
  }

  // Makes no sense to test, component has its own test, we just assume that
  // the slider actually slides.
  /* istanbul ignore next */
  function updateValue(value) {
    if(value !== startValue && unlockIndividual) {
      setUnlockIndividual(false);
    }

    if(value === startValue) {
      setUnlockIndividual(true);
    }

    onAllUpdate(value);
  }

  /* istanbul ignore next */
  function updateSingleValue(index, speed) {
    onSingleUpdate(index, speed);
  }

  function MotorSlider({
    disabled,
    onChange,
  }) {
    const [value, setValue] = useState(startValue);
    /* istanbul ignore next */
    function update(value) {
      setValue(value);
      onChange(value);
    }

    return(
      <SliderWithTooltip
        defaultValue={value}
        disabled={disabled}
        max={maxValue}
        min={minValue}
        onChange={update}
        step={10}
        tipProps={{
          visible: true,
          placement: 'top',
        }}
      />
    );
  }
  MotorSlider.propTypes = {
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  function MasterSlider() {
    return(
      <MotorSlider
        disabled={!unlock}
        onChange={updateValue}
      />
    );
  }

  function IndividualMotorSlider({
    index,
    onChange,
  }) {
    /* istanbul ignore next */
    function update(value) {
      onChange(index + 1, value);
    }

    return(
      <div className={`slider slider-${index}`}>
        <h3>
          {t("motorNr", { index: index + 1 })}
        </h3>

        <MotorSlider
          disabled={!unlock || !unlockIndividual}
          onChange={update}
        />
      </div>
    );
  }
  IndividualMotorSlider.propTypes = {
    index: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  const singleSliderElements = [];
  for(let i = 0; i < motorCount; i += 1) {
    singleSliderElements.push(
      <IndividualMotorSlider
        index={i}
        key={i}
        onChange={updateSingleValue}
      />
    );
  }

  const memoizedMasterSlider = useMemo(() => (
    <MasterSlider />
  ), [unlock]);

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

              {memoizedMasterSlider}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

MotorControl.defaultProps = {
  motorCount: 0,
  startValue: 1000,
};

MotorControl.propTypes = {
  motorCount: PropTypes.number,
  onAllUpdate: PropTypes.func.isRequired,
  onSingleUpdate: PropTypes.func.isRequired,
  startValue: PropTypes.number,
};

export default MotorControl;
