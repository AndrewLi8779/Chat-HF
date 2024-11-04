import React, {useState} from 'react';
import {Dialog, DialogTitle, DialogContent, IconButton, Box} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Tree from 'react-d3-tree';
import {findById, useCenteredTree} from "../../utils/Tree";
import SwapConvModal from "./SwapConvModal";

// Modal Component
const TreeModal = ({ open, onClose, treeData, messages, setMessages, messageStates, setMessageStates }) => {
    const [dimensions, translate, containerRef] = useCenteredTree();
    const [swapOpen, setSwapOpen] = useState(false);
    const [nodeConversation, setNodeConversation] = useState([]);
    const [selectedNodeID, setSelectedNodeID] = useState('')

    const onNodeClick = (e) => {
        if (e.parent && e.data.children.length === 0) {
            setSelectedNodeID(e.data.name);
            setNodeConversation(e.data.fullConversation);
            setSwapOpen(true);
        }
    }

    const swapConversation = () => {
        const currentNode = findById(treeData, 'current');
        currentNode.name = `${currentNode.messages[0].id}-${currentNode.messages[currentNode.messages.length - 1].id}`;
        currentNode.fullConversation = {messages: messages, messageStates: messageStates}

        setMessages(nodeConversation.messages);
        setMessageStates(nodeConversation.messageStates);
        const selectedNode = findById(treeData, selectedNodeID);
        selectedNode.name = 'current';

        setSwapOpen(false);
        onClose();
    }

    return (
        <Box>
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
          <DialogTitle>
            Tree View
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              style={{ position: 'absolute', right: '1em', top: '1em' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <div style={{ height: '20em' }} ref={containerRef}>
                <Tree
                    data={treeData}
                    dimensions={dimensions}
                    translate={translate}
                    orientation="vertical"
                    collapsible={false}
                    onNodeClick={onNodeClick}
                  />
            </div>
          </DialogContent>
        </Dialog>

        <SwapConvModal
            swapOpen={swapOpen}
            setSwapOpen={setSwapOpen}
            conversation={nodeConversation}
            swapConversation={swapConversation}
        ></SwapConvModal>
        </Box>
    );
};

export default TreeModal;
