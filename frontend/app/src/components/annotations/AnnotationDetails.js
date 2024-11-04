import React, { useState } from 'react';
import { IconButton, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

const AnnotationDetails = ({ data, annotationName, annotationType, annotation_question, annotation_options, setMessageStates, index, explanationRequired }) => {
    const [selectedValue, setSelectedValue] = useState(() => {
        // Conditional logic to determine the initial value
        console.log(data)
        return data[annotationName] != null && data[annotationName]['value'] != null
            ? data[annotationName]['value'] : data[annotationName];
    });

    const [explanation, setExplanation] = useState(() => {
        // Conditional logic to determine the initial value
        return explanationRequired && data[annotationName] != null && data[annotationName]['explanation'] != null
            ? data[annotationName]['explanation'] : '';
    });

    const handleToggleChange = (event, newValue) => {
        setSelectedValue(newValue);
    };

    const handleTextChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const updateExplanation = (event) => {
        setExplanation(event.target.value);
    }

    const handleClose = () => {
        setMessageStates(prevState => {
            const newState = [...prevState];
            newState[index].expanded = false;
            return newState;
        });
        setSelectedValue(data[annotationName]);
    };

    const handleSave = () => {
        if (explanationRequired) {
            data[annotationName] = {'value': selectedValue, 'explanation': explanation}
        } else {
            data[annotationName] = selectedValue;
        }
        handleClose();
    };

    return (
        <div>
            <Stack>
                {annotation_question}
                {(annotationType === 'binary' && (
                    <ToggleButtonGroup
                        value={selectedValue}
                        exclusive
                        onChange={handleToggleChange}
                    >
                        {annotation_options.map((option, idx) => (
                            <ToggleButton value={option} key={idx}>{option}</ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                )) ||
                (annotationType === 'likert' && (
                    <ToggleButtonGroup
                        value={selectedValue}
                        exclusive
                        onChange={handleToggleChange}
                    >
                        {annotation_options.map((option, idx) => (
                            <ToggleButton value={option} key={idx}>{option}</ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                )) ||
                (annotationType === 'select' && (
                    <ToggleButtonGroup
                        value={selectedValue}
                        exclusive
                        onChange={handleToggleChange}
                    >
                        {annotation_options.map((option, idx) => (
                            <ToggleButton value={option} key={idx}>{option}</ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                )) ||
                (annotationType === 'multi_select' && (
                    <ToggleButtonGroup
                        value={selectedValue}
                        onChange={handleToggleChange}
                    >
                        {annotation_options.map((option, idx) => (
                            <ToggleButton value={option} key={idx}>{option}</ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                )) ||
                (annotationType === 'text' && (
                    <TextField
                        value={selectedValue || ''}
                        onChange={handleTextChange}
                    />
                ))}
                {explanationRequired && <TextField value={explanation} onChange={updateExplanation}></TextField>}
                <Stack direction={"row"}>
                    <IconButton onClick={handleClose}><CloseIcon /></IconButton>
                    <IconButton onClick={handleSave}><CheckIcon /></IconButton>
                </Stack>
            </Stack>
        </div>
    );
}

export default AnnotationDetails;
