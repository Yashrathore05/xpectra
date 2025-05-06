import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '/api';

// Analytics API functions
export const analytics = {
  // Get site overview data
  getOverview: async (siteId, period = '7d') => {
    try {
      const response = await axios.get(`/analytics/overview/${siteId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching overview data:', error);
      throw error;
    }
  },
  
  // Get realtime data
  getRealtime: async (siteId) => {
    try {
      const response = await axios.get(`/analytics/realtime/${siteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching realtime data:', error);
      throw error;
    }
  },
  
  // Get pageviews data
  getPageviews: async (siteId, period = '7d', limit = 50) => {
    try {
      const response = await axios.get(`/analytics/pageviews/${siteId}?period=${period}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pageviews data:', error);
      throw error;
    }
  },
  
  // Get referrers data
  getReferrers: async (siteId, period = '7d', limit = 20) => {
    try {
      const response = await axios.get(`/analytics/referrers/${siteId}?period=${period}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching referrers data:', error);
      throw error;
    }
  },
  
  // Get locations data
  getLocations: async (siteId, period = '7d') => {
    try {
      const response = await axios.get(`/analytics/locations/${siteId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching locations data:', error);
      throw error;
    }
  },
  
  // Get devices data
  getDevices: async (siteId, period = '7d') => {
    try {
      const response = await axios.get(`/analytics/devices/${siteId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching devices data:', error);
      throw error;
    }
  },
  
  // Get browsers data
  getBrowsers: async (siteId, period = '7d') => {
    try {
      const response = await axios.get(`/analytics/browsers/${siteId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching browsers data:', error);
      throw error;
    }
  },
  
  // Get events data
  getEvents: async (siteId, period = '7d') => {
    try {
      const response = await axios.get(`/analytics/events/${siteId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events data:', error);
      throw error;
    }
  },
  
  // Get visitors data
  getVisitors: async (siteId, period = '7d') => {
    try {
      const response = await axios.get(`/analytics/visitors/${siteId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching visitors data:', error);
      throw error;
    }
  },
  
  // Get sessions data
  getSessions: async (siteId, period = '7d') => {
    try {
      const response = await axios.get(`/analytics/sessions/${siteId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions data:', error);
      throw error;
    }
  },
  
  // Export data
  exportData: async (siteId, format = 'json', period = '7d', type = 'pageviews') => {
    try {
      const response = await axios.get(
        `/analytics/export/${siteId}?format=${format}&period=${period}&type=${type}`,
        { responseType: format === 'csv' ? 'blob' : 'json' }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },
  
  // Custom query
  customQuery: async (siteId, query) => {
    try {
      const response = await axios.post(`/analytics/custom/${siteId}`, { query });
      return response.data;
    } catch (error) {
      console.error('Error executing custom query:', error);
      throw error;
    }
  }
};

// Sites API functions
export const sites = {
  // Get all sites
  getAllSites: async () => {
    try {
      const response = await axios.get('/sites');
      return response.data;
    } catch (error) {
      console.error('Error fetching sites:', error);
      throw error;
    }
  },
  
  // Get site by ID
  getSiteById: async (siteId) => {
    try {
      const response = await axios.get(`/sites/${siteId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching site ${siteId}:`, error);
      throw error;
    }
  },
  
  // Create new site
  createSite: async (siteData) => {
    try {
      const response = await axios.post('/sites', siteData);
      return response.data;
    } catch (error) {
      console.error('Error creating site:', error);
      throw error;
    }
  },
  
  // Update site
  updateSite: async (siteId, siteData) => {
    try {
      const response = await axios.put(`/sites/${siteId}`, siteData);
      return response.data;
    } catch (error) {
      console.error(`Error updating site ${siteId}:`, error);
      throw error;
    }
  },
  
  // Delete site
  deleteSite: async (siteId) => {
    try {
      const response = await axios.delete(`/sites/${siteId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting site ${siteId}:`, error);
      throw error;
    }
  },
  
  // Regenerate API key
  regenerateApiKey: async (siteId) => {
    try {
      const response = await axios.post(`/sites/${siteId}/regenerate-api-key`);
      return response.data;
    } catch (error) {
      console.error(`Error regenerating API key for site ${siteId}:`, error);
      throw error;
    }
  },
  
  // Get site team members
  getTeamMembers: async (siteId) => {
    try {
      const response = await axios.get(`/sites/${siteId}/team`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching team members for site ${siteId}:`, error);
      throw error;
    }
  },
  
  // Add team member
  addTeamMember: async (siteId, memberData) => {
    try {
      const response = await axios.post(`/sites/${siteId}/team`, memberData);
      return response.data;
    } catch (error) {
      console.error(`Error adding team member to site ${siteId}:`, error);
      throw error;
    }
  },
  
  // Update team member
  updateTeamMember: async (siteId, memberId, memberData) => {
    try {
      const response = await axios.put(`/sites/${siteId}/team/${memberId}`, memberData);
      return response.data;
    } catch (error) {
      console.error(`Error updating team member ${memberId} for site ${siteId}:`, error);
      throw error;
    }
  },
  
  // Remove team member
  removeTeamMember: async (siteId, memberId) => {
    try {
      const response = await axios.delete(`/sites/${siteId}/team/${memberId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing team member ${memberId} from site ${siteId}:`, error);
      throw error;
    }
  }
}; 