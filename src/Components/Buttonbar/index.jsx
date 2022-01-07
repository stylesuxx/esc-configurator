import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';

import GenericButton from './GenericButton';

function Buttonbar({
  onOpenMelodyEditor,
  onReadSetup,
  onWriteSetup,
  onSeletFirmwareForAll,
  onResetDefaults,
  onSaveLog,
  canRead,
  canWrite,
  canFlash,
  canResetDefaults,
  showMelodyEditor,
}) {
  const { t } = useTranslation('common');

  return (
    <Box
      sx={{
        width: '100%',
        position: 'fixed',
        bottom: '21px',
        background: '#EFEFEF',
        boxShadow: 'rgba(0, 0, 0, 0.25) 0 -3px 8px',
        borderTop: '1px solid #F9F9F9',
        zIndex: 10,
      }}
    >
      <Box
        className="mui-fixed"
        sx={{ p: 1 }}
      >
        <Grid
          container
          justifyContent="space-between"
          spacing={1}
        >
          <Grid
            item
            sx={{ display: { md: 'none' } }}
            xs={12}
          >
            {showMelodyEditor &&
              <GenericButton
                disabled={!canRead}
                fullWidth
                onClick={onOpenMelodyEditor}
                text={t('escButtonOpenMelodyEditor')}
              />}
          </Grid>

          <Grid item>
            <ButtonGroup>
              <GenericButton
                onClick={onSaveLog}
                text={t('escButtonSaveLog')}
              />

              <GenericButton
                disabled={!canResetDefaults}
                onClick={onResetDefaults}
                sx={{ display: { md: 'none' } }}
                text={t('resetDefaults')}
              />
            </ButtonGroup>
          </Grid>

          <Grid
            item
            md={6}
            xs={12}
          >
            <ButtonGroup fullWidth>
              {showMelodyEditor &&
                <GenericButton
                  disabled={!canRead}
                  fullWidth
                  onClick={onOpenMelodyEditor}
                  sx={{
                    display: {
                      xs: 'none',
                      sm: 'flex',
                    },
                  }}
                  text={t('escButtonOpenMelodyEditor')}
                />}

              <GenericButton
                disabled={!canResetDefaults}
                onClick={onResetDefaults}
                sx={{ display: { xs: 'none' } }}
                text={t('resetDefaults')}
              />

              <GenericButton
                disabled={!canFlash}
                fullWidth
                onClick={onSeletFirmwareForAll}
                text={t('escButtonFlashAll')}
              />

              <GenericButton
                disabled={!canWrite}
                fullWidth
                onClick={onWriteSetup}
                text={t('escButtonWrite')}
              />

              <GenericButton
                disabled={!canRead}
                fullWidth
                onClick={onReadSetup}
                text={t('escButtonRead')}
              />
            </ButtonGroup>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

Buttonbar.propTypes = {
  canFlash: PropTypes.bool.isRequired,
  canRead: PropTypes.bool.isRequired,
  canResetDefaults: PropTypes.bool.isRequired,
  canWrite: PropTypes.bool.isRequired,
  onOpenMelodyEditor: PropTypes.func.isRequired,
  onReadSetup: PropTypes.func.isRequired,
  onResetDefaults: PropTypes.func.isRequired,
  onSaveLog: PropTypes.func.isRequired,
  onSeletFirmwareForAll: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
  showMelodyEditor: PropTypes.bool.isRequired,
};

export default Buttonbar;
