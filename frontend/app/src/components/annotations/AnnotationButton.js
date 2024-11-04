import React from 'react';
import { IconButton } from '@mui/material';

const AnnotationButton = ( {
    onClick,
    startIcon
}) => {
  return (
    <IconButton
      onClick={onClick}
      size={"small"}
    >
        {startIcon}
    </IconButton>
  );
};

export default AnnotationButton;

