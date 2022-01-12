import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useRef,
  useState,
} from 'react';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import bluejay from './images/bluejay_logo.png';
import './style.scss';

function Install() {
  const { t } = useTranslation('common');

  const deferredPrompt = useRef(null);
  const [showInstall, setShowInstall]  = useState(false);

  window.addEventListener('beforeinstallprompt', (e) => {
    deferredPrompt.current = e;
    setShowInstall(true);
  });

  function handleInstallToHomescreen() {
    if(deferredPrompt.current) {
      deferredPrompt.current.prompt();
    }
  }

  return(
    <div className={`install-wrapper ${showInstall ? 'active' : ''}`}>
      <div className="install">
        <Typography
          className="description"
          dangerouslySetInnerHTML={{ __html: t('homeInstall') }}
        />

        <Button
          onClick={handleInstallToHomescreen}
          variant="contained"
        >
          {t('addToHomeScreen')}
        </Button>
      </div>
    </div>
  );
}

function HomeColumnLeft() {
  const { t } = useTranslation('common');

  return(
    <Stack sx={{ p: 2 }}>
      <Typography
        component="h3"
        variant="h5"
      >
        {t('homeDisclaimerHeader')}
      </Typography>

      <Alert
        severity="warning"
        sx={{ marginBottom: '16px' }}
      >
        <AlertTitle>
          {t('betaWarningTitle')}
        </AlertTitle>

        <Typography dangerouslySetInnerHTML={{ __html: t('betaWarningText') }} />
      </Alert>

      <Typography paragraph>
        <div dangerouslySetInnerHTML={{ __html: t('homeDisclaimerText') }} />
      </Typography>

      <Typography
        component="h3"
        variant="h5"
      >
        {t('homeAttributionHeader')}
      </Typography>

      <Typography paragraph>
        <div dangerouslySetInnerHTML={{ __html: t('homeAttributionText') }} />
      </Typography>
    </Stack>
  );
}

function HomeColumnCenter({ onOpenMelodyEditor }) {
  const { t } = useTranslation('common');

  return(
    <Stack sx={{ p: 2 }}>
      <Typography
        component="h3"
        variant="h5"
      >
        {t('homeExperimental')}
      </Typography>

      <Typography>
        {t('homeVersionInfo')}
      </Typography>

      <Typography paragraph>
        <List dense>
          <ListItem>
            <ListItemText
              primary={
                <a
                  href="https://github.com/bitdump/BLHeli"
                  rel="noreferrer"
                  target="_blank"
                >
                  BLHeli_S
                </a>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary={
                <a
                  href="https://github.com/mathiasvr/bluejay"
                  rel="noreferrer"
                  target="_blank"
                >
                  Bluejay
                </a>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemText
              primary={
                <a
                  href="https://github.com/AlkaMotors/AM32-MultiRotor-ESC-firmware"
                  rel="noreferrer"
                  target="_blank"
                >
                  AM32
                </a>
              }
            />
          </ListItem>
        </List>
      </Typography>

      <Typography
        component="h3"
        variant="h5"
      >
        BLHeli_S
      </Typography>

      <Typography paragraph>
        <div dangerouslySetInnerHTML={{ __html: t('blhelisText') }} />
      </Typography>

      <Typography
        component="h3"
        variant="h5"
      >
        Bluejay
      </Typography>

      <Grid container>
        <Grid
          item
          xs={9}
        >
          <Typography>
            <div dangerouslySetInnerHTML={{ __html: t('bluejayText') }} />
          </Typography>
        </Grid>

        <Grid
          item
          xs={3}
        >
          <img
            alt="Bluejay"
            src={bluejay}
          />
        </Grid>
      </Grid>

      <Stack sx={{ p: 2 }}>
        <Button
          onClick={onOpenMelodyEditor}
          type="button"
          variant="outlined"
        >
          {t('openMelodyEditor')}
        </Button>
      </Stack>

      <Typography paragraph>
        <div dangerouslySetInnerHTML={{ __html: t('bluejaySupportedHardware') }} />
      </Typography>

      <Typography
        component="h3"
        variant="h5"
      >
        AM32
      </Typography>

      <Typography paragraph>
        <div dangerouslySetInnerHTML={{ __html: t('blheli32ToAM32') }} />
      </Typography>
    </Stack>
  );
}
HomeColumnCenter.propTypes = { onOpenMelodyEditor: PropTypes.func.isRequired };

function HomeColumnRight() {
  const { t } = useTranslation('common');

  return(
    <Stack sx={{ p: 2 }}>
      <Typography
        component="h3"
        variant="h5"
      >
        {t('homeDiscordHeader')}
      </Typography>

      <Typography paragraph>
        {t('homeDiscordText')}
      </Typography>

      <Typography paragraph>
        <Link
          href="https://discord.gg/QvSS5dk23C"
          rel="noreferrer"
          sx={{
            textAlign: 'center',
            display: 'block',
          }}
          target="_blank"
        >
          <img
            alt="Discord"
            className="discord"
            data-canonical-src="https://img.shields.io/discord/822952715944460368.svg?label=&amp;logo=discord&amp;logoColor=ffffff&amp;color=7389D8&amp;labelColor=6A7EC2"
            src="https://camo.githubusercontent.com/74d2e4746c6f20a2cf36068cd18d092724801f7ccd17e6bdce62e94d31f9ccb2/68747470733a2f2f696d672e736869656c64732e696f2f646973636f72642f3832323935323731353934343436303336382e7376673f6c6162656c3d266c6f676f3d646973636f7264266c6f676f436f6c6f723d66666666666626636f6c6f723d373338394438266c6162656c436f6c6f723d364137454332"
            style={{ height: '50px' }}
          />
        </Link>
      </Typography>

      <Typography
        component="h3"
        variant="h5"
      >
        {t('homeChinaHeader')}
      </Typography>

      <Typography
        dangerouslySetInnerHTML={{ __html: t('homeChinaText') }}
        paragraph
      />

      <Typography
        component="h3"
        variant="h5"
      >
        {t('homeContributionHeader')}
      </Typography>

      <Typography
        dangerouslySetInnerHTML={{ __html: t('homeContributionText') }}
        paragraph
      />

      <Typography
        component="h3"
        variant="h5"
      >
        {t('whatsNextHeader')}
      </Typography>

      <Typography
        dangerouslySetInnerHTML={{ __html: t('whatsNextText') }}
        paragraph
      />
    </Stack>
  );
}

function Home({ onOpenMelodyEditor }) {
  const { t } = useTranslation('common');

  return (
    <div id="content">
      <div id="tab-landing">
        <Box>
          <div className="content_top">
            <div className="logowrapper">
              <Typography
                align="center"
                dangerouslySetInnerHTML={{ __html: t('homeWelcome') }}
                element="h2"
                variant="h4"
              />

              <Install />
            </div>
          </div>

          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              md={4}
              xs={12}
            >
              <HomeColumnLeft />
            </Grid>

            <Grid
              item
              md={4}
              xs={12}
            >
              <HomeColumnCenter
                onOpenMelodyEditor={onOpenMelodyEditor}
              />
            </Grid>

            <Grid
              item
              md={4}
              xs={12}
            >
              <HomeColumnRight />
            </Grid>
          </Grid>
        </Box>
      </div>
    </div>
  );
}
Home.propTypes = { onOpenMelodyEditor: PropTypes.func.isRequired };

export default Home;
