import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import React from "react";

const LoadModal = ({uploadOpen, setUploadOpen, handleLoadChat}) => {
    return (
        <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)}>
            <DialogTitle>Upload</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Upload the conversation json below. <br /> Warning: This will replace whatever chat history is currently displayed!
                </DialogContentText>
                <input className="form-control" type="file" accept="application/json" id="formFile" />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setUploadOpen(false)} color="secondary">
                    Close
                </Button>
                <Button onClick={() => handleLoadChat()} color="primary" className="load-chat">
                    Load
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default LoadModal