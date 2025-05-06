import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AddSite from './pages/AddSite';
import SiteSettings from './pages/SiteSettings';

// Components
import Layout from './components/Layout';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Protected route component
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return null; // or a loading spinner
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Main App component
const AppContent = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sites/add" element={<AddSite />} />
          <Route path="/sites/:siteId/settings" element={<SiteSettings />} />
        </Route>
      </Route>
      
      {/* Redirect any unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Wrap app with providers
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AnalyticsProvider>
            <AppContent />
          </AnalyticsProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App; 