import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  Stepper,
  Step,
  StepLabel,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../context/AnalyticsContext';

const steps = ['Site Details', 'Add Tracking Code'];

const AddSite = () => {
  const navigate = useNavigate();
  const { createSite } = useAnalytics();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    allowedOrigins: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [newSite, setNewSite] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      setLoading(true);
      setError('');
      
      try {
        const allowedOrigins = formData.allowedOrigins
          .split(',')
          .map(origin => origin.trim())
          .filter(origin => origin);
          
        const site = await createSite({
          name: formData.name,
          domain: formData.domain,
          allowedOrigins
        });
        
        setNewSite(site);
        setActiveStep(activeStep + 1);
      } catch (err) {
        setError(err.message || 'Failed to create site');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleFinish = () => {
    navigate('/dashboard');
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

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" sx={{ mt: 3 }}>
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
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" paragraph>
              Great! Your site has been created. Now add the following tracking code to your website to start collecting data.
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Add this script tag to the head section of your HTML:
            </Typography>
            
            <Box 
              sx={{ 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1, 
                position: 'relative',
                mb: 3
              }}
            >
              <Button
                size="small"
                variant="outlined"
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => copyToClipboard(newSite?.trackingCode || '')}
              >
                Copy
              </Button>
              <Typography variant="body2" component="pre" sx={{ mt: 3, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {newSite?.trackingCode || ''}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              The tracking code should be added to every page you want to track. If you're using a website builder or CMS, add it to your site's header template.
            </Typography>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Add a New Website
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Paper sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            {activeStep !== 0 && (
              <Button
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
            )}
            
            <Box sx={{ flex: '1 1 auto' }} />
            
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleFinish : handleNext}
              disabled={loading || (activeStep === 0 && (!formData.name || !formData.domain))}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Box>
      
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
    </Container>
  );
};

export default AddSite; 