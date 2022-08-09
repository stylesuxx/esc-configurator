import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import MainCard from '../../../MainCard';
import SettingsHandler from './SettingsHandler';

const Esc = forwardRef(({
  canFlash,
  directInput,
  disableCommon,
  enableAdvanced,
  esc,
  index,
  onCommonSettingsUpdate,
  onFirmwareDump,
  onFlash,
  onSettingsUpdate,
}, ref) => {
  const { t } = useTranslation('common');

  const commonSettings = esc.settings;
  const commonSettingsDescriptions = esc.settingsDescriptions;

  const settings = esc.individualSettings;
  const descriptions = esc.individualSettingsDescriptions;
  const name = esc.displayName ? esc.displayName : 'Unsupported/Unrecognized';
  const title = `ESC ${(index + 1)}: ${name}`;

  const [progress, setProgress] = useState(0);

  useImperativeHandle(ref, () => ({
    setProgress(progress) {
      setProgress(progress);
    },
  }));

  const updateSettings = useCallback(() => {
    onSettingsUpdate(index, settings);
  }, [onSettingsUpdate, index, settings]);

  const updateCommonSettings = useCallback((settings) => {
    onCommonSettingsUpdate(index, settings);
  }, [onCommonSettingsUpdate, index]);

  const handleFirmwareFlash = useCallback(() => {
    onFlash(index);
  }, [onFlash, index]);

  const handleFirmwareDump = useCallback(() => {
    onFirmwareDump(index);
  }, [onFirmwareDump, index]);

  return (
    <MainCard title={title}>
      <Stack
        divider={<Divider />}
        spacing={1}
      >
        {disableCommon && commonSettingsDescriptions &&
          <SettingsHandler
            descriptions={commonSettingsDescriptions.base}
            directInput={directInput}
            disabled={!canFlash}
            onUpdate={updateCommonSettings}
            settings={commonSettings}
          />}

        {descriptions &&
          <SettingsHandler
            descriptions={descriptions.base}
            directInput={directInput}
            disabled={!canFlash}
            onUpdate={updateSettings}
            settings={settings}
          />}

        <Stack>
          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              xs={12}
            >
              {progress > 0 &&
                <LinearProgress
                  sx={{ height: 36.5 }}
                  value={progress}
                  variant="determinate"
                />}

              {progress === 0 &&
                <ButtonGroup
                  fullWidth
                  variant="outlined"
                >
                  <Button
                    disabled={!canFlash}
                    onClick={handleFirmwareFlash}
                  >
                    {t('escButtonFlash')}
                  </Button>

                  {enableAdvanced &&
                    <Button
                      disabled={!canFlash}
                      onClick={handleFirmwareDump}
                    >
                      {t('escButtonFirmwareDump')}
                    </Button>}
                </ButtonGroup>}
            </Grid>
          </Grid>
        </Stack>
      </Stack>
    </MainCard>
  );
});
Esc.displayName = 'Esc';
Esc.defaultProps = {
  canFlash: true,
  disableCommon: false,
  enableAdvanced: false,
};
Esc.propTypes = {
  canFlash: PropTypes.bool,
  directInput: PropTypes.bool.isRequired,
  disableCommon: PropTypes.bool,
  enableAdvanced: PropTypes.bool,
  esc: PropTypes.shape().isRequired,
  index: PropTypes.number.isRequired,
  onCommonSettingsUpdate: PropTypes.func.isRequired,
  onFirmwareDump: PropTypes.func.isRequired,
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Esc;
