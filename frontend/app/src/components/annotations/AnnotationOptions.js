import React from 'react';
import {
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const AnnotationOptions = ({ annotationType, annotationOptions, onUpdateOptions }) => {
  const handleOptionChange = (index, newValue) => {
    const newOptions = [...annotationOptions];
    newOptions[index] = newValue;
    onUpdateOptions(newOptions);
  };

  const handleAddOption = () => {
    const newOptions = [...annotationOptions, ''];
    onUpdateOptions(newOptions);
  };

  const handleDeleteOption = (index) => {
    const newOptions = annotationOptions.filter((_, i) => i !== index);
    onUpdateOptions(newOptions);
  };

  const handleLikertChange = (event) => {
    const likertCount = event.target.value;
    const newOptions = Array.from({ length: likertCount }, (_, i) => (i + 1).toString());
    onUpdateOptions(newOptions);
  };

  return (
    <div>
      <Stack>
        {(annotationType === 'binary' && (
          <ToggleButtonGroup exclusive>
            {annotationOptions.map((option, idx) => (
              <ToggleButton key={idx} value={option}>
                <TextField
                  value={option}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  variant="standard"
                  autoComplete="off"
                />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )) ||
          (annotationType === 'likert' && (
            <div>
              <Select value={annotationOptions.length} onChange={handleLikertChange} defaultValue={3}>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={7}>7</MenuItem>
              </Select>
              <ToggleButtonGroup exclusive>
                {annotationOptions.map((option, idx) => (
                  <ToggleButton key={idx} value={option}>
                    <TextField
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      variant="standard"
                      autoComplete="off"
                    />
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>
          )) ||
          ((annotationType === 'select' || annotationType === 'multi_select') && (
            <div>
              <ToggleButtonGroup exclusive={annotationType === 'select'}>
                {annotationOptions.map((option, idx) => (
                  <ToggleButton key={idx} value={option}>
                    <TextField
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      variant="standard"
                      autoComplete="off"
                    />
                    {annotationOptions.length > 1 && (
                      <IconButton onClick={() => handleDeleteOption(idx)}>
                        <Delete />
                      </IconButton>
                    )}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Button onClick={handleAddOption} startIcon={<Add />}>
                Add Option
              </Button>
            </div>
          ))}
      </Stack>
    </div>
  );
};

export default AnnotationOptions;
