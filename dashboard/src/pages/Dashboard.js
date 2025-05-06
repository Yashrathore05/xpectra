import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Paper, useTheme } from '@mui/material';
import { useAnalytics } from '../context/AnalyticsContext';
import VisitorsOverview from '../components/charts/VisitorsOverview';
import PageviewsChart from '../components/charts/PageviewsChart';
import DeviceDistribution from '../components/charts/DeviceDistribution';
import GeoDistribution from '../components/charts/GeoDistribution';
import TopPages from '../components/TopPages';
import ReferrersTable from '../components/ReferrersTable';

const Dashboard = () => {
  const theme = useTheme();
  const { currentSite, timeRange, loading, error, metrics } = useAnalytics();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (metrics) {
      setDashboardData(metrics);
    }
  }, [metrics]);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Error loading dashboard: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!currentSite) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Please select a site to view analytics</Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No data available for the selected time range</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {currentSite.name} - Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {timeRange.label}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Overview metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <VisitorsOverview data={dashboardData.visitors} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <PageviewsChart data={dashboardData.pageviews} />
          </Paper>
        </Grid>

        {/* Device and Geo distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <DeviceDistribution data={dashboardData.devices} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <GeoDistribution data={dashboardData.countries} />
          </Paper>
        </Grid>

        {/* Top pages and referrers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <TopPages data={dashboardData.pages} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <ReferrersTable data={dashboardData.referrers} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 