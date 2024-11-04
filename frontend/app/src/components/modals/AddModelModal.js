import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Checkbox,
    FormControlLabel, Tooltip
} from '@mui/material';

const AddModelModal = ({ open, onClose, onAddModel }) => {
    const [type, setType] = useState('');
    const [provider, setProvider] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [azureEndpoint, setAzureEndpoint] = useState('');
    const [modelTitle, setModelTitle] = useState('');
    const [modelName, setModelName] = useState('');
    const [imageCapable, setImageCapable] = useState(false);

    const handleAddModel = () => {
        const newModel = {
            type,
            provider,
            apiKey,
            azureEndpoint,
            modelTitle,
            modelName,
            imageCapable
        };
        onAddModel(newModel);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Model</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Provider</InputLabel>
                    <Select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <MenuItem value="API">API</MenuItem>
                        <MenuItem value="Ollama">Ollama</MenuItem>
                        <MenuItem value="Huggingface">Huggingface</MenuItem>
                    </Select>
                </FormControl>
                {type === 'API' && (
                    <>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>API Provider</InputLabel>
                            <Select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                            >
                                <MenuItem value="OpenAI">OpenAI</MenuItem>
                                <MenuItem value="Azure">Azure</MenuItem>
                                <MenuItem value="Anthropic">Anthropic</MenuItem>
                                <MenuItem value="Gemini">Gemini</MenuItem>
                                <MenuItem value="Mistral">Mistral</MenuItem>
                            </Select>
                        </FormControl>
                        {provider === 'Azure' && (
                            <TextField
                                label="Azure Endpoint"
                                value={azureEndpoint}
                                onChange={(e) => setAzureEndpoint(e.target.value)}
                                fullWidth
                                margin="normal"
                            />
                        )}
                        <TextField
                            label="API Key"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                    </>
                )}
                <Tooltip title="This is the model name that will be displayed">
                    <TextField
                        label="Model Title"
                        value={modelTitle}
                        onChange={(e) => setModelTitle(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </Tooltip>
                <TextField
                    label="Model Name"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={imageCapable}
                            onChange={(e) => setImageCapable(e.target.checked)}
                        />
                    }
                    label="Image Capable"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleAddModel} color="primary">
                    Add Model
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddModelModal;
