import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

const ResetModal = ({resetOpen, setResetOpen, resetChatBox}) => {
    return (
        <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
            <DialogTitle>Reset</DialogTitle>
            <DialogContent>
                <DialogContentText>Are you sure you want to reset the chat?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setResetOpen(false)} color="secondary">
                    Close
                </Button>
                <Button onClick={() => resetChatBox()} color="primary" className="reset-chat">
                    Reset
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ResetModal