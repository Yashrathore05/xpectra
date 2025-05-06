import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import SiteSelector from './SiteSelector';

const drawerWidth = 240;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { sites, currentSite } = useAnalytics();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/login');
  };

  const navigateTo = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Xpectra Analytics
        </Typography>
      </Toolbar>
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <SiteSelector fullWidth size="small" />
      </Box>
      
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton 
            selected={location.pathname === '/' || location.pathname === '/dashboard'}
            onClick={() => navigateTo('/')}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        
        {currentSite && (
          <ListItem disablePadding>
            <ListItemButton 
              selected={location.pathname.includes(`/sites/${currentSite._id}/settings`)}
              onClick={() => navigateTo(`/sites/${currentSite._id}/settings`)}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Site Settings" />
            </ListItemButton>
          </ListItem>
        )}

        <ListItem disablePadding>
          <ListItemButton 
            selected={location.pathname === '/sites/add'}
            onClick={() => navigateTo('/sites/add')}
          >
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Add Website" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {currentSite && currentSite.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              color="inherit"
              onClick={handleUserMenuOpen}
              endIcon={<ArrowDropDownIcon />}
              startIcon={
                <Avatar 
                  sx={{ 
                    width: 28, 
                    height: 28,
                    bgcolor: 'primary.dark',
                    fontSize: '0.875rem'
                  }}
                >
                  {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              }
            >
              {user && user.name}
            </Button>
            
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => {
                handleUserMenuClose();
                navigate('/profile');
              }}>
                <ListItemIcon>
                  <AccountIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Toolbar /> {/* Spacer for fixed app bar */}
        <Outlet />
      </Box>
    </Box>
  );
} 