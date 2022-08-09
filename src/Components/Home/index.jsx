import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import React, {
  useCallback,
  useRef,
  useState,
} from 'react';
import ReactMarkdown from 'react-markdown';

import { useTheme } from '@mui/material/styles';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
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

  const handleInstallToHomescreen = useCallback(() => {
    if(deferredPrompt.current) {
      deferredPrompt.current.prompt();
    }
  }, [deferredPrompt]);

  return(
    <Fade
      in={showInstall}
      timeout={1500}
    >
      <Stack
        sx={{
          p: 2,
          m: 1,
          marginRight: 5,
          background: 'rgba(211, 211, 211, 0.25)',
        }}
      >
        <Typography>
          <ReactMarkdown components={{ p: 'span' }}>
            {t('homeInstallLine1')}
          </ReactMarkdown>
        </Typography>

        <Typography paragraph>
          <ReactMarkdown components={{ p: 'span' }}>
            {t('homeInstallLine2')}
          </ReactMarkdown>
        </Typography>

        <Button
          fullWidth
          onClick={handleInstallToHomescreen}
          variant="contained"
        >
          {t('addToHomeScreen')}
        </Button>
      </Stack>
    </Fade>
  );
}

function HomeColumnLeft() {
  const { t } = useTranslation('common');

  const disclaimerLines = [1, 2, 3, 4, 5, 6].map((index) => {
    const line = `homeDisclaimerTextLine${index}`;

    return (
      <Typography
        key={line}
        paragraph
      >
        <ReactMarkdown components={{ p: 'span' }}>
          {t(line)}
        </ReactMarkdown>
      </Typography>
    );
  });

  return(
    <Stack sx={{ p: 2 }}>
      <Alert
        severity="warning"
        sx={{ marginBottom: '16px' }}
      >
        <AlertTitle>
          <ReactMarkdown components={{ p: 'span' }}>
            {t('homeDisclaimerHeader')}
          </ReactMarkdown>
        </AlertTitle>

        <Typography>
          <ReactMarkdown components={{ p: 'b' }}>
            {t('betaWarningLine1')}
          </ReactMarkdown>
        </Typography>

        <Typography>
          <ReactMarkdown components={{ p: 'span' }}>
            {t('betaWarningLine2')}
          </ReactMarkdown>
        </Typography>

        <Typography>
          <ReactMarkdown components={{ p: 'span' }}>
            {t('findHelp')}
          </ReactMarkdown>
        </Typography>
      </Alert>

      {disclaimerLines}

      <Typography
        component="h3"
        variant="h5"
      >
        {t('homeAttributionHeader')}
      </Typography>

      <Typography paragraph>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('homeAttributionText')}
        </ReactMarkdown>
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

      <Typography paragraph>
        {t('homeVersionInfo')}
      </Typography>

      <Typography
        component="h3"
        variant="h5"
      >
        BLHeli_S
      </Typography>

      <Typography paragraph>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('blhelisTextLine1')}
        </ReactMarkdown>
      </Typography>

      <Typography paragraph>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('blhelisTextLine2')}
        </ReactMarkdown>
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
          <Typography paragraph>
            <ReactMarkdown components={{ p: 'span' }}>
              {t('bluejayTextLine1')}
            </ReactMarkdown>
          </Typography>

          <Typography paragraph>
            <ReactMarkdown components={{ p: 'span' }}>
              {t('bluejayTextLine2')}
            </ReactMarkdown>
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
        <ReactMarkdown components={{ p: 'span' }}>
          {t('bluejaySupportedHardwareLine1')}
        </ReactMarkdown>
      </Typography>

      <Typography paragraph>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('bluejaySupportedHardwareLine2')}
        </ReactMarkdown>
      </Typography>

      <Typography
        component="h3"
        variant="h5"
      >
        AM32
      </Typography>

      <Typography paragraph>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('blheli32ToAM32Line1')}
        </ReactMarkdown>
      </Typography>

      <Typography paragraph>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('blheli32ToAM32Line2')}
        </ReactMarkdown>
      </Typography>
    </Stack>
  );
}
HomeColumnCenter.propTypes = { onOpenMelodyEditor: PropTypes.func.isRequired };

function HomeColumnRight() {
  const { t } = useTranslation('common');
  const contributionItems = [1, 2, 3, 4, 5].map((index) => {
    const line = `homeContributionItem${index}`;

    return(
      <ListItem key={line}>
        <ListItemText primary={(
          <ReactMarkdown components={{ p: 'span' }}>
            {t(line)}
          </ReactMarkdown>
        )}
        />
      </ListItem>
    );
  });

  return(
    <Stack sx={{ p: 2 }}>
      <Typography
        component="h3"
        variant="h5"
      >
        {t('homeDiscordHeader')}
      </Typography>

      <Typography paragraph>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('homeDiscordText')}
        </ReactMarkdown>
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

      <Typography paragraph>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('homeChinaText')}
        </ReactMarkdown>
      </Typography>

      <Typography
        component="h3"
        variant="h5"
      >
        {t('homeContributionHeader')}
      </Typography>

      <Typography>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('homeContributionText')}
        </ReactMarkdown>
      </Typography>

      <List dense>
        {contributionItems}
      </List>

      <Typography
        component="h3"
        variant="h5"
      >
        {t('whatsNextHeader')}
      </Typography>

      <Typography paragraph>
        <ReactMarkdown components={{ p: 'span' }}>
          {t('whatsNextText')}
        </ReactMarkdown>
      </Typography>

    </Stack>
  );
}

function Home({ onOpenMelodyEditor }) {
  const { t } = useTranslation('common');
  const theme = useTheme();

  return (
    <div id="content">
      <div id="tab-landing">
        <Box>
          <Grid
            alignItems="center"
            className="content_top"
            container
            spacing={2}
            sx={{
              background: theme.palette.primary.main,
              color: 'white',
            }}
          >
            <Grid
              item
              md={3}
              xs={12}
            />

            <Grid
              item
              md={6}
              xs={12}
            >
              <div className="content_top">
                <div className="logowrapper">
                  <Typography
                    align="center"
                  >
                    <ReactMarkdown components={{ p: 'span' }}>
                      {t('homeWelcome')}
                    </ReactMarkdown>
                  </Typography>


                </div>
              </div>
            </Grid>

            <Grid
              item
              md={3}
              xs={12}
            >
              <Install />
            </Grid>

          </Grid>

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
