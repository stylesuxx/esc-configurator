import PropTypes from 'prop-types';
import React from 'react';

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

function MainCard({
  children,
  title,
}) {
  const theme = useTheme();

  return(
    <Card elevation={5}>
      <CardHeader
        sx={{
          color: 'white',
          background: theme.palette.primary.main,
          paddingTop: 0.7,
          paddingBottom: 0.7,
        }}
        title={title}
        titleTypographyProps={{ variant: 'body1' }}
      />

      <Box sx={{ p: 2 }}>
        {children}
      </Box>
    </Card>
  );
}

MainCard.defaultProps = { children: null };
MainCard.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  title: PropTypes.string.isRequired,
};

export default MainCard;
