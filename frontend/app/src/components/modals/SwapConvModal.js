import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper} from "@mui/material";
import Chatbox from "../Chatbox/Chatbox";

const SwapConvModal = ({swapOpen, setSwapOpen, conversation, swapConversation}) => {

  return (
      <Dialog open={swapOpen} onClose={() => setSwapOpen(false)}>
        <DialogTitle>
            Do you want to return to this conversation?
        </DialogTitle>
        <DialogContent>
            <Paper
                sx={{
                    maxWidth: '70vw',
                    maxHeight: '60vh',
                    overflowY: 'auto',
                }}>
            <Chatbox
                messages={conversation.messages}
                messageStates={[]}
                annotationList={[]}
            ></Chatbox>
            </Paper>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setSwapOpen(false)} color="secondary">
                Close
            </Button>
            <Button onClick={swapConversation} color="primary">
                Go
            </Button>
        </DialogActions>
    </Dialog>
  );
}

export default SwapConvModal