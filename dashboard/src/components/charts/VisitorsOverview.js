import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const VisitorsOverview = ({ data }) => {
  if (!data) return null;

  const { totalVisitors, newVisitors, returningVisitors, timeline } = data;
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const chartData = {
    labels: timeline.map(item => item.date),
    datasets: [
      {
        label: 'Total Visitors',
        data: timeline.map(item => item.total),
        borderColor: 'rgba(53, 162, 235, 1)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.4
      },
      {
        label: 'New Visitors',
        data: timeline.map(item => item.new),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      },
      {
        label: 'Returning Visitors',
        data: timeline.map(item => item.returning),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.4
      }
    ]
  };

  const MetricCard = ({ title, value, color }) => (
    <Paper
      elevation={0}
      sx={{ 
        p: 2, 
        textAlign: 'center',
        bgcolor: `${color}.light`,
        color: `${color}.dark`,
        borderRadius: 2
      }}
    >
      <Typography variant="body2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Visitors Overview
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <MetricCard
            title="Total Visitors"
            value={totalVisitors}
            color="primary"
          />
        </Grid>
        <Grid item xs={4}>
          <MetricCard
            title="New Visitors"
            value={newVisitors}
            color="success"
          />
        </Grid>
        <Grid item xs={4}>
          <MetricCard
            title="Returning Visitors"
            value={returningVisitors}
            color="warning"
          />
        </Grid>
      </Grid>

      <Box sx={{ height: 300 }}>
        <Line options={chartOptions} data={chartData} />
      </Box>
    </Box>
  );
};

export default VisitorsOverview; 