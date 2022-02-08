import PropTypes from 'prop-types';
import React from 'react';

import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import './style.scss';

const BootstrapTooltip = styled(({
  className,
  ...props
}) => (
  <Tooltip
    arrow
    classes={{ popper: className }}
    title={props.title}
  >
    {props.children}
  </Tooltip>
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: { color: theme.palette.common.black },
  [`& .${tooltipClasses.tooltip}`]: { backgroundColor: theme.palette.common.black },
}));

function Info({
  hint,
  inSync,
  label,
  name,
}) {
  return (
    <span className={`info-wrapper-wrapper ${!inSync ? 'not-in-sync' : ''}`} >
      {label}

      {hint &&
        <span className="info-wrapper">
          <BootstrapTooltip
            title={hint}
          >
            <span
              className="info-icon"
              data-for={`hint-${name}`}
              data-tip
            >
              ?
            </span>
          </BootstrapTooltip>
        </span>}
    </span>
  );
}

Info.defaultProps = {
  hint: null,
  label: null,
};

Info.propTypes = {
  hint: PropTypes.string,
  inSync: PropTypes.bool.isRequired,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
};

export default Info;
