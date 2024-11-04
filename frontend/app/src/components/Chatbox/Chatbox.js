import {Box, CircularProgress, Collapse, IconButton, Paper, Stack, TextField} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import AnnotationButton from "../annotations/AnnotationButton";
import AnnotationDetails from "../annotations/AnnotationDetails";
import React, {useEffect, useRef, useState} from "react";
import {Checklist, Edit, History, RadioButtonChecked, TagFaces, TextSnippet, ThumbsUpDown} from "@mui/icons-material";

const Chatbox = ({messages, messageStates, setMessageStates, annotationList, isEditing, setIsEditing, isSending, openReverseModal}) => {
    const [editValue, setEditValue] = useState('');
    const chatBoxRef = useRef(null);

    const annoIcons = {
        binary: <ThumbsUpDown></ThumbsUpDown>,
        likert: <TagFaces></TagFaces>,
        select: <RadioButtonChecked></RadioButtonChecked>,
        multi_select: <Checklist></Checklist>,
        text: <TextSnippet></TextSnippet>,
        post_edit: <Edit></Edit>,
        reverse: <History></History>
    };

    useEffect(() => {
        // Scroll to the bottom of the chat box when messages change
        chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleEditClick = (index) => {
        setIsEditing(true);
        setEditValue(messages[index].content[0].text);
    };

    const clickAnno = (annotation, index) => {
        if (annotation.annotationType === 'post_edit') {
            handleEditClick(index);
        } else if (annotation.annotationType === 'reverse') {
            openReverseModal(index);
        } else {
            setMessageStates(prevState => {
                return prevState.map((state, idx) => {
                    if (idx === index) {
                        return {
                            ...state,
                            expanded: !state.expanded,
                            annotation: state.expanded ? null : annotation,
                        };
                    } else {
                        return {
                            ...state,
                            expanded: false,
                        };
                    }
                });
            });
        }
    }

    const savePostEdit = (index) => {
        messages[index]['data']['pre-edit'] = messages[index].content[0].text;
        messages[index].content[0].text = editValue;
        setIsEditing(false);
    }

    const handleEditChange = (event) => {
        setEditValue(event.target.value);
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                overflowY: 'auto',
                padding: 1,
            }}
        >
            {messages.map((msg, index) => (
                <Stack
                    key={index}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: 1,
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', // Align items based on role
                    }}
                >
                    {/* Render the image if it exists */}
                    {msg.content.length > 1 && (
                        <img
                            style={{
                                maxWidth: '15em',
                                marginBottom: 1,
                                borderRadius: '8px',
                            }}
                            src={msg.content[1]['image_url']['url']}
                            alt=''
                        />
                    )}
                <Box
                   sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        width: 'auto',
                    }}
                >
                    <Stack>
                        {index === messages.length - 1 && isEditing ? (
                        <Box width={'100%'}>
                            <TextField
                                fullWidth
                                multiline
                                defaultValue={msg.content[0].text}
                                content={editValue}
                                onChange={handleEditChange}
                        /><Stack direction={"row"}>
                            <IconButton onClick={() => setIsEditing(false)}><CloseIcon></CloseIcon></IconButton>
                            <IconButton onClick={() => savePostEdit(index)}><CheckIcon></CheckIcon></IconButton></Stack>
                        </Box>
                      ) : (
                    <Paper
                        sx={{
                            maxWidth: '25em',
                            padding: 1,
                            borderRadius: 2,
                            backgroundColor: msg.role === 'user' ? 'primary.main' : 'grey.300',
                            color: msg.role === 'user' ? 'white' : 'black',
                        }}
                        ref={msg.role === 'user' ? null : chatBoxRef}
                    >
                        {msg.content[0].text}
                    </Paper>)}
                        <Stack sx={{maxWidth: '25em'}} direction="row">
                            {annotationList.map((annotation, idx) => (annotation &&
                                (annotation.affectedMessages === 'both' || msg.role === annotation.affectedMessages) &&
                                (annotation.annotationType !== "post_edit" &&
                                <AnnotationButton key={idx + index} startIcon={annoIcons[annotation.annotationType]} onClick={() => clickAnno(annotation, index)}></AnnotationButton>) ||
                                (index === (messages.length - 1) && annotation.annotationType === "post_edit" && <AnnotationButton key={idx + index} startIcon={annoIcons[annotation.annotationType]} onClick={() => clickAnno(annotation, index)}></AnnotationButton>)
                                ))}
                        </Stack>
                        {messageStates.length > index && messageStates[index].expanded && messageStates[index].annotation && messageStates[index].annotation.annotationType !== 'post_edit' &&
                            messageStates[index].annotation.annotationType !== 'reverse' &&
                            <Collapse in={messageStates[index].expanded} timeout='auto'>
                            <AnnotationDetails
                                sx={{maxWidth: '25em'}}
                                data={messages[index]['data']}
                                annotationType={messageStates[index].annotation.annotationType}
                                annotation_question={messageStates[index].annotation.question}
                                annotation_options={messageStates[index].annotation.options}
                                annotationName={messageStates[index].annotation.annotationName}
                                setMessageStates={setMessageStates}
                                index={index}
                                explanationRequired={messageStates[index].annotation.requireExplanation}>
                            </AnnotationDetails></Collapse>}
                    </Stack>
                </Box>
                </Stack>
            ))}
            {isSending && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <CircularProgress />
                </Box>
            )}
        </Box>
    )
}

export default Chatbox