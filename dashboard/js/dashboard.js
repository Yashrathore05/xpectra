/**
 * Xpectra Analytics Dashboard
 * Main Dashboard Script
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the dashboard
  initDashboard();
});

// Clean up any timeouts when the page unloads
window.addEventListener('beforeunload', function() {
  // Clear online users timeout
  if (window.onlineUsersTimeout) {
    clearTimeout(window.onlineUsersTimeout);
    window.onlineUsersTimeout = null;
  }
});

// Initialize the dashboard
function initDashboard() {
  console.log("Initializing dashboard...");
  
  // Make sure Firebase is initialized before continuing
  if (!window.xpectraFirebase) {
    console.error("Firebase not initialized yet. Retrying in 500ms...");
    setTimeout(initDashboard, 500);
    return;
  }
  
  // Remove loading state
  document.body.classList.remove('loading');
  
  // Initialize project dropdown
  initProjectDropdown();
  
  // Initialize date range selector
  initDateRangeSelector();
  
  // Set up API key copy functionality
  initApiKeyCopy();
  
  // Listen for auth state changes
  setupAuthListeners();
  
  // Check for cached project data
  const cachedProject = localStorage.getItem('currentProject');
  if (cachedProject) {
    try {
      const projectData = JSON.parse(cachedProject);
      if (projectData && projectData.id && projectData.name) {
        // Update UI with the cached project data
        updateSelectedProjectUI(projectData);
        loadDashboardData(projectData.id);
      }
    } catch (e) {
      console.error("Error parsing cached project data:", e);
    }
  }
  
  console.log("Dashboard initialized successfully");
}

// Initialize project dropdown
function initProjectDropdown() {
  const projectDropdownBtn = document.getElementById('projectDropdownBtn');
  const projectDropdownMenu = document.getElementById('projectDropdownMenu');
  
  if (projectDropdownBtn && projectDropdownMenu) {
    // Toggle dropdown when button is clicked
    projectDropdownBtn.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent click from bubbling to document
      projectDropdownMenu.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!projectDropdownBtn.contains(event.target) && !projectDropdownMenu.contains(event.target)) {
        projectDropdownMenu.classList.add('hidden');
      }
    });
    
    // Close dropdown when clicking on a project
    const projectList = document.getElementById('projectList');
    if (projectList) {
      projectList.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
          projectDropdownMenu.classList.add('hidden');
        }
      });
    }
    
    // Initialize Add Project button
    const addProjectBtn = document.getElementById('addProjectBtn');
    if (addProjectBtn) {
      addProjectBtn.addEventListener('click', () => {
        window.xpectraUI.openModal('addProjectModal');
      });
    }
  }
}

// Initialize date range selector
function initDateRangeSelector() {
  const dateRangeBtn = document.getElementById('dateRangeBtn');
  const dateRangeDropdown = document.getElementById('dateRangeDropdown');
  const customDateRange = document.getElementById('customDateRange');
  
  if (dateRangeBtn && dateRangeDropdown) {
    // Toggle dropdown
    dateRangeBtn.addEventListener('click', () => {
      dateRangeDropdown.classList.toggle('hidden');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!dateRangeBtn.contains(event.target) && !dateRangeDropdown.contains(event.target) && 
          !(customDateRange && customDateRange.contains(event.target))) {
        dateRangeDropdown.classList.add('hidden');
      }
    });
    
    // Handle date range selection
    const dateRangeOptions = dateRangeDropdown.querySelectorAll('li');
    dateRangeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const range = option.getAttribute('data-range');
        
        // Update active class
        dateRangeOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        
        // Update button text
        const rangeText = option.textContent;
        dateRangeBtn.querySelector('span').textContent = rangeText;
        
        // Show/hide custom date range if needed
        if (range === 'custom' && customDateRange) {
          customDateRange.classList.remove('hidden');
        } else if (customDateRange) {
          customDateRange.classList.add('hidden');
          
          // Update the date range and reload data
          updateDateRange(range);
          loadDashboardData();
        }
        
        // Hide dropdown
        dateRangeDropdown.classList.add('hidden');
      });
    });
    
    // Handle custom date range
    const applyDateRangeBtn = document.getElementById('applyDateRange');
    if (applyDateRangeBtn) {
      applyDateRangeBtn.addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (startDate && endDate) {
          // Store custom date range
          localStorage.setItem('customStartDate', startDate);
          localStorage.setItem('customEndDate', endDate);
          localStorage.setItem('dateRange', 'custom');
          
          // Update button text
          const formattedStart = new Date(startDate).toLocaleDateString();
          const formattedEnd = new Date(endDate).toLocaleDateString();
          dateRangeBtn.querySelector('span').textContent = `${formattedStart} - ${formattedEnd}`;
          
          // Hide custom date range and dropdown
          customDateRange.classList.add('hidden');
          dateRangeDropdown.classList.add('hidden');
          
          // Reload dashboard data
          loadDashboardData();
        }
      });
    }
    
    // Set default date range if not already set
    if (!localStorage.getItem('dateRange')) {
      updateDateRange('7days');
    }
  }
}

// Update date range in local storage
function updateDateRange(range) {
  const now = new Date();
  const endDate = new Date(now);
  let startDate;
  
  switch (range) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'yesterday':
      startDate = new Date(now.setDate(now.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate());
      endDate.setHours(23, 59, 59, 999);
      break;
    case '7days':
      startDate = new Date(now.setDate(now.getDate() - 6));
      startDate.setHours(0, 0, 0, 0);
      break;
    case '30days':
      startDate = new Date(now.setDate(now.getDate() - 29));
      startDate.setHours(0, 0, 0, 0);
      break;
    case '90days':
      startDate = new Date(now.setDate(now.getDate() - 89));
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 6));
      startDate.setHours(0, 0, 0, 0);
  }
  
  localStorage.setItem('dateRange', range);
  localStorage.setItem('startDate', startDate.toISOString());
  localStorage.setItem('endDate', endDate.toISOString());
}

// Initialize API key copy functionality
function initApiKeyCopy() {
  const copyApiKeyBtn = document.getElementById('copyApiKey');
  if (copyApiKeyBtn) {
    copyApiKeyBtn.addEventListener('click', () => {
      const apiKeyDisplay = document.getElementById('apiKeyDisplay');
      if (apiKeyDisplay) {
        const tempInput = document.createElement('input');
        tempInput.value = apiKeyDisplay.textContent;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        window.xpectraUI.showToast('success', 'API Key Copied', 'API key copied to clipboard');
      }
    });
  }
  
  // Initialize regenerate API key button
  const regenerateApiKeyBtn = document.getElementById('regenerateApiKey');
  if (regenerateApiKeyBtn) {
    regenerateApiKeyBtn.addEventListener('click', handleRegenerateApiKey);
  }
}

// Setup auth listeners
function setupAuthListeners() {
  const { auth, db } = window.xpectraFirebase;
  
  // Listen for auth state changes
  auth.onAuthStateChanged(async user => {
    if (user) {
      // Show project selection
      const projectSelection = document.getElementById('projectSelection');
      if (projectSelection) {
        projectSelection.classList.remove('hidden');
      }
      
      // Hide welcome section
      const welcomeSection = document.getElementById('welcomeSection');
      if (welcomeSection) {
        welcomeSection.classList.add('hidden');
      }
      
      // Listen for user's selected project
      try {
        const userDocRef = db.collection('users').doc(user.uid);
        userDocRef.onSnapshot(async (doc) => {
          const userData = doc.data() || {};
          const selectedProjectId = userData.selectedProjectId;
          
          if (selectedProjectId) {
            try {
              // Fetch selected project details
              const projectDoc = await db.collection('projects').doc(selectedProjectId).get();
              if (projectDoc.exists) {
                const project = { id: projectDoc.id, ...projectDoc.data() };
                updateSelectedProjectUI(project);
                loadDashboardData(project.id);
              } else {
                showNoProjectSelected();
              }
            } catch (error) {
              console.error("Error fetching project:", error);
              showNoProjectSelected();
            }
          } else {
            showNoProjectSelected();
          }
        });
        
        // Listen for project list changes
        db.collection('projects').where('userId', '==', user.uid)
          .onSnapshot(snapshot => {
            const projects = [];
            snapshot.forEach(doc => projects.push({ id: doc.id, ...doc.data() }));
            updateProjectDropdown(projects);
          }, error => {
            console.error("Error fetching projects:", error);
          });
      } catch (error) {
        console.error("Error setting up listeners:", error);
      }
    } else {
      // Hide project selection and dashboard content
      const projectSelection = document.getElementById('projectSelection');
      if (projectSelection) {
        projectSelection.classList.add('hidden');
      }
      
      // Show welcome section
      const welcomeSection = document.getElementById('welcomeSection');
      if (welcomeSection) {
        welcomeSection.classList.remove('hidden');
      }
      
      showNoProjectSelected();
      updateProjectDropdown([]);
    }
  });
}

// Update the UI for the selected project
function updateSelectedProjectUI(project) {
  const currentProject = document.getElementById('currentProject');
  const dashboardContent = document.getElementById('dashboardContent');
  const apiKeySection = document.getElementById('apiKeySection');
  const apiKeyDisplay = document.getElementById('apiKeyDisplay');
  
  if (currentProject) {
    currentProject.textContent = project.name;
  }
  
  if (dashboardContent) {
    dashboardContent.classList.remove('hidden');
  }
  
  if (apiKeySection) {
    apiKeySection.classList.remove('hidden');
  }
  
  if (apiKeyDisplay) {
    apiKeyDisplay.textContent = project.apiKey;
  }
  
  // Save project to local storage
  localStorage.setItem('currentProject', JSON.stringify(project));
}

// Show UI state for no project selected
function showNoProjectSelected() {
  const currentProject = document.getElementById('currentProject');
  const dashboardContent = document.getElementById('dashboardContent');
  const apiKeySection = document.getElementById('apiKeySection');
  const apiKeyDisplay = document.getElementById('apiKeyDisplay');
  
  // Clear any existing timeouts
  if (window.onlineUsersTimeout) {
    clearTimeout(window.onlineUsersTimeout);
    window.onlineUsersTimeout = null;
  }
  
  if (currentProject) {
    currentProject.textContent = 'Select a project';
  }
  
  if (dashboardContent) {
    dashboardContent.classList.add('hidden');
  }
  
  if (apiKeySection) {
    apiKeySection.classList.add('hidden');
  }
  
  if (apiKeyDisplay) {
    apiKeyDisplay.textContent = '••••••••••••••••';
  }
  
  // Clear project from local storage
  localStorage.removeItem('currentProject');
}

// Update the project dropdown with the user's projects
function updateProjectDropdown(projects) {
  const projectList = document.getElementById('projectList');
  if (!projectList) return;
  
  projectList.innerHTML = '';
  
  if (projects.length === 0) {
    const noProjects = document.createElement('li');
    noProjects.className = 'no-projects';
    noProjects.textContent = 'No projects found';
    projectList.appendChild(noProjects);
    return;
  }
  
  projects.forEach(project => {
    const li = document.createElement('li');
    li.textContent = project.name;
    li.dataset.projectId = project.id;
    li.dataset.projectName = project.name;
    li.addEventListener('click', function() {
      selectProject(this.dataset.projectId, this.dataset.projectName);
    });
    projectList.appendChild(li);
  });
}

// Select a project and update Firestore
async function selectProject(projectId, projectName) {
  try {
    const { auth, db } = window.xpectraFirebase;
    const user = auth.currentUser;
    if (!user) return;
    
    await db.collection('users').doc(user.uid).set({ 
      selectedProjectId: projectId 
    }, { merge: true });
    
    // Use the UI function to update the interface
    window.xpectraUI.selectProject(projectId, projectName);
    
  } catch (error) {
    console.error("Error selecting project:", error);
    window.xpectraUI.showToast('error', 'Error', 'Failed to select project');
  }
}

// Regenerate API key for the selected project
async function handleRegenerateApiKey() {
  try {
    const { auth, db } = window.xpectraFirebase;
    const user = auth.currentUser;
    if (!user) return;
    
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data() || {};
    const selectedProjectId = userData.selectedProjectId;
    
    if (!selectedProjectId) {
      window.xpectraUI.showToast('error', 'Error', 'No project selected');
      return;
    }
    
    if (!confirm('Are you sure you want to regenerate the API key? The old key will stop working immediately.')) {
      return;
    }
    
    const newApiKey = generateApiKey();
    await db.collection('projects').doc(selectedProjectId).update({ 
      apiKey: newApiKey 
    });
    
    window.xpectraUI.showToast('success', 'API Key Updated', 'The API key has been regenerated successfully');
    
  } catch (error) {
    console.error("Error regenerating API key:", error);
    window.xpectraUI.showToast('error', 'Error', 'Failed to regenerate API key');
  }
}

// Generate a new API key
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 32;
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Load all dashboard data
function loadDashboardData(projectId) {
  // Check if we're on dashboard page
  if (!document.getElementById('dashboardContent')) {
    return;
  }
  
  // Clear any existing timeouts to prevent multiple refresh cycles
  if (window.onlineUsersTimeout) {
    clearTimeout(window.onlineUsersTimeout);
    window.onlineUsersTimeout = null;
  }
  
  // Get current project
  const storedProject = localStorage.getItem('currentProject');
  if (!storedProject) {
    console.log("No project selected");
    return;
  }
  
  try {
    // Parse stored project data
    const projectData = JSON.parse(storedProject);
    if (!projectData || !projectData.id) {
      console.log("Invalid project data");
      return;
    }
    
    // Use provided projectId or stored projectId
    const activeProjectId = projectId || projectData.id;
    
    // Update page views chart
    updatePageViewsChart(activeProjectId);
    
    // Update devices chart
    updateDevicesChart(activeProjectId);
    
    // Update browsers chart
    updateBrowsersChart(activeProjectId);
    
    // Update countries chart
    updateCountriesChart(activeProjectId);
    
    // Update total visitors
    updateTotalVisitors(activeProjectId);
    
    // Update bounce rate
    updateBounceRate(activeProjectId);
    
    // Update average session duration
    updateAvgSessionDuration(activeProjectId);
    
    // Update online users count
    updateOnlineUsersCount(activeProjectId);
    
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// Update page views chart
function updatePageViewsChart(projectId) {
  // Implementation of updatePageViewsChart function
}

// Update devices chart
function updateDevicesChart(projectId) {
  // Implementation of updateDevicesChart function
}

// Update browsers chart
function updateBrowsersChart(projectId) {
  // Implementation of updateBrowsersChart function
}

// Update countries chart
function updateCountriesChart(projectId) {
  // Implementation of updateCountriesChart function
}

// Update total visitors
function updateTotalVisitors(projectId) {
  // Implementation of updateTotalVisitors function
}

// Update bounce rate
function updateBounceRate(projectId) {
  // Implementation of updateBounceRate function
}

// Update average session duration
function updateAvgSessionDuration(projectId) {
  // Implementation of updateAvgSessionDuration function
}

// Update online users count
async function updateOnlineUsersCount(projectId) {
  const { db } = window.xpectraFirebase;
  const onlineUsersCount = document.getElementById('onlineUsersCount');
  
  if (!onlineUsersCount) return;
  
  try {
    // Get online users in last 5 minutes
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    
    const snapshot = await db.collection('events')
      .where('projectId', '==', projectId)
      .where('type', '==', 'page_view')
      .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(fiveMinutesAgo))
      .get();
    
    // Count unique session IDs
    const sessionIds = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.sessionId) {
        sessionIds.add(data.sessionId);
      }
    });
    
    // Update UI
    onlineUsersCount.textContent = sessionIds.size.toLocaleString();
    
    // Set up auto-refresh only if we're still on the dashboard page
    // Use setTimeout with window reference to allow garbage collection
    if (document.getElementById('onlineUsersCount')) {
      window.onlineUsersTimeout = setTimeout(() => {
        // Clear the previous timeout reference
        window.onlineUsersTimeout = null;
        // Only update if the element still exists
        if (document.getElementById('onlineUsersCount')) {
          updateOnlineUsersCount(projectId);
        }
      }, 30000);
    }
  } catch (error) {
    console.error('Error updating online users count:', error);
    onlineUsersCount.textContent = '0';
  }
}

// Export dashboard functions
window.loadDashboardData = loadDashboardData; 