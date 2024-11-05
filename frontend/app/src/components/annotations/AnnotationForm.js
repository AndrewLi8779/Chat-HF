import React from 'react';
import {
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Switch,
    FormControlLabel,
    FormHelperText
} from '@mui/material';
import AnnotationOptions from "./AnnotationOptions";

const AnnotationForm = ({
    name, setName, type, setType, question, setQuestion,
    requireExplanation, setRequireExplanation, affectedMessages, setAffectedMessages,
    options, setOptions, errors
}) => {
    const handleUpdateOptions = (newOptions) => {
        setOptions(newOptions);
    };

    return (
        <div>
            <form style={{ margin: '16px', display: 'flex', flexDirection: 'column' }}>
                <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    margin="normal"
                    error={Boolean(errors.annotationName)}
                    helperText={errors.annotationName}
                    autoComplete="off"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Annotation Type</InputLabel>
                    <Select
                        value={type}
                        defaultValue="binary"
                        onChange={(e) => setType(e.target.value)}
                        error={Boolean(errors.annotationType)}
                    >
                        <MenuItem value="binary">Binary</MenuItem>
                        <MenuItem value="likert">Likert</MenuItem>
                        <MenuItem value="select">Select</MenuItem>
                        <MenuItem value="multi_select">Multi-Select</MenuItem>
                        <MenuItem value="text">Text Input</MenuItem>
                        <MenuItem value="post_edit">Post-edit</MenuItem>
                        <MenuItem value="reverse">Reversal</MenuItem>
                    </Select>
                    <FormHelperText sx={{ color: 'red' }}>{errors.annotationType}</FormHelperText>
                </FormControl>
                <TextField
                    label="Question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    fullWidth
                    margin="normal"
                    autoComplete="off"
                />
                <AnnotationOptions
                    annotationType={type}
                    annotationOptions={options}
                    onUpdateOptions={handleUpdateOptions}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Annotation Message</InputLabel>
                    <Select
                        value={affectedMessages}
                        onChange={(e) => setAffectedMessages(e.target.value)}
                        error={Boolean(errors.affectedMessages)}
                    >
                        <MenuItem value="assistant">Model Only</MenuItem>
                        <MenuItem value="user">User Only</MenuItem>
                        <MenuItem value="both">Both Model and User</MenuItem>
                    </Select>
                    <FormHelperText sx={{ color: 'red' }}>{errors.affectedMessages}</FormHelperText>
                </FormControl>
                <FormControlLabel
                    control={
                        <Switch
                            checked={requireExplanation}
                            onChange={(e) => setRequireExplanation(e.target.checked)}
                        />
                    }
                    label="Require Explanation?"
                />
            </form>
        </div>
    );
};

export default AnnotationForm;
