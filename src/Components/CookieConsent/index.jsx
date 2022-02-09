import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import Grow from '@mui/material/Grow';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function CookieConsent({
  onCookieAccept,
  show,
}) {
  const { t } = useTranslation('common');

  const handleAccept = useCallback(() => {
    onCookieAccept(true);
  }, [onCookieAccept]);

  const handleDeny = useCallback(() => {
    onCookieAccept(false);
  }, [onCookieAccept]);

  return (
    <Grow
      in={show}
      sx={{
        zIndex: 100,
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
      }}
    >
      <Box>
        <Stack
          sx={{
            p: 2,
            background: 'white',
          }}
        >
          <Grid
            alignItems="center"
            container
            spacing={2}
          >
            <Grid
              item
              md={10}
              xs={12}
            >
              <Typography>
                {t('cookieText')}
              </Typography>
            </Grid>

            <Grid
              item
              md={2}
              xs={12}
            >
              <Box
                display="flex"
                justifyContent="flex-end"
              >
                <ButtonGroup>
                  <Button
                    onClick={handleDeny}
                    variant="contained"
                  >
                    {t('deny')}
                  </Button>

                  <Button
                    onClick={handleAccept}
                    variant="contained"
                  >
                    {t('allow')}
                  </Button>
                </ButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Grow>
  );
}
CookieConsent.propTypes = {
  onCookieAccept: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default React.memo(CookieConsent);
