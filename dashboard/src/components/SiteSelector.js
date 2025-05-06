import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAnalytics } from '../context/AnalyticsContext';

const SiteSelector = ({ fullWidth = false, size = 'medium' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { sites, currentSite, selectSite } = useAnalytics();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleSiteChange = (event) => {
    const siteId = event.target.value;
    selectSite(siteId);
  };

  const handleAddSite = () => {
    navigate('/sites/add');
    handleCloseMenu();
  };

  const handleSiteSettings = () => {
    if (currentSite) {
      navigate(`/sites/${currentSite._id}/settings`);
    }
    handleCloseMenu();
  };

  const handleOpenMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  if (sites.length === 0) {
    return (
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddSite}
        fullWidth={fullWidth}
        size={size}
      >
        Add Website
      </Button>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <FormControl fullWidth={fullWidth} size={size}>
        <InputLabel id="site-selector-label">Website</InputLabel>
        <Select
          labelId="site-selector-label"
          id="site-selector"
          value={currentSite ? currentSite._id : ''}
          label="Website"
          onChange={handleSiteChange}
          sx={{ minWidth: 200 }}
        >
          {sites.map((site) => (
            <MenuItem key={site._id} value={site._id}>
              {site.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {currentSite && (
        <Box sx={{ ml: 1 }}>
          <Tooltip title="Site Options">
            <IconButton
              size={size === 'small' ? 'small' : 'medium'}
              onClick={handleOpenMenu}
              aria-label="site options"
            >
              <SettingsIcon fontSize={size === 'small' ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleSiteSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Site Settings</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleAddSite}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add New Website</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      )}
    </Box>
  );
};

export default SiteSelector; 