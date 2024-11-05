import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const ImageInputModal = ({ open, onClose, onImageUpload, imageCapable }) => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const handlePaste = (event) => {
      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          setFile(file);
        }
      }
    };

    if (open && imageCapable) {
      window.addEventListener('paste', handlePaste);
    } else {
      window.removeEventListener('paste', handlePaste);
    }

    // Cleanup on component unmount or modal close
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [open, imageCapable]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload(reader.result);
        onClose();
      };
      reader.readAsDataURL(file);
    } else if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          onImageUpload(reader.result);
          onClose();
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error fetching image from URL:', error);
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setImageUrl('');
    onImageUpload('');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      {imageCapable ? (
        <>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogContent>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <IconButton color="primary" component="span">
                <PhotoCamera />
              </IconButton>
              Upload an image
            </label>
            <TextField
              label="Paste Image or Image Link"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              fullWidth
              margin="normal"
            />
            {file && (
              <div>
                <img
                  src={URL.createObjectURL(file)}
                  alt="Pasted"
                  style={{ maxWidth: '100%', maxHeight: '300px', display: 'block' }}
                />
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClear} color="secondary">
              Clear
            </Button>
            <Button onClick={onClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleUpload} color="primary">
              Insert
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>Image Input Unavailable</DialogTitle>
          <DialogContent>
            <p>This model is not capable of image input.</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ImageInputModal;
