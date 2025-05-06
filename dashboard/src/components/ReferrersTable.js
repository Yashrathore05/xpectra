import React, { useState } from 'react';
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
  TablePagination,
  Tooltip,
  Chip,
  IconButton
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const ReferrersTable = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (!data || !data.length) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Top Referrers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No referrer data available for the selected time period.
        </Typography>
      </Box>
    );
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Determine referrer type and get appropriate icon
  const getReferrerTypeInfo = (source) => {
    const sourceUrl = source?.toLowerCase() || '';
    
    // Search engines
    if (
      sourceUrl.includes('google') ||
      sourceUrl.includes('bing') ||
      sourceUrl.includes('yahoo') ||
      sourceUrl.includes('duckduckgo') ||
      sourceUrl.includes('baidu') ||
      sourceUrl.includes('search')
    ) {
      return {
        type: 'Search',
        icon: <SearchIcon fontSize="small" />,
        color: 'primary'
      };
    }
    
    // Social media
    if (
      sourceUrl.includes('facebook') ||
      sourceUrl.includes('twitter') ||
      sourceUrl.includes('instagram') ||
      sourceUrl.includes('linkedin') ||
      sourceUrl.includes('pinterest') ||
      sourceUrl.includes('reddit') ||
      sourceUrl.includes('tiktok') ||
      sourceUrl.includes('youtube')
    ) {
      return {
        type: 'Social',
        icon: <BookmarkIcon fontSize="small" />,
        color: 'secondary'
      };
    }
    
    // Direct / None
    if (sourceUrl === 'direct' || sourceUrl === '(direct)' || sourceUrl === '') {
      return {
        type: 'Direct',
        icon: <CodeIcon fontSize="small" />,
        color: 'default'
      };
    }
    
    // Default - External website
    return {
      type: 'Referral',
      icon: <LinkIcon fontSize="small" />,
      color: 'info'
    };
  };

  // Format URL for display
  const formatUrl = (url) => {
    if (!url || url === 'direct' || url === '(direct)') return 'Direct Traffic';
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  };

  // Open URL in new tab, adding https if needed
  const openUrl = (url) => {
    if (!url || url === 'direct' || url === '(direct)') return;
    
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Top Referrers
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 350 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Source</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Visitors</TableCell>
              <TableCell align="right">Conv. Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((referrer) => {
                const { type, icon, color } = getReferrerTypeInfo(referrer.source);
                const displayUrl = formatUrl(referrer.source);
                
                return (
                  <TableRow key={referrer.source} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title={referrer.source}>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {displayUrl}
                          </Typography>
                        </Tooltip>
                        {referrer.source && 
                         referrer.source !== 'direct' && 
                         referrer.source !== '(direct)' && (
                          <IconButton
                            size="small"
                            onClick={() => openUrl(referrer.source)}
                            sx={{ ml: 0.5 }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={type}
                        color={color}
                        icon={icon}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">{referrer.count}</TableCell>
                    <TableCell align="right">
                      {referrer.conversionRate ? `${referrer.conversionRate}%` : 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default ReferrersTable; 