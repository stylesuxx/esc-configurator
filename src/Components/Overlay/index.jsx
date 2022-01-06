import PropTypes from 'prop-types';
import React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function Overlay({
  children,
  headline,
  maxWidth,
  onClose,
  open,
}) {
  return(
    <Dialog
      aria-labelledby="customized-dialog-title"
      fullWidth
      maxWidth={maxWidth}
      onClose={onClose}
      open={open}
    >
      <DialogTitle>
        {headline}

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {children}
      </DialogContent>
    </Dialog>
  );
}

Overlay.defaultProps = {
  children: null,
  maxWidth: 'sm',
  open: false,
};
Overlay.propTypes = {
  children: PropTypes.element,
  headline: PropTypes.string.isRequired,
  maxWidth: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
};

export default Overlay;
