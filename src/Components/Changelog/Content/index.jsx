import PropTypes from 'prop-types';
import React from 'react';

import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

function Content({ entries }) {
  const entryElements = entries.map((entry) => {
    const listItems = entry.items.map((item) => (
      <ListItem key={item}>
        <ListItemText primary={item} />
      </ListItem>
    ));

    return (
      <div key={entry.title}>
        <Typography>
          {entry.title}
        </Typography>

        <Divider />

        <List dense>
          {listItems}
        </List>
      </div>
    );
  });

  return(entryElements);
}
Content.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
};

export default Content;
