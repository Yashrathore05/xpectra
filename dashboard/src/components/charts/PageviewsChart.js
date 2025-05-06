import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PageviewsChart = ({ data }) => {
  if (!data) return null;

  const { totalPageviews, uniquePageviews, avgTimeOnPage, bounceRate, timeline } = data;
  
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
      mode: 'index',
      intersect: false,
    }
  };

  const chartData = {
    labels: timeline.map(item => item.date),
    datasets: [
      {
        label: 'Total Pageviews',
        data: timeline.map(item => item.total),
        backgroundColor: 'rgba(53, 162, 235, 0.7)',
      },
      {
        label: 'Unique Pageviews',
        data: timeline.map(item => item.unique),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      }
    ]
  };

  // Format time string from seconds
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const MetricCard = ({ title, value, unit, color }) => (
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
        {unit && <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>{unit}</Typography>}
      </Typography>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pageviews
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <MetricCard
            title="Total Pageviews"
            value={totalPageviews}
            color="primary"
          />
        </Grid>
        <Grid item xs={6}>
          <MetricCard
            title="Unique Pageviews"
            value={uniquePageviews}
            color="info"
          />
        </Grid>
        <Grid item xs={6}>
          <MetricCard
            title="Avg. Time on Page"
            value={formatTime(avgTimeOnPage)}
            color="success"
          />
        </Grid>
        <Grid item xs={6}>
          <MetricCard
            title="Bounce Rate"
            value={bounceRate}
            unit="%"
            color="warning"
          />
        </Grid>
      </Grid>

      <Box sx={{ height: 300 }}>
        <Bar options={chartOptions} data={chartData} />
      </Box>
    </Box>
  );
};

export default PageviewsChart; 