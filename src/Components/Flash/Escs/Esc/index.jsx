import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
    <div className="esc gui-box grey">
      <div className="gui-box-titlebar">
        <Typography className="spacer-box-title">
          {title}
        </Typography>
      </div>

      <Box sx={{ p: 2 }}>
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
                lg={12}
                xs={6}
              >
                <div className="default-btn flash-btn">
                  <progress
                    className={progress > 0 ? 'progress' : 'hidden'}
                    max="100"
                    min="0"
                    value={progress}
                  />

                  <button
                    disabled={!canFlash}
                    onClick={handleFirmwareFlash}
                    type="button"
                  >
                    {t('escButtonFlash')}
                  </button>

                  {enableAdvanced &&
                    <button
                      className="firmware-dump"
                      disabled={!canFlash}
                      onClick={handleFirmwareDump}
                      type="button"
                    >
                      {t('escButtonFirmwareDump')}
                    </button>}
                </div>
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </Box>
    </div>
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
