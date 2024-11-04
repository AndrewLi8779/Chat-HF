import React, {useEffect, useRef, useState} from 'react';
import {
    Button,
    IconButton,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Typography,
    Slider,
    Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import { Close, Delete, Edit, RecordVoiceOver } from '@mui/icons-material';
import StorageIcon from '@mui/icons-material/Storage';
import jsYaml from 'js-yaml';
import AnnotationForm from "./annotations/Annotation";
import AddModelModal from "./modals/AddModelModal";


const OptionsSidebar = ({ isNavOpen, toggleNav, setAnnotationList, annotationList, config}) => {
    const [isAnnoNavOpen, setIsAnnoNavOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(0);
    const [annoOpen, setAnnoOpen] = useState(false);
    const [annoName, setAnnoName] = useState('');
    const [annoType, setAnnoType] = useState('');
    const [question, setQuestion] = useState('');
    const [pressToTalk, setPressToTalk] = useState(config['press-to-talk']);
    const [database, setDatabase] = useState(config['database']);
    const [requireExplanation, setRequireExplanation] = useState(false);
    const [affectedMessages, setAffectedMessages] = useState('');
    const [options, setOptions] = useState(['Option 1']);
    const [modelList, setModelList] = useState(config['model_list']);
    const [selectedModel, setSelectedModel] = useState(config['model_name']);
    const [addModelModalOpen, setAddModelModalOpen] = useState(false);
    const sidebarRef = useRef(null);

    useEffect(() => {
        // Close annotation panel when options panel is closed
        if (!isNavOpen) {
            setIsAnnoNavOpen(false);
        }
    }, [isNavOpen]);

    const handleOpenAddModelModal = () => {
        setAddModelModalOpen(true);
    };

    const handleCloseAddModelModal = () => {
        setAddModelModalOpen(false);
    };

    const handleAddModel = (newModel) => {
        setModelList([...modelList, newModel]);
        updateConfig('model_list', [...modelList, newModel]);
    };


    const toggleAnnoNav = () => {
        setIsAnnoNavOpen(!isAnnoNavOpen);
    };

    const addAnnotation = () => {
        setAnnoOpen(false);
        const newAnnotation = {
            annotationName: annoName,
            annotationType: annoType,
            question,
            options,
            requireExplanation,
            affectedMessages
        };
        if (editing) {
            annotationList[editIndex] = newAnnotation;
        } else {
            setAnnotationList([...annotationList, newAnnotation]);
        }
        config['annotations'] = [...annotationList, newAnnotation];
        resetForm();
    };

    const resetForm = () => {
        setAnnoName('');
        setAnnoType('');
        setQuestion('');
        setOptions([]);
        setAffectedMessages('');
        setRequireExplanation(false);
    };

    const deleteAnnotation = (index) => {
        setAnnotationList(annotationList.filter((_, i) => i !== index));
    };

    const editAnnotation = (index) => {
        const annotation = annotationList[index];
        setAnnoName(annotation['annotationName']);
        setAnnoType(annotation['annotationType']);
        setQuestion(annotation['question']);
        setOptions(annotation['options']);
        setAffectedMessages(annotation['affectedMessages']);
        setRequireExplanation(annotation['requireExplanation']);
        setEditing(true);
        setEditIndex(index);
        setAnnoOpen(true);
    };

    const updateConfig = (configName, value) => {
        config[configName] = value;
        if (configName === 'model_name') {
            setSelectedModel(value);
        }
    }

    const saveConfig = () => {
        const yamlStr = jsYaml.dump(config);
        const blob = new Blob([yamlStr], { type: 'text/yaml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'config.yaml';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const loadConfig = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const loadedConfig = jsYaml.load(e.target.result);
            // Update the config with the loaded config
            Object.keys(loadedConfig).forEach(key => {
                config[key] = loadedConfig[key];
            });
            // Update the annotation list if available
            if (loadedConfig.annotations) {
                setAnnotationList(loadedConfig.annotations);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div ref={sidebarRef}>
            {/* Add Model Modal */}
            <AddModelModal
                open={addModelModalOpen}
                onClose={handleCloseAddModelModal}
                onAddModel={handleAddModel}
            />
            <Drawer
                variant="persistent"
                anchor="left"
                open={isNavOpen}
                onClose={toggleNav}
                sx={{ width: '20rem' }}
                id="parentNav"
                style={{position: "relative"}}
            >
                <form style={{ margin: '1em', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h4">Configuration</Typography>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Language Model</InputLabel>
                        <Select
                            className="model"
                            defaultValue={selectedModel}
                            value={selectedModel || config.model_name || ''}
                            onChange={(e) => updateConfig('model_name', e.target.value)}
                        >
                            {modelList.map((model, index) => (
                                <MenuItem key={index} value={model.modelTitle}>
                                    {model.modelTitle || model.modelName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="text"
                        color="primary"
                        onClick={handleOpenAddModelModal}
                        style={{ marginBottom: '1em' }}
                    >
                        Add New Model
                    </Button>

                    <TextField
                        label="Model Instructions"
                        variant="outlined"
                        className="system-prompt"
                        defaultValue={config['system_prompt'] || "You are a helpful assistant."}
                        multiline
                        rows={4}
                        fullWidth
                        margin="normal"
                        onChange={(e) => updateConfig('system_prompt', e.target.value)}
                    />

                    <FormControl fullWidth margin="normal">
                        <Tooltip title="Higher diversity of responses may result in lower model coherence" placement="top">
                            <Typography>Diversity</Typography>
                        </Tooltip>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs>
                                <Slider
                                    defaultValue={config['temp'] || 0.7}
                                    step={0.1}
                                    marks
                                    min={0}
                                    max={1}
                                    className="temperature"
                                    onChange={(e) => updateConfig('temp', e.target.value)}
                                    style={{ width: '100%' }}
                                />
                            </Grid>
                        </Grid>
                    </FormControl>

                    <Grid container spacing={2} justifyContent="center">
                        <Grid item>
                            <Tooltip title="Press the mic button each time to talk, or continuous listening mode" placement="top">
                                <IconButton
                                    onClick={() => {
                                        setPressToTalk(!pressToTalk);
                                        updateConfig('press-to-talk', !config['press-to-talk']);
                                    }}
                                    color={pressToTalk ? 'primary' : 'default'}
                                >
                                    <RecordVoiceOver />
                                </IconButton>
                            </Tooltip>
                        </Grid>

                        <Grid item>
                            <Tooltip title="Save to database" placement="top">
                                <IconButton
                                    onClick={() => {
                                        setDatabase(!database)
                                        updateConfig('database', !config['database'])
                                    }}
                                    color={config['database'] ? 'primary' : 'default'}
                                >
                                    <StorageIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} marginTop={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Timeout (s)"
                                className="timeout"
                                type="number"
                                defaultValue={config.timeout || 5}
                                inputProps={{ min: 1, max: 30 }}
                                onChange={(e) => updateConfig('timeout', e.target.valueAsNumber)}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Message memory"
                                className="mem_len"
                                type="number"
                                defaultValue={config.mem_len || 10}
                                inputProps={{ min: 1, max: 30 }}
                                onChange={(e) => updateConfig('mem_len', e.target.valueAsNumber)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>

                    <Button
                        variant="contained"
                        color="primary"
                        className="annotations-btn"
                        onClick={toggleAnnoNav}
                        style={{ margin: '1em auto', display: isAnnoNavOpen ? 'none':null }}
                    >
                        Open Annotations
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        className="anno-close-btn"
                        onClick={toggleAnnoNav}
                        style={{ margin: '1em auto', display: !isAnnoNavOpen ? 'none':null }}
                    >
                        Close Annotations
                    </Button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1em' }}>
                        <Button
                            variant="contained"
                            color="info"
                            className="load-config-btn"
                            component={"label"}
                            style={{marginRight: '1em'}}
                        >
                            Load Config
                            <input
                                type="file"
                                hidden
                                accept=".yaml"
                                onChange={loadConfig}
                            />
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            className="save-config-btn"
                            onClick={saveConfig}
                        >
                            Save Config
                        </Button>
                    </div>
                </form>
            </Drawer>


            <Drawer
                variant="persistent"
                anchor="left"
                open={isAnnoNavOpen}
                sx={{ width: '10em',
                    "& .MuiDrawer-paper": {
                        marginLeft: "21rem",
                    }
                }}
                className="annosidenav"
            >
                <div>
                    <IconButton onClick={toggleAnnoNav}>
                        <Close />
                    </IconButton>
                </div>
                {/* Annotation Dialog */}
                <Dialog open={annoOpen} onClose={() => setAnnoOpen(false)} maxWidth="lg" fullWidth>
                    <DialogTitle>Create Annotation</DialogTitle>
                    <DialogContent style={{ height: '75vh' }}>
                        <AnnotationForm
                        name={annoName}
                        setName={setAnnoName}
                        type={annoType}
                        setType={setAnnoType}
                        question={question}
                        setQuestion={setQuestion}
                        requireExplanation={requireExplanation}
                        setRequireExplanation={setRequireExplanation}
                        affectedMessages={affectedMessages}
                        setAffectedMessages={setAffectedMessages}
                        options={options}
                        setOptions={setOptions}>
                        </AnnotationForm>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAnnoOpen(false)} color="secondary">
                            Close
                        </Button>
                        <Button onClick={() => addAnnotation()} color="primary" className="create-anno">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
                <List sx={{mx: '1em'}}>
                    {annotationList.map((annotation, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={annotation.annotationName}
                            />
                            <IconButton
                                onClick={() => editAnnotation(index)}
                            >
                                <Edit />
                            </IconButton>
                            <IconButton
                                onClick={() => deleteAnnotation(index)}
                            >
                                <Delete />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
                <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setAnnoOpen(true)}
                        sx={{mx: '1em'}}
                    >
                        Add Annotation
                    </Button>
            </Drawer>
        </div>
    );
};

export default OptionsSidebar;
