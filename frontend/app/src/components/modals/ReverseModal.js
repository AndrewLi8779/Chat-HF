import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import React from "react";

const ReverseModal = ({reverseOpen, setReverseOpen, handleReverse}) => {
    return (
        <Dialog open={reverseOpen} onClose={() => setReverseOpen(false)}>
            <DialogTitle>Reverse</DialogTitle>
            <DialogContent>
                <DialogContentText>Are you sure you want to reverse the chat?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setReverseOpen(false)} color="secondary">
                    Close
                </Button>
                <Button onClick={() => handleReverse()} color="primary" className="reset-chat">
                    Reverse
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ReverseModal