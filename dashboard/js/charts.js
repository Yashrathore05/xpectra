/**
 * Xpectra Analytics Dashboard
 * Charts Module
 */

// Chart instances (to store references to update later)
let visitorsChart;
let devicesChart;
let peakHoursChart;
let scrollDepthChart;

// Initialize charts
function initCharts() {
  console.log("Initializing charts module");
  
  // Make sure Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.error("Chart.js not loaded. Loading it dynamically...");
    loadChartJS();
    return;
  }
  
  // Set default chart options
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = '#8996A8';
  Chart.defaults.plugins.tooltip.backgroundColor = '#2D3748';
  Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
  Chart.defaults.plugins.tooltip.bodyColor = '#E2E8F0';
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 4;
  Chart.defaults.plugins.tooltip.displayColors = false;
  
  // Initialize each chart
  initVisitorsChart();
  initDevicesChart();
  initPeakHoursChart();
  initScrollDepthChart();
  
  console.log("Charts initialized successfully");
}

// Load Chart.js dynamically if not available
function loadChartJS() {
  const script = document.createElement('script');
  script.src = 'js/chart.min.js';
  script.onload = initCharts;
  script.onerror = () => {
    console.error("Failed to load Chart.js locally, trying CDN...");
    const cdnScript = document.createElement('script');
    cdnScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    cdnScript.onload = initCharts;
    cdnScript.onerror = () => console.error("Failed to load Chart.js from CDN");
    document.head.appendChild(cdnScript);
  };
  document.head.appendChild(script);
}

// Initialize visitors chart
function initVisitorsChart() {
  const ctx = document.getElementById('visitorsChart');
  if (!ctx) return;
  
  visitorsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: generateDayLabels(7),
      datasets: [
        {
          label: 'Page Views',
          data: Array(7).fill(0),
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Unique Visitors',
          data: Array(7).fill(0),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            borderDash: [3, 3]
          },
          ticks: {
            callback: function(value) {
              if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'k';
              }
              return value;
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

// Initialize devices chart
function initDevicesChart() {
  const ctx = document.getElementById('devicesChart');
  if (!ctx) return;
  
  devicesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Desktop', 'Mobile', 'Tablet'],
      datasets: [{
        data: [60, 30, 10],
        backgroundColor: [
          '#4F46E5',
          '#10B981',
          '#F59E0B'
        ],
        borderWidth: 0,
        hoverOffset: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.formattedValue;
              return `${label}: ${value}%`;
            }
          }
        }
      }
    }
  });
}

// Initialize peak hours chart
function initPeakHoursChart() {
  const ctx = document.getElementById('peakHoursChart');
  if (!ctx) return;
  
  peakHoursChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: generateHourLabels(),
      datasets: [{
        label: 'Visitors',
        data: Array(24).fill(0),
        backgroundColor: '#4F46E5',
        borderRadius: 3,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              const hour = parseInt(tooltipItems[0].label.split(':')[0]);
              const ampm = hour < 12 ? 'AM' : 'PM';
              const displayHour = hour % 12 || 12;
              return `${displayHour}:00 ${ampm}`;
            },
            label: function(context) {
              return `Visitors: ${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 0,
            callback: function(value, index) {
              // Display only every 3 hours to avoid crowding
              if (index % 3 === 0) {
                return this.getLabelForValue(value);
              }
              return '';
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            borderDash: [3, 3]
          },
          ticks: {
            callback: function(value) {
              if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'k';
              }
              return value;
            }
          }
        }
      }
    }
  });
}

// Initialize scroll depth chart
function initScrollDepthChart() {
  const ctx = document.getElementById('scrollDepthChart');
  if (!ctx) return;
  
  scrollDepthChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['0-25%', '25-50%', '50-75%', '75-100%'],
      datasets: [{
        label: 'Users',
        data: [0, 0, 0, 0],
        backgroundColor: [
          '#F87171',
          '#FBBF24',
          '#34D399',
          '#60A5FA'
        ],
        borderRadius: 3,
        barPercentage: 0.8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const percent = (context.parsed.x / context.dataset._meta[Object.keys(context.dataset._meta)[0]].total * 100).toFixed(1);
              return `${context.parsed.x.toLocaleString()} users (${percent}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            borderDash: [3, 3]
          },
          ticks: {
            callback: function(value) {
              if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'k';
              }
              return value;
            }
          }
        },
        y: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Update visitors chart with new data
async function updateVisitorsChart(projectId, startDate, endDate) {
  if (!visitorsChart) return;
  
  try {
    // Default to empty data if no project or dates
    if (!projectId || !startDate || !endDate) {
      resetVisitorsChart();
      return;
    }
    
    const { db } = window.xpectraFirebase;
    
    // Calculate date range
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const labels = generateDayLabels(days, startDate);
    
    // Initialize data arrays
    const pageViewsData = Array(days).fill(0);
    const visitorsData = Array(days).fill(0);
    
    // Get events for date range
    const eventsSnapshot = await db.collection('events')
      .where('projectId', '==', projectId)
      .where('type', '==', 'page_view')
      .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(startDate))
      .where('timestamp', '<=', firebase.firestore.Timestamp.fromDate(endDate))
      .get();
    
    // Process events
    const visitorsByDay = new Array(days).fill().map(() => new Set());
    
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      const eventDate = event.timestamp.toDate();
      const dayIndex = Math.floor((eventDate - startDate) / (1000 * 60 * 60 * 24));
      
      if (dayIndex >= 0 && dayIndex < days) {
        // Count page view
        pageViewsData[dayIndex]++;
        
        // Count unique visitor
        if (event.visitorId) {
          visitorsByDay[dayIndex].add(event.visitorId);
        }
      }
    });
    
    // Convert visitor sets to counts
    for (let i = 0; i < days; i++) {
      visitorsData[i] = visitorsByDay[i].size;
    }
    
    // Update chart data
    visitorsChart.data.labels = labels;
    visitorsChart.data.datasets[0].data = pageViewsData;
    visitorsChart.data.datasets[1].data = visitorsData;
    visitorsChart.update();
    
  } catch (error) {
    console.error('Error updating visitors chart:', error);
    resetVisitorsChart();
  }
}

// Reset visitors chart to default empty state
function resetVisitorsChart() {
  if (!visitorsChart) return;
  
  const days = 7;
  visitorsChart.data.labels = generateDayLabels(days);
  visitorsChart.data.datasets[0].data = Array(days).fill(0);
  visitorsChart.data.datasets[1].data = Array(days).fill(0);
  visitorsChart.update();
}

// Update devices chart with new data
async function updateDevicesChart(projectId, startDate, endDate) {
  if (!devicesChart) return;
  
  try {
    // Default to empty data if no project or dates
    if (!projectId || !startDate || !endDate) {
      resetDevicesChart();
      return;
    }
    
    const { db } = window.xpectraFirebase;
    
    // Get events for date range
    const eventsSnapshot = await db.collection('events')
      .where('projectId', '==', projectId)
      .where('type', '==', 'page_view')
      .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(startDate))
      .where('timestamp', '<=', firebase.firestore.Timestamp.fromDate(endDate))
      .get();
    
    // Initialize device counters
    let desktop = 0;
    let mobile = 0;
    let tablet = 0;
    
    // Count unique visitors by device type
    const deviceVisitors = {
      desktop: new Set(),
      mobile: new Set(),
      tablet: new Set()
    };
    
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      if (!event.visitorId || !event.deviceType) return;
      
      // Classify device
      let deviceType = 'desktop';
      if (event.deviceType.toLowerCase().includes('mobile')) {
        deviceType = 'mobile';
      } else if (event.deviceType.toLowerCase().includes('tablet')) {
        deviceType = 'tablet';
      }
      
      // Add to appropriate set
      deviceVisitors[deviceType].add(event.visitorId);
    });
    
    // Get counts
    desktop = deviceVisitors.desktop.size;
    mobile = deviceVisitors.mobile.size;
    tablet = deviceVisitors.tablet.size;
    
    // Calculate percentages
    const total = desktop + mobile + tablet;
    let desktopPercent = 0;
    let mobilePercent = 0;
    let tabletPercent = 0;
    
    if (total > 0) {
      desktopPercent = Math.round((desktop / total) * 100);
      mobilePercent = Math.round((mobile / total) * 100);
      tabletPercent = 100 - desktopPercent - mobilePercent; // Make sure they add up to 100%
    }
    
    // Update chart
    devicesChart.data.datasets[0].data = [desktopPercent, mobilePercent, tabletPercent];
    devicesChart.update();
    
  } catch (error) {
    console.error('Error updating devices chart:', error);
    resetDevicesChart();
  }
}

// Reset devices chart to default empty state
function resetDevicesChart() {
  if (!devicesChart) return;
  
  devicesChart.data.datasets[0].data = [33, 33, 34];
  devicesChart.update();
}

// Update peak hours chart with new data
async function updatePeakHoursChart(projectId, startDate, endDate) {
  if (!peakHoursChart) return;
  
  try {
    // Default to empty data if no project or dates
    if (!projectId || !startDate || !endDate) {
      resetPeakHoursChart();
      return;
    }
    
    const { db } = window.xpectraFirebase;
    
    // Get events for date range
    const eventsSnapshot = await db.collection('events')
      .where('projectId', '==', projectId)
      .where('type', '==', 'page_view')
      .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(startDate))
      .where('timestamp', '<=', firebase.firestore.Timestamp.fromDate(endDate))
      .get();
    
    // Initialize hour counters
    const hourCounts = Array(24).fill(0);
    
    // Aggregate visitors by hour
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      const hour = event.timestamp.toDate().getHours();
      hourCounts[hour]++;
    });
    
    // Update chart
    peakHoursChart.data.datasets[0].data = hourCounts;
    peakHoursChart.update();
    
  } catch (error) {
    console.error('Error updating peak hours chart:', error);
    resetPeakHoursChart();
  }
}

// Reset peak hours chart to default empty state
function resetPeakHoursChart() {
  if (!peakHoursChart) return;
  
  peakHoursChart.data.datasets[0].data = Array(24).fill(0);
  peakHoursChart.update();
}

// Update scroll depth chart with new data
async function updateScrollDepthChart(projectId, startDate, endDate) {
  if (!scrollDepthChart) return;
  
  try {
    // Default to empty data if no project or dates
    if (!projectId || !startDate || !endDate) {
      resetScrollDepthChart();
      return;
    }
    
    const { db } = window.xpectraFirebase;
    
    // Get scroll events for date range
    const eventsSnapshot = await db.collection('events')
      .where('projectId', '==', projectId)
      .where('type', '==', 'scroll_depth')
      .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(startDate))
      .where('timestamp', '<=', firebase.firestore.Timestamp.fromDate(endDate))
      .get();
    
    // Initialize depth counters
    const depthCounts = [0, 0, 0, 0]; // 0-25%, 25-50%, 50-75%, 75-100%
    
    // Count visitors by max scroll depth
    const visitorMaxDepth = {};
    
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      if (!event.visitorId || !event.depth) return;
      
      const depth = parseFloat(event.depth);
      if (isNaN(depth)) return;
      
      // Update visitor's max depth if this is deeper
      const currentMax = visitorMaxDepth[event.visitorId] || 0;
      if (depth > currentMax) {
        visitorMaxDepth[event.visitorId] = depth;
      }
    });
    
    // Categorize by depth ranges
    for (const visitorId in visitorMaxDepth) {
      const depth = visitorMaxDepth[visitorId];
      
      if (depth <= 25) {
        depthCounts[0]++;
      } else if (depth <= 50) {
        depthCounts[1]++;
      } else if (depth <= 75) {
        depthCounts[2]++;
      } else {
        depthCounts[3]++;
      }
    }
    
    // Update chart
    scrollDepthChart.data.datasets[0].data = depthCounts;
    scrollDepthChart.update();
    
  } catch (error) {
    console.error('Error updating scroll depth chart:', error);
    resetScrollDepthChart();
  }
}

// Reset scroll depth chart to default empty state
function resetScrollDepthChart() {
  if (!scrollDepthChart) return;
  
  scrollDepthChart.data.datasets[0].data = [0, 0, 0, 0];
  scrollDepthChart.update();
}

// Generate hour labels (00:00 - 23:00)
function generateHourLabels() {
  const labels = [];
  for (let i = 0; i < 24; i++) {
    labels.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return labels;
}

// Generate day labels based on date range
function generateDayLabels(numDays, startDate = new Date()) {
  const labels = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < numDays; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    labels.push(formatDate(date));
  }
  
  return labels;
}

// Format date for chart labels
function formatDate(date) {
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

// Export charts module
window.xpectraCharts = {
  initCharts,
  updateVisitorsChart,
  updateDevicesChart,
  updatePeakHoursChart,
  updateScrollDepthChart
}; 