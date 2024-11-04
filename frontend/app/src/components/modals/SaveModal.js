import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import React from "react";

const SaveModal = ({confirmOpen, setSaveOpen, handleSaveChat}) => {
    return (
        <Dialog open={confirmOpen} onClose={() => setSaveOpen(false)}>
            <DialogTitle>Confirm</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you're ready to save this conversation? <br />
                    Once you save, the chat history will be cleared!
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setSaveOpen(false)} color="secondary">
                    Close
                </Button>
                <Button onClick={() => handleSaveChat()} color="primary" className="save-chat">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SaveModal
