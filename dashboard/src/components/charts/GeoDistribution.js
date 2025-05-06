import React, { useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Tabs, Tab } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import FlagIcon from '@mui/icons-material/Flag';
import PublicIcon from '@mui/icons-material/Public';

// Colors for chart slices
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', 
  '#45B39D', '#F5B041', '#EC7063', '#AAB7B8', '#566573', '#58D68D'
];

const GeoDistribution = ({ data }) => {
  const [tabIndex, setTabIndex] = useState(0);
  
  if (!data) return null;

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  // Prepare data for the chart and list view
  const prepareChartData = (dataObj) => {
    // Sort by value and take top entries
    const sortedEntries = Object.entries(dataObj)
      .sort((a, b) => b[1] - a[1]);
    
    const topEntries = sortedEntries.slice(0, 8);
    
    // If there are more than 8 entries, add an "Other" category
    let otherCount = 0;
    if (sortedEntries.length > 8) {
      otherCount = sortedEntries
        .slice(8)
        .reduce((sum, [_, count]) => sum + count, 0);
      
      if (otherCount > 0) {
        topEntries.push(['Other', otherCount]);
      }
    }
    
    // Calculate percentages
    const total = Object.values(dataObj).reduce((sum, count) => sum + count, 0);
    
    return topEntries.map(([label, value]) => ({
      name: label,
      value,
      percentage: ((value / total) * 100).toFixed(1)
    }));
  };

  const countriesData = prepareChartData(data.countries || {});
  const citiesData = prepareChartData(data.cities || {});

  const tabData = [
    { title: 'Countries', data: countriesData, icon: <PublicIcon /> },
    { title: 'Cities', data: citiesData, icon: <FlagIcon /> }
  ];

  const currentData = tabData[tabIndex].data;

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 1.5, boxShadow: 2 }}>
          <Typography variant="body2">{data.name}</Typography>
          <Typography variant="body2">
            {data.value} ({data.percentage}%)
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Geographic Distribution
      </Typography>

      <Tabs 
        value={tabIndex}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        {tabData.map((tab, index) => (
          <Tab 
            key={index} 
            label={tab.title} 
            icon={tab.icon} 
            iconPosition="start" 
            sx={{ minHeight: 48 }}
          />
        ))}
      </Tabs>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ width: { xs: '100%', sm: '50%' }, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={1}
                dataKey="value"
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                labelLine={false}
              >
                {currentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ width: { xs: '100%', sm: '50%' }, mt: { xs: 2, sm: 0 } }}>
          <List dense>
            {currentData.map((item, index) => (
              <React.Fragment key={item.name}>
                <ListItem>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: COLORS[index % COLORS.length],
                      mr: 2
                    }}
                  />
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.value} visitors (${item.percentage}%)`}
                  />
                </ListItem>
                {index < currentData.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default GeoDistribution; 