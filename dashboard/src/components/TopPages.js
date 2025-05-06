import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  Tooltip
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const TopPages = ({ data }) => {
  if (!data || !data.length) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Top Pages
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No page data available for the selected time period.
        </Typography>
      </Box>
    );
  }

  // Find the maximum pageviews for progress bar calculation
  const maxPageviews = Math.max(...data.map(page => page.pageviews));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Top Pages
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 350 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Page</TableCell>
              <TableCell align="right">Pageviews</TableCell>
              <TableCell align="right">Avg. Time</TableCell>
              <TableCell>Traffic</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((page) => {
              // Format page path for display
              let displayPath = page.path;
              if (displayPath.length > 30) {
                displayPath = displayPath.substring(0, 27) + '...';
              }
              
              // Format time on page
              const avgTimeSeconds = page.avgTimeOnPage || 0;
              const minutes = Math.floor(avgTimeSeconds / 60);
              const seconds = Math.floor(avgTimeSeconds % 60);
              const formattedTime = `${minutes}m ${seconds}s`;
              
              // Calculate the progress percentage
              const progressPercentage = (page.pageviews / maxPageviews) * 100;
              
              return (
                <TableRow key={page.path} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title={page.path}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {displayPath}
                        </Typography>
                      </Tooltip>
                      {page.url && (
                        <Tooltip title="Open page in new tab">
                          <OpenInNewIcon
                            fontSize="small"
                            color="action"
                            sx={{ ml: 0.5, cursor: 'pointer' }}
                            onClick={() => window.open(page.url, '_blank')}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{page.pageviews}</TableCell>
                  <TableCell align="right">{formattedTime}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progressPercentage}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">{`${Math.round(
                          progressPercentage
                        )}%`}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TopPages; 