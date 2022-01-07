import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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

  function updateSettings() {
    onSettingsUpdate(index, settings);
  }

  function updateCommonSettings(settings) {
    onCommonSettingsUpdate(index, settings);
  }

  function handleFirmwareFlash() {
    onFlash(index);
  }

  function handleFirmwareDump() {
    onFirmwareDump(index);
  }

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
              <div className="flash-btn">
                <progress
                  className={progress > 0 ? 'progress' : 'hidden'}
                  max="100"
                  min="0"
                  value={progress}
                />

                <ButtonGroup
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
                </ButtonGroup>
              </div>
            </Grid>
          </Grid>
        </Stack>
      </Stack>
    </MainCard>
  );
});
Esc.displayName = 'Esc';
Esc.defaultProps = { canFlash: true };
Esc.propTypes = {
  canFlash: PropTypes.bool,
  directInput: PropTypes.bool.isRequired,
  disableCommon: PropTypes.bool.isRequired,
  enableAdvanced: PropTypes.bool.isRequired,
  esc: PropTypes.shape().isRequired,
  index: PropTypes.number.isRequired,
  onCommonSettingsUpdate: PropTypes.func.isRequired,
  onFirmwareDump: PropTypes.func.isRequired,
  onFlash: PropTypes.func.isRequired,
  onSettingsUpdate: PropTypes.func.isRequired,
};

export default Esc;
