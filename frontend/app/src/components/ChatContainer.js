// src/components/ChatContainer.js
import React, {useEffect, useRef, useState} from 'react';
import {
    Box,
    Container,
    IconButton, InputAdornment,
    Paper, TextField,
} from '@mui/material';
import {
    Delete, Mic, PhotoCamera,
    Save, Send,
    Upload
} from '@mui/icons-material';
import {initializeApp} from 'firebase/app';
import {arrayUnion, doc, getFirestore, updateDoc} from 'firebase/firestore';
import {findById, findMessageID, getLeafNodes} from "../utils/Tree";
import Chatbox from "./Chatbox/Chatbox";
import SaveModal from "./modals/SaveModal";
import LoadModal from "./modals/LoadModal";
import ResetModal from "./modals/ResetModal";
import ReverseModal from "./modals/ReverseModal";
import ImageInputModal from "./modals/ImageInputModal";
import {LiveAudioVisualizer} from "react-audio-visualize";


const ChatContainer = ({closeNav, annotationList, config, conversationTree, messages, setMessages, messageStates, setMessageStates}) => {
    const speechsdk = require('microsoft-cognitiveservices-speech-sdk');

    const [isVoiceToggleOn, setIsVoiceToggleOn] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [confirmOpen, setSaveOpen] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [resetOpen, setResetOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [reverseOpen, setReverseOpen] = useState(false);
    const [reverseIndex, setReverseIndex] = useState(0);
    const [base64Image, setBase64Image] = useState('');
    const [messageID, setMessageID] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [imageOpen, setImageOpen] = useState(false);
    const [player, updatePlayer] = useState({p: undefined, muted: false});

    const [currentHeadID] = useState('current');

    const incrementID = () => setMessageID(prevID => prevID + 1);

    const inputRef = useRef(null);
    const speechConfig = useRef(null);
    const isVoiceToggleOnRef = useRef(isVoiceToggleOn);
    const visualizerRef = useRef(null);
    const firebaseApp = useRef(null);
    const db = useRef(null);

    useEffect(() => {
        const firebaseConfig = {
            databaseURL: config['firebaseURL'],
            projectId: config['firebaseProjectId'],
        };

        firebaseApp.current = initializeApp(firebaseConfig);
        db.current = getFirestore(firebaseApp.current);
    }, []);

        useEffect(() => {
        fetch('api/getspeechkey', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'            },
        })
        .then(r => r.json())
        .then(async r => {
            speechConfig.current = speechsdk.SpeechConfig.fromSubscription(r.azure_speech_key, r.azure_speech_region);
            speechConfig.current.speechRecognitionLanguage = 'en-US';
        });
    }, []);

    useEffect(() => {
        if (isVoiceToggleOn) {
            handleVoiceInput();
        }
    }, [isVoiceToggleOn]);

    useEffect(() => {
        isVoiceToggleOnRef.current = isVoiceToggleOn;
    }, [isVoiceToggleOn]);

    useEffect(() => {
        // Ensure this only triggers after a message is added by the assistant
        if (isVoiceToggleOn && !config['press-to-talk'] && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
                handleVoiceInput();
            }
        } else if (isVoiceToggleOn && config['press-to-talk']) {
            handleVoiceToggle();
        }
    }, [messages, isVoiceToggleOn]);

    const openReverseModal = (index) => {
        setReverseOpen(true)
        setReverseIndex(index);
    };

    const handleOpenImageModal = () => {
        setImageOpen(true);
    };

    const handleCloseImageModal = () => {
        setImageOpen(false);
    };

    const handleImageUpload = (base64) => {
        setBase64Image(base64);
    };

    const sttFromMic = () => {
        return new Promise((resolve, reject) => {
            const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
            const recognizer = new speechsdk.SpeechRecognizer(speechConfig.current, audioConfig);

            recognizer.recognizeOnceAsync(result => {
                if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
                    resolve(result.text); // Resolve the Promise with the recognized text
                } else {
                    reject(new Error(result.errorDetails)); // Reject the Promise on error
                }
                recognizer.close();
            }, error => {
                reject(error); // Reject the Promise on error
                recognizer.close();
            });
        });
    };

    const textToSpeech = (textToSpeak) => {
        return new Promise( (resolve, reject) => {
            const myPlayer = new speechsdk.SpeakerAudioDestination();
            updatePlayer(p => {
                p.p = myPlayer;
                return p;
            });
            const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(player.p);
            let synthesizer = new speechsdk.SpeechSynthesizer(speechConfig.current, audioConfig);

            synthesizer.speakTextAsync(
                textToSpeak,
                async result => {
                    if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
                        // ticks to milliseconds
                        await new Promise(resolve => setTimeout(resolve, result.audioDuration / 10000));
                        resolve(); // Resolve the Promise when TTS is done
                    } else if (result.reason === speechsdk.ResultReason.Canceled) {
                        reject(new Error(result.errorDetails)); // Reject the Promise on error
                    }
                    synthesizer.close();
                    synthesizer = undefined;
                },
                function (err) {
                    synthesizer.close();
                    synthesizer = undefined;
                    reject(err); // Reject the Promise on error
                }
            );
        });
    };

    const handleVoiceToggle = () => {
        if (isVoiceToggleOn) {
            setIsVoiceToggleOn(false);
            mediaRecorder?.stop();
            setMediaRecorder(null);
        } else {
            // Start voice input
            setIsVoiceToggleOn(true);
        }
    };

    const handleVoiceInput = () => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(async stream => {
                const recorder = new MediaRecorder(stream);
                setMediaRecorder(recorder);
                recorder.start();
                let result = '';
                let retryCount = 0;
                const maxRetries = 10;
                let isStopped = false;

                const processAudio = async () => {
                    while (retryCount < maxRetries) {
                        if (!isVoiceToggleOnRef.current) {
                            // Stop the recorder and exit the loop
                            recorder.stop();
                            setMediaRecorder(null);
                            isStopped = true;
                            return;
                        }

                        try {
                            result = await sttFromMic();
                            if (result !== '') {
                                recorder.stop();
                                setMediaRecorder(null);
                                if (isVoiceToggleOn) {
                                    handleSendButton(result);
                                }
                                return;
                            }
                        } catch (error) {
                            console.warn(`Retry ${retryCount + 1} failed: ${error.message}`);
                            retryCount++;
                            if (retryCount >= maxRetries) {
                                setIsVoiceToggleOn(false);
                            }
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }

                    // If maximum retries reached and not stopped, handle the result
                    if (!isStopped) {
                        recorder.stop();
                        setMediaRecorder(null);
                        handleSendButton(result);
                    }
                };

                await processAudio();
            })
            .catch(err => {
                console.error('Microphone access denied by user', err);
            });
    };

    const handleReverse = () => {
        const reverseID = messages[reverseIndex].id;
        const split = findMessageID(conversationTree, reverseID);
        const currentNode = findById(conversationTree, currentHeadID);
        currentNode.name = `${currentNode.messages[0].id}-${currentNode.messages[currentNode.messages.length - 1].id}`;
        currentNode.fullConversation = {messages: messages, messageStates: messageStates}
        if (split.messages[split.messages.length - 1].id === reverseID) {
            split.children.push({
               name: 'current',
               messages: [],
               children: [],
               fullConversation: {},
            });
        } else if (!split.children || split.children.length === 0) {
            let splitIndex = split.messages.findIndex(msg => msg.id === reverseID);
            split.children.push({
                name: `${split.messages[splitIndex + 1].id}-${split.messages[split.messages.length - 1].id}`,
                messages: split.messages.slice(splitIndex + 1),
                children: [],
                fullConversation: currentNode.fullConversation});
            split.messages = split.messages.slice(0, splitIndex + 1);
            split.children.push({
                name: 'current',
                messages: [],
                children: [],
                fullConversation: {},
            });
            split.name = `${split.messages[0].id}-${split.messages[split.messages.length - 1].id}`
        } else {
            let splitIndex = split.messages.findIndex(msg => msg.id === reverseID);
            let oldChildren = [...split.children];
            split.children = [{
                name: `${split.messages[splitIndex + 1].id}-${split.messages[split.messages.length - 1].id}`,
                messages: split.messages.slice(splitIndex + 1),
                children: [...oldChildren],
                fullConversation: {},
            }]
            split.children.push({
                name: 'current',
                messages: [],
                children: [],
                fullConversation: {}
            })
            split.messages = split.messages.slice(0, splitIndex + 1);
            split.name = `${split.messages[0].id}-${split.messages[split.messages.length - 1].id}`
        }
        setMessages(messages.slice(0, reverseIndex + 1));
        setMessageStates(messageStates.slice(0, reverseIndex + 1));
        setReverseOpen(false);
        // Handle sending the last user message if applicable
        if (messages[reverseIndex].role === 'user') {
            handleSendButton(messages[reverseIndex].content[0].text, true);
        }
    };

    const handleSendButton = (input_text=chatInput, reverse=false) => {
        if (input_text.trim() === '') return;
        let input = [];
        if (base64Image) {
            input = [
                {
                  "type": "text",
                  "text": input_text
                },
                {
                  "type": "image_url",
                  "image_url": {
                      "url": base64Image,
                  }
                }
            ]
            setBase64Image(null);
        } else {
            input = [{
                  "type": "text",
                  "text": input_text
            }];
        }
       setMessages(prevMessages => {
            if (reverse) {
                return prevMessages.slice(0, reverseIndex + 1);
            } else {
                return [
                    ...prevMessages,
                    { id: messageID, role: 'user', content: input, data: {} }
                ];
            }
        });

        incrementID();

        setMessageStates(prevStates => {
            if (reverse) {
                return prevStates.slice(0, reverseIndex + 1);
            } else {
                return [
                    ...prevStates,
                    { annotation: null, expanded: false }
                ];
            }
        });

        findById(conversationTree, currentHeadID).messages.push( { id: messageID, role: 'user', content: input, data: {} });

        setChatInput('');
        setIsSending(true);
        // Call API to get the bot response
        fetch('api/predict', {
            method: 'POST',
            body: JSON.stringify({
                'history': [...messages, { role: 'user', content: input, 'data': {} }],
                'model': config['model_list'].find(model => model.modelTitle === config['model_name']),
                'sys_prompt': config['system_prompt'],
                'memory_len': config['mem_len'],
                'diversity': config['temp'],
                'timeout': config['timeout']
            }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(r => r.json())
        .then(async r => {
            const botMsg = r.response;
            setMessages(prevMessages => {
                    return [
                        ...prevMessages,
                        { id: messageID + 1, role: 'assistant', content: [{ "type": "text", "text": botMsg }], data: {} }
                    ];
            });

            findById(conversationTree, currentHeadID).messages.push( { id: messageID + 1, role: 'assistant', content: [{ "type": "text", "text": botMsg }], data: {} } );

            incrementID();

            setMessageStates(prevStates => {
                    return [
                        ...prevStates,
                        { annotation: null, expanded: false }
                    ];
            });
            if (isVoiceToggleOn) {
                await textToSpeech(botMsg);
            }

            setIsSending(false);

            if (inputRef.current) {
                inputRef.current.focus();  // Focus the text field
            }
        })
        .catch(err => {
            console.error('Error:', err);
            setIsSending(false);
        });
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendButton();
        }
    };

    const handleSaveChat = async () => {
        setSaveOpen(false)
        let download = []
        const tree_leafs = getLeafNodes(conversationTree)
        for (let i = 0; i < tree_leafs.length; i++) {
            if (tree_leafs[i].name !== 'current') {
                conversations.push({
                    'messages': tree_leafs[i].fullConversation.messages,
                    'success': tree_leafs[i].fullConversation.success
                });
            }
        }
        conversations.push({'messages': messages, 'success': true});
        for (let i = 0; i < conversations.length; i++) {
            download.push({'conv_id': i, 'conversation': conversations[i]['messages'], 'success': conversations[i].success});
        }

        if (config['database']) {
            const docRef = doc(db.current, 'cooking-chatbot', 'chat-history');
            await updateDoc(docRef, {
                ['session-1']: arrayUnion({
                    "annotations": JSON.stringify(download, null, 2),
                    "conversation_tree": JSON.stringify(conversationTree),
                    "time_submitted": new Date().toLocaleString()
                })
            });
        } else {
            download.push({'conversation_tree': conversationTree});
            // indent by 2 spaces
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(download, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "chat.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
        resetChatBox();
    };

    const handleLoadChat = () => {
        setUploadOpen(false)
        const fileInput = document.getElementById('formFile');
        if (fileInput.files.length <= 0) return;

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const result = JSON.parse(e.target.result);
            setMessages(result[result.length - 1]['conversation']);
            setMessageStates(new Array(result[result.length - 1]['conversation'].length).fill({annotation: null, expanded: false}))
        };
        reader.readAsText(file);
    };

    const resetChatBox = () => {
        setResetOpen(false);
        setMessages([]);
        setIsVoiceToggleOn(false);
        setChatInput('');
        setIsSending(false);
        setBase64Image('');
        setMessageStates([]);
        setIsEditing(false);
    };

    return (
        <div style={{height: "99%"}}>
            <SaveModal
                confirmOpen={confirmOpen}
                setSaveOpen={setSaveOpen}
                handleSaveChat={handleSaveChat}
            ></SaveModal>

            <LoadModal
                uploadOpen={uploadOpen}
                setUploadOpen={setUploadOpen}
                handleLoadChat={handleLoadChat}
            ></LoadModal>

            <ResetModal
                resetOpen={resetOpen}
                setResetOpen={setResetOpen}
                resetChatBox={resetChatBox}
            ></ResetModal>

            <ReverseModal
                reverseOpen={reverseOpen}
                setReverseOpen={setReverseOpen}
                handleReverse={handleReverse}
            ></ReverseModal>

            <ImageInputModal
                open={imageOpen}
                onClose={handleCloseImageModal}
                onImageUpload={handleImageUpload}
            />

        <Container
            maxWidth={false} // Disable default maxWidth
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
              }}
            onClick={closeNav}
        >
            <Paper
                elevation={3}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                }}
            >
                {/* Chatbox header */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        maxHeight: '14%',
                    }}
                >
                    <IconButton color="error" onClick={() => setResetOpen(true)}>
                        <Delete />
                    </IconButton>
                    <Box>
                        <IconButton color="info" onClick={() => setUploadOpen(true)}>
                            <Upload />
                        </IconButton>
                        <IconButton color="success" onClick={() => setSaveOpen(true)}>
                            <Save />
                        </IconButton>
                    </Box>
                </Box>

                <Chatbox
                    messages={messages}
                    messageStates={messageStates}
                    setMessageStates={setMessageStates}
                    annotationList={annotationList}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    isSending={isSending}
                    openReverseModal={openReverseModal}
                ></Chatbox>

                {/* Chat Input */}
                <Box
                    sx={{
                        padding: 1,
                        display: 'flex',
                        alignItems: 'center',
                        height: '10%',
                    }}
                >

                    {!isVoiceToggleOn ? (
                    <TextField
                        variant="outlined"
                        placeholder="Type a message..."
                        fullWidth
                        autoComplete='off'
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSending}
                        sx={{ marginRight: 1 }}
                        ref={inputRef}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                  {base64Image ? (
                                    <IconButton
                                      color="primary"
                                      onClick={handleOpenImageModal}
                                      sx={{
                                        p: 0,
                                        width: 40,
                                        height: 40,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      <img
                                        src={base64Image}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                    </IconButton>
                                  ) : (
                                    <IconButton color="primary" onClick={handleOpenImageModal}>
                                      <PhotoCamera />
                                    </IconButton>
                                  )}
                                </InputAdornment>
                            ),
                          }}
                    />
                    ) : (<Box ref={visualizerRef} sx={{ flexGrow: 1}} className='audiovisualizer-container'>
                        {visualizerRef.current && mediaRecorder && <LiveAudioVisualizer
                            barWidth={1}
                            width={visualizerRef.current.offsetWidth}
                            height={visualizerRef.current.offsetHeight}
                          mediaRecorder={mediaRecorder}
                        />}
                        </Box>)
                    }
                    <IconButton onClick={handleVoiceToggle} color={isVoiceToggleOn ? 'secondary' : 'default'}>
                        <Mic />
                    </IconButton>
                    <IconButton
                        color="primary"
                        sx={{
                            borderRadius: '50%',
                            marginLeft: 1,
                            backgroundColor: 'background.paper',
                        }}
                        onClick={() => handleSendButton()}
                    >
                        <Send />
                    </IconButton>
                </Box>
            </Paper>
        </Container>
        </div>
    );
};

export default ChatContainer;
