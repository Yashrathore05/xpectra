import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const AnalyticsContext = createContext();

export const useAnalytics = () => useContext(AnalyticsContext);

export const AnalyticsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [sites, setSites] = useState([]);
  const [currentSite, setCurrentSite] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [timeRange, setTimeRange] = useState({
    value: 'last-7-days',
    label: 'Last 7 Days',
    start: null,
    end: null
  });

  // Load sites when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSites();
    } else {
      // Reset state when user logs out
      setSites([]);
      setCurrentSite(null);
      setMetrics(null);
    }
  }, [isAuthenticated]);

  // Load metrics when site or time range changes
  useEffect(() => {
    if (currentSite && timeRange) {
      fetchMetrics();
    } else {
      setMetrics(null);
    }
  }, [currentSite, timeRange]);

  // Fetch all sites
  const fetchSites = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/sites');
      setSites(response.data);
      
      // Set the first site as current if none is selected
      if (response.data.length > 0 && !currentSite) {
        setCurrentSite(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching sites:', err);
      setError(err.response?.data?.message || 'Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics metrics for the current site and time range
  const fetchMetrics = async () => {
    if (!currentSite) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = { timeRange: timeRange.value };
      
      if (timeRange.start && timeRange.end) {
        params.startDate = timeRange.start;
        params.endDate = timeRange.end;
      }
      
      const response = await axios.get(`/api/analytics/${currentSite._id}`, { params });
      setMetrics(response.data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Create a new site
  const createSite = async (siteData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/sites', siteData);
      const newSite = response.data;
      
      setSites([...sites, newSite]);
      setCurrentSite(newSite);
      return newSite;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create site';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Update an existing site
  const updateSite = async (siteData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/api/sites/${siteData._id}`, siteData);
      const updatedSite = response.data;
      
      setSites(sites.map(site => site._id === updatedSite._id ? updatedSite : site));
      
      if (currentSite && currentSite._id === updatedSite._id) {
        setCurrentSite(updatedSite);
      }
      
      return updatedSite;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update site';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Delete a site
  const deleteSite = async (siteId) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/sites/${siteId}`);
      
      const updatedSites = sites.filter(site => site._id !== siteId);
      setSites(updatedSites);
      
      if (currentSite && currentSite._id === siteId) {
        setCurrentSite(updatedSites.length > 0 ? updatedSites[0] : null);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete site';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Set the current site
  const selectSite = (siteId) => {
    const site = sites.find(s => s._id === siteId);
    setCurrentSite(site || null);
  };

  // Change the time range
  const changeTimeRange = (newRange) => {
    setTimeRange(newRange);
  };

  // Regenerate tracking code
  const regenerateTrackingCode = async (siteId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/sites/${siteId}/regenerate-code`);
      const updatedSite = response.data;
      
      setSites(sites.map(site => site._id === updatedSite._id ? updatedSite : site));
      
      if (currentSite && currentSite._id === updatedSite._id) {
        setCurrentSite(updatedSite);
      }
      
      return updatedSite.trackingCode;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to regenerate tracking code';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh metrics data
  const refreshMetrics = () => {
    fetchMetrics();
  };

  // Export data as CSV
  const exportData = async (type) => {
    if (!currentSite) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = { 
        timeRange: timeRange.value,
        type
      };
      
      if (timeRange.start && timeRange.end) {
        params.startDate = timeRange.start;
        params.endDate = timeRange.end;
      }
      
      const response = await axios.get(`/api/analytics/${currentSite._id}/export`, { 
        params,
        responseType: 'blob'
      });
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      
      link.href = url;
      link.setAttribute('download', `${currentSite.name}-${type}-${timeRange.value}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    sites,
    currentSite,
    metrics,
    timeRange,
    loading,
    error,
    fetchSites,
    fetchMetrics,
    createSite,
    updateSite,
    deleteSite,
    selectSite,
    changeTimeRange,
    regenerateTrackingCode,
    refreshMetrics,
    exportData
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsContext; 