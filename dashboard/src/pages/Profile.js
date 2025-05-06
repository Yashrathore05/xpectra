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
  Avatar
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, updatePassword, loading } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    
    try {
      await updateProfile(profileForm);
      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    if (newPassword !== confirmPassword) {
      return setPasswordError('New passwords do not match');
    }
    
    if (newPassword.length < 6) {
      return setPasswordError('Password must be at least 6 characters');
    }
    
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setNotification({
        open: true,
        message: 'Password updated successfully',
        severity: 'success'
      });
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Please log in to view your profile</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Profile
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  mr: 2,
                  bgcolor: 'primary.main'
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="h6" gutterBottom>
              Edit Profile
            </Typography>
            
            {profileError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {profileError}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleProfileSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                disabled
                helperText="Email cannot be changed"
              />
              
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handlePasswordSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Current Password"
                type="password"
                id="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="New Password"
                type="password"
                id="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
              />
              
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
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
    </Box>
  );
};

export default Profile; 