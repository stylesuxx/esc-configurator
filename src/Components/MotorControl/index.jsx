
import React, {
  useCallback,
  useState,
  useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Slider, { createSliderWithTooltip } from 'rc-slider';
import 'rc-slider/assets/index.css';

import Checkbox from '../Input/Checkbox';
import { useInterval } from '../../utils/helpers/React';

import { selectConnected } from '../../Containers/App/escsSlice';

import './style.scss';

const SliderWithTooltip = createSliderWithTooltip(Slider);

function BatteryState({ getBatteryState }) {
  const { t } = useTranslation('common');

  const cellLimit = 3.7;
  const [batteryState, setBatteryState] = useState({
    text: null,
    danger: false,
  });

  /* istanbul ignore next */
  useInterval(async() => {
    if(getBatteryState) {
      const state = await getBatteryState();

      if(state && state.cellCount > 0) {
        const danger = (state.voltage / state.cellCount) < cellLimit;
        setBatteryState({
          text: `${state.cellCount}S @ ${state.voltage}V`,
          danger,
        });
      } else {
        setBatteryState({
          text: null,
          danger: false,
        });
      }
    }
  }, 1000);

  if(batteryState.text) {
    return (
      <span className={`battery-state ${batteryState.danger ? 'danger' : ''}`}>
        {`${t('battery')} ${batteryState.text}`}
      </span>
    );
  }

  return null;
}

BatteryState.defaultProps = { getBatteryState: null };
BatteryState.propTypes = { getBatteryState: PropTypes.func };

function MotorSlider({
  disabled,
  max,
  min,
  onChange,
  startValue,
}) {
  const [value, setValue] = useState(startValue);

  /* istanbul ignore next */
  const update = useCallback((value) => {
    setValue(value);
    onChange(value);
  }, [onChange]);

  return(
    <SliderWithTooltip
      defaultValue={value}
      disabled={disabled}
      max={max}
      min={min}
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
  max: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  startValue: PropTypes.number.isRequired,
};

function IndividualMotorSlider({
  disabled,
  index,
  max,
  min,
  onChange,
  startValue,
}) {
  const { t } = useTranslation('common');

  /* istanbul ignore next */
  const update = useCallback((value) => {
    onChange(index + 1, value);
  }, [index, onChange]);

  return(
    <div className={`slider slider-${index}`}>
      <h3>
        {t("motorNr", { index: index + 1 })}
      </h3>

      <MotorSlider
        disabled={disabled}
        max={max}
        min={min}
        onChange={update}
        startValue={startValue}
      />
    </div>
  );
}

IndividualMotorSlider.propTypes = {
  disabled: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  startValue: PropTypes.number.isRequired,
};

function MotorControl({
  getBatteryState,
  onAllUpdate,
  onSingleUpdate,
  startValue,
}) {
  const { t } = useTranslation('common');

  const motorCount = useSelector(selectConnected);

  const minValue = 1000;
  const maxValue = 2000;

  const [unlock, setUnlock] = useState(false);
  const [unlockIndividual, setUnlockIndividual] = useState(true);

  const toggleUnlock = useCallback(() => {
    setUnlock(!unlock);
    onAllUpdate(startValue);
  }, [unlock, startValue, onAllUpdate]);

  // Makes no sense to test, component has its own test, we just assume that
  // the slider actually slides.
  /* istanbul ignore next */
  const updateValue = useCallback((value) => {
    if(value !== startValue && unlockIndividual) {
      setUnlockIndividual(false);
    }

    if(value === startValue) {
      setUnlockIndividual(true);
    }

    onAllUpdate(value);
  }, [startValue, unlockIndividual, onAllUpdate]);

  /* istanbul ignore next */
  const updateSingleValue = useCallback((index, speed) => {
    onSingleUpdate(index, speed);
  }, [onSingleUpdate]);

  const singleSliderElements = [];
  for(let i = 0; i < motorCount; i += 1) {
    singleSliderElements.push(
      <IndividualMotorSlider
        disabled={!unlock || !unlockIndividual}
        index={i}
        key={i}
        max={maxValue}
        min={minValue}
        onChange={updateSingleValue}
        startValue={startValue}
      />
    );
  }

  const memoizedMasterSlider = useMemo(() => (
    <MotorSlider
      disabled={!unlock}
      max={maxValue}
      min={minValue}
      onChange={updateValue}
      startValue={startValue}
    />
  ), [startValue, unlock, updateValue]);

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
            <p>
              { t('motorControlTextLine1') }
            </p>

            <p>
              { t('motorControlTextLine2') }
            </p>

            <p>
              { t('motorControlTextLine3') }
            </p>
          </div>

          <div className="line-wrapper">
            <Checkbox
              label={t('enableMotorControl')}
              name="enable-motor-control"
              onChange={toggleUnlock}
              value={unlock ? 1 : 0}
            />

            <BatteryState
              getBatteryState={getBatteryState}
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
  getBatteryState: null,
  startValue: 1000,
};
MotorControl.propTypes = {
  getBatteryState: PropTypes.func,
  onAllUpdate: PropTypes.func.isRequired,
  onSingleUpdate: PropTypes.func.isRequired,
  startValue: PropTypes.number,
};

export default MotorControl;
