import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// Icons for devices
import LaptopIcon from '@mui/icons-material/LaptopMac';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import TabletIcon from '@mui/icons-material/Tablet';
import MoreIcon from '@mui/icons-material/Devices';

const DeviceDistribution = ({ data }) => {
  if (!data) return null;

  // Fixed colors for device types
  const deviceColors = {
    desktop: {
      color: 'rgba(54, 162, 235, 0.8)',
      icon: <LaptopIcon fontSize="large" sx={{ color: 'rgba(54, 162, 235, 1)' }} />
    },
    mobile: {
      color: 'rgba(255, 99, 132, 0.8)',
      icon: <SmartphoneIcon fontSize="large" sx={{ color: 'rgba(255, 99, 132, 1)' }} />
    },
    tablet: {
      color: 'rgba(75, 192, 192, 0.8)',
      icon: <TabletIcon fontSize="large" sx={{ color: 'rgba(75, 192, 192, 1)' }} />
    },
    other: {
      color: 'rgba(255, 159, 64, 0.8)',
      icon: <MoreIcon fontSize="large" sx={{ color: 'rgba(255, 159, 64, 1)' }} />
    }
  };

  // Prepare data for the chart
  const deviceLabels = [];
  const deviceValues = [];
  const deviceBackgroundColors = [];

  Object.entries(data).forEach(([device, count]) => {
    deviceLabels.push(device.charAt(0).toUpperCase() + device.slice(1));
    deviceValues.push(count);
    deviceBackgroundColors.push(deviceColors[device]?.color || 'rgba(201, 203, 207, 0.8)');
  });

  const chartData = {
    labels: deviceLabels,
    datasets: [
      {
        data: deviceValues,
        backgroundColor: deviceBackgroundColors,
        borderColor: deviceBackgroundColors.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  // Calculate total for percentages
  const total = deviceValues.reduce((a, b) => a + b, 0);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Device Distribution
      </Typography>

      <Box sx={{ mt: 2, height: 300, position: 'relative' }}>
        <Doughnut data={chartData} options={chartOptions} />
      </Box>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {Object.entries(data).map(([device, count]) => (
          <Grid item xs={6} sm={3} key={device}>
            <Box sx={{ textAlign: 'center' }}>
              {deviceColors[device]?.icon}
              <Typography variant="body2" sx={{ mt: 1 }}>
                {device.charAt(0).toUpperCase() + device.slice(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {count} ({((count / total) * 100).toFixed(1)}%)
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DeviceDistribution; 