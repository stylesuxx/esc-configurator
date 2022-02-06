import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';

import Grid from '@mui/material/Grid';
import MuiSlider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

import { useInterval } from '../../utils/helpers/React';
import Checkbox from '../Input/Checkbox';
import MainCard from '../MainCard';
import Warning from '../Warning';

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
      <Typography color={batteryState.danger ? 'red' : 'text'}>
        {`${t('battery')} ${batteryState.text}`}
      </Typography>
    );
  }

  return null;
}
BatteryState.propTypes = { getBatteryState: PropTypes.func.isRequired };

function MotorSlider({
  disabled,
  max,
  min,
  onChange,
  startValue,
}) {
  const [value, setValue] = useState(startValue);

  useEffect(() => {
    setValue(startValue);
  }, [startValue]);

  /* istanbul ignore next */
  const update = useCallback((e) => {
    const value = e.target.value;

    setValue(value);
    onChange(value);
  }, [onChange]);

  return(
    <MuiSlider
      aria-label="Small"
      disabled={disabled}
      max={max}
      min={min}
      onChange={update}
      step={10}
      value={value}
      valueLabelDisplay="auto"
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
    <>
      <Typography>
        {t("motorNr", { index: index + 1 })}
      </Typography>

      <MotorSlider
        disabled={disabled}
        max={max}
        min={min}
        onChange={update}
        startValue={startValue}
      />
    </>
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
  const [masterValue, setMasterValue] = useState(startValue);

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

    setMasterValue(value);
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
        startValue={masterValue}
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
    <Grid
      container
      spacing={2}
    >
      <Grid
        item
        xs={12}
      >
        <Warning />
      </Grid>

      <Grid
        item
        md={5}
        xs={12}
      >
        <MainCard title={t('motorControl')}>
          <Typography paragraph>
            {t('motorControlTextLine1')}
          </Typography>

          <Typography paragraph>
            {t('motorControlTextLine2')}
          </Typography>

          <Typography paragraph>
            {t('motorControlTextLine3')}
          </Typography>

          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={6}
            >
              <Checkbox
                label={t('enableMotorControl')}
                name="enable-motor-control"
                onChange={toggleUnlock}
                value={unlock ? 1 : 0}
              />
            </Grid>

            <Grid
              item
              xs={6}
            >
              <BatteryState getBatteryState={getBatteryState} />
            </Grid>
          </Grid>

          <br />

          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={6}
            >
              {singleSliderElements}
            </Grid>

            <Grid
              item
              xs={6}
            >
              <Typography>
                {t('masterSpeed')}
              </Typography>

              {memoizedMasterSlider}
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
}
MotorControl.defaultProps = {
  motorCount: 0,
  startValue: 1000,
};
MotorControl.propTypes = {
  getBatteryState: PropTypes.func.isRequired,
  motorCount: PropTypes.number,
  onAllUpdate: PropTypes.func.isRequired,
  onSingleUpdate: PropTypes.func.isRequired,
  startValue: PropTypes.number,
};

export default MotorControl;
