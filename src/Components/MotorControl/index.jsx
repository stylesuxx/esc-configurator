import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
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
      <span className={`battery-state ${batteryState.danger ? 'danger' : ''}`}>
        {`${t('battery')} ${batteryState.text}`}
      </span>
    );
  }

  return null;
}
BatteryState.propTypes = { getBatteryState: PropTypes.func.isRequired };

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
    key,
    onChange,
  }) {
    const [value, setValue] = useState(startValue);
    /* istanbul ignore next */
    function update(e) {
      const newValue = e.target.value;
      if(newValue !== value) {
        console.log(newValue);
        setValue(newValue);
        onChange(newValue);
      }
    }

    return(
      <MuiSlider
        aria-label="Small"
        disabled={disabled}
        key={key}
        max={maxValue}
        min={minValue}
        onChange={update}
        step={10}
        value={value}
        valueLabelDisplay="auto"
      />
    );
  }
  MotorSlider.propTypes = {
    disabled: PropTypes.bool.isRequired,
    key: PropTypes.number.isRequired,
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
        <Typography>
          {t("motorNr", { index: index + 1 })}
        </Typography>

        <MotorSlider
          disabled={!unlock || !unlockIndividual}
          key={index + 1}
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
            {t('motorControlText-1')}
          </Typography>

          <Typography paragraph>
            {t('motorControlText-2')}
          </Typography>

          <Typography paragraph>
            {t('motorControlText-3')}
          </Typography>

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
