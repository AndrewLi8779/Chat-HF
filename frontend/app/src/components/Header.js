// src/components/Header.js
import React, {useState} from 'react';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import MapIcon from '@mui/icons-material/Map';
import {IconButton} from "@mui/material";
import TreeModal from "./modals/TreeModal";

const Header = ({ closeNav, toggleNav, conversationTree, messages, setMessages, messageStates, setMessageStates}) => {
    const [treeOpen, setTreeOpen] = useState(false);
    return (
        <header onClick={closeNav}>
            {/* Tree Modal */}
            <TreeModal
                open={treeOpen}
                onClose={() => setTreeOpen(false)}
                treeData={conversationTree}
                messages={messages}
                setMessages={setMessages}
                messageStates={messageStates}
                setMessageStates={setMessageStates}
            />
            <Box display={"flex"} justifyContent={"space-between"}>
                <IconButton sx={{marginLeft: '1em'}} onClick={toggleNav} className="side-bar">
                    <MenuIcon />
                </IconButton>
                <h1>Chatbot</h1>
                <IconButton sx={{marginRight: '1em'}} onClick={() => setTreeOpen(true)}><MapIcon></MapIcon></IconButton>
            </Box>
        </header>);
}

export default Header;
