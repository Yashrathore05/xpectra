import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Divider,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useAnalytics } from '../context/AnalyticsContext';

const SiteSettings = () => {
  const { currentSite, updateSite, deleteSite, regenerateTrackingCode } = useAnalytics();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    allowedOrigins: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [trackingCode, setTrackingCode] = useState('');

  useEffect(() => {
    if (currentSite) {
      setFormData({
        name: currentSite.name || '',
        domain: currentSite.domain || '',
        allowedOrigins: currentSite.allowedOrigins ? currentSite.allowedOrigins.join(', ') : '',
      });
      setTrackingCode(currentSite.trackingCode || '');
    }
  }, [currentSite]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const allowedOrigins = formData.allowedOrigins
        .split(',')
        .map(origin => origin.trim())
        .filter(origin => origin);
        
      await updateSite({
        ...currentSite,
        name: formData.name,
        domain: formData.domain,
        allowedOrigins
      });
      
      setNotification({
        open: true,
        message: 'Site settings updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || 'Failed to update site settings',
        severity: 'error'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSite(currentSite._id);
      setDeleteDialogOpen(false);
      setNotification({
        open: true,
        message: 'Site deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || 'Failed to delete site',
        severity: 'error'
      });
    }
  };

  const handleRegenerateCode = async () => {
    try {
      const newCode = await regenerateTrackingCode(currentSite._id);
      setTrackingCode(newCode);
      setNotification({
        open: true,
        message: 'Tracking code regenerated successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || 'Failed to regenerate tracking code',
        severity: 'error'
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setNotification({
      open: true,
      message: 'Copied to clipboard',
      severity: 'success'
    });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (!currentSite) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Please select a site to manage</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Site Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Site Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="domain"
                label="Domain"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                helperText="Example: example.com (without http/https)"
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="allowedOrigins"
                label="Allowed Origins"
                name="allowedOrigins"
                value={formData.allowedOrigins}
                onChange={handleChange}
                helperText="Comma separated list of allowed origins (e.g., https://example.com, https://sub.example.com)"
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Danger Zone
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ width: '100%' }}
            >
              Delete Site
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tracking Code
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add this code to your website to start tracking visitors.
            </Typography>
            
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, position: 'relative', mb: 2 }}>
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => copyToClipboard(trackingCode)}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {trackingCode}
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              onClick={handleRegenerateCode}
              sx={{ mt: 1 }}
            >
              Regenerate Tracking Code
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{"Are you sure you want to delete this site?"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. All analytics data associated with this site will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SiteSettings; 