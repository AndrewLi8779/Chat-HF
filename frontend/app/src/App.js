// src/components/App.js
import React, {useEffect, useState} from 'react';
import Header from './components/Header';
import ChatContainer from './components/ChatContainer';
import OptionsSidebar from "./components/OptionsSidebar";

function App() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [annotationList, setAnnotationList] = useState([]);
    const [config, setConfig] = useState( null);
    const [messages, setMessages] = useState([]);
    const [messageStates, setMessageStates] = useState([]);
    const [conversationTree, setConversationTree] = useState({name: 'current', messages: [], children: [], fullConversation: {}});

    useEffect(() => {
        fetch('/api/getdefaultconfig')
          .then(r => r.json())
          .then(r => {
              console.log(r)
            if (Object.keys(r).length === 0) {
              setConfig({
                'model_list': [{
                    type: 'API',
                    provider: 'Azure',
                    apiKey: 'env',
                    azureEndpoint: 'env',
                    modelTitle: 'GPT-3.5',
                    modelName: 'gpt-35-turbo',
                    imageCapable: false}],
                'model_name': 'GPT-3.5',
                'system_prompt': 'You are a helpful assistant',
                'temp': 0.7,
                'press-to-talk': false,
                'timeout': 4,
                'mem_len': 10,
                'database': false,
                'firebaseURL': '',
                'firebaseProjectId': ''
                });
            } else {
              setConfig(r);
              // Update the annotation list if available
                if (r.annotations) {
                    setAnnotationList(r.annotations);
                }
            }
          })
          .catch(error => {
            console.error("Error fetching config:", error);
            setConfig({
                'model_list': [{
                    type: 'API',
                    provider: 'Azure',
                    apiKey: 'env',
                    azureEndpoint: 'env',
                    modelTitle: 'GPT-3.5',
                    modelName: 'gpt-35-turbo',
                    imageCapable: false}],
                'model_name': 'GPT-3.5',
                'system_prompt': 'You are a helpful assistant',
                'temp': 0.7,
                'press-to-talk': false,
                'timeout': 4,
                'mem_len': 10,
                'database': false,
                'firebaseURL': '',
                'firebaseProjectId': ''
            });
          });
        }, []);

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    const closeNav = () => {
        if (isNavOpen) {
            setIsNavOpen(false);
        }
    };

    useEffect(() => {
        document.title = "Chat-HF Demo";
    });

    if (!config) {
        return
    }

    return (
        <div style={{height: '100%',}}>
            <Header
                closeNav={closeNav}
                toggleNav={toggleNav}
                conversationTree={conversationTree}
                messages={messages}
                setMessages={setMessages}
                messageStates={messageStates}
                setMessageStates={setMessageStates}
            />
            <OptionsSidebar
                isNavOpen={isNavOpen}
                toggleNav={toggleNav}
                setAnnotationList={setAnnotationList}
                annotationList={annotationList}
                config={config}
            />
            <ChatContainer
                closeNav={closeNav}
                annotationList={annotationList}
                config={config}
                conversationTree={conversationTree}
                setConversationTree={setConversationTree}
                messages={messages}
                setMessages={setMessages}
                messageStates={messageStates}
                setMessageStates={setMessageStates}
            />
        </div>
    );
}

export default App;
