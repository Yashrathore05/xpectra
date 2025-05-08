/**
 * Xpectra Analytics Dashboard
 * UI Utility Functions
 */

// Initialize UI
function initUI() {
  console.log("Initializing UI module");
  
  // Setup sidebar toggle
  initSidebarToggle();
  
  // Setup modals
  initModals();
  
  // Setup dropdowns
  initDropdowns();
  
  // Setup date range picker
  initDateRangePicker();
  
  // Initialize other UI elements
  initTooltips();
  
  // Ensure mobile navigation is set up correctly on page load
  if (window.innerWidth < 768) {
    document.body.classList.add('mobile-view');
    createMobileNavToggle();
    
    // Create overlay if it doesn't exist
    if (!document.getElementById('mobileNavOverlay')) {
      const overlay = createMobileOverlay();
      document.body.appendChild(overlay);
    }
  }
  
  console.log("UI module initialized");
}

// Initialize sidebar toggle
function initSidebarToggle() {
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const sidebar = document.querySelector('.sidebar');
  const app = document.querySelector('.app');
  
  if (toggleSidebarBtn && sidebar) {
    // Check if we need mobile navigation
    const isMobile = window.innerWidth < 768;
    
    // Set initial state based on localStorage or default (not collapsed)
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // For mobile: add a class to body instead of collapsing sidebar
    if (isMobile) {
      document.body.classList.add('mobile-view');
      document.body.classList.remove('sidebar-collapsed');
      // Create mobile nav toggle if it doesn't exist
      createMobileNavToggle();
    } else {
      // For desktop: use collapsed mode
      if (isSidebarCollapsed) {
        document.body.classList.add('sidebar-collapsed');
      }
    }
    
    // Toggle sidebar on button click
    toggleSidebarBtn.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        // Mobile: toggle sidebar-open class on body
        document.body.classList.toggle('sidebar-open');
      } else {
        // Desktop: toggle sidebar-collapsed class on body
        document.body.classList.toggle('sidebar-collapsed');
        // Save state to localStorage
        localStorage.setItem('sidebarCollapsed', document.body.classList.contains('sidebar-collapsed'));
      }
    });
    
    // Add overlay for mobile nav
    const overlay = createMobileOverlay();
    document.body.appendChild(overlay);
    
    // Close sidebar when clicking overlay
    overlay.addEventListener('click', () => {
      document.body.classList.remove('sidebar-open');
    });
    
    // Adjust sidebar on window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth < 768) {
        // Mobile view
        document.body.classList.add('mobile-view');
        document.body.classList.remove('sidebar-collapsed');
        createMobileNavToggle();
      } else {
        // Desktop view
        document.body.classList.remove('mobile-view');
        document.body.classList.remove('sidebar-open');
        const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isSidebarCollapsed) {
          document.body.classList.add('sidebar-collapsed');
        }
      }
    });
  }
}

// Create mobile navigation toggle button
function createMobileNavToggle() {
  // Remove any existing toggle button to avoid duplicates
  const existingToggle = document.getElementById('mobileNavToggle');
  if (existingToggle) {
    existingToggle.remove();
  }
  
  // Create new toggle button
  const mobileToggle = document.createElement('button');
  mobileToggle.id = 'mobileNavToggle';
  mobileToggle.className = 'mobile-nav-toggle';
  mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
  mobileToggle.setAttribute('aria-label', 'Toggle Navigation');
  
  // Add to document
  document.body.appendChild(mobileToggle);
  
  // Add event listener
  mobileToggle.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });
  
  // Make sure it's visible on mobile
  if (window.innerWidth < 768) {
    mobileToggle.style.display = 'flex';
  }
}

// Create overlay for mobile navigation
function createMobileOverlay() {
  let overlay = document.getElementById('mobileNavOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mobileNavOverlay';
    overlay.className = 'mobile-nav-overlay';
  }
  return overlay;
}

// Initialize modals
function initModals() {
  const modals = document.querySelectorAll('.modal');
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  const modalTriggers = document.querySelectorAll('[data-modal]');
  
  // Set up modal triggers
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal');
      openModal(modalId);
    });
  });

  // Close button for modals
  modalCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      closeModal(modal.id);
    });
  });
  
  // Close modal when clicking outside content
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
  
  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal.active');
      if (openModal) {
        closeModal(openModal.id);
      }
    }
  });
}

// Initialize dropdowns
function initDropdowns() {
  const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
  
  dropdownTriggers.forEach(trigger => {
    const dropdown = trigger.nextElementSibling;
    if (!dropdown || !dropdown.classList.contains('dropdown-menu')) return;
    
    // Toggle dropdown on click
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  });
}

// Initialize date range picker
function initDateRangePicker() {
  const dateRangeBtn = document.getElementById('dateRangeBtn');
  const dateRangeDropdown = document.getElementById('dateRangeDropdown');
  
  if (dateRangeBtn && dateRangeDropdown) {
    // Set initial date range from localStorage or default
    const savedRange = localStorage.getItem('dateRange') || '7days';
    setActiveDateRange(savedRange);
    
    function setActiveDateRange(range) {
      const options = dateRangeDropdown.querySelectorAll('li');
      options.forEach(option => {
        if (option.getAttribute('data-range') === range) {
          option.classList.add('active');
          dateRangeBtn.querySelector('span').textContent = option.textContent;
        } else {
          option.classList.remove('active');
        }
      });
    }
  }
}

// Initialize tooltips
function initTooltips() {
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
  
  tooltipTriggers.forEach(trigger => {
    const tooltipText = trigger.getAttribute('data-tooltip');
    if (!tooltipText) return;
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    
    // Add event listeners
    trigger.addEventListener('mouseenter', () => {
      document.body.appendChild(tooltip);
      const rect = trigger.getBoundingClientRect();
      tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
      tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
      tooltip.classList.add('visible');
    });
    
    trigger.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 300);
    });
  });
}

// Open a modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  } else {
    console.error(`Modal with ID ${modalId} not found`);
  }
}

// Close a modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    // Check if there are other open modals before removing modal-open class
    if (!document.querySelector('.modal.active')) {
      document.body.classList.remove('modal-open');
    }
  } else {
    console.error(`Modal with ID ${modalId} not found`);
  }
}

// Show toast notification
function showToast(type, title, message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Set icon based on type
  let icon = 'info-circle';
  switch (type) {
    case 'success':
      icon = 'check-circle';
      break;
    case 'error':
      icon = 'exclamation-circle';
      break;
    case 'warning':
      icon = 'exclamation-triangle';
      break;
  }
  
  // Create toast content
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${icon}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Add close event
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  });
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('removing');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }, 5000);
}

// Select a project
function selectProject(projectId, projectName) {
  // Store selected project in local storage
  localStorage.setItem('currentProjectId', projectId);
  localStorage.setItem('currentProject', JSON.stringify({
    id: projectId,
    name: projectName
  }));
  
  // Update UI
  const currentProjectElem = document.getElementById('currentProject');
  if (currentProjectElem) {
    currentProjectElem.textContent = projectName;
  }
  
  // Close project dropdown
  const projectDropdown = document.getElementById('projectDropdownMenu');
  if (projectDropdown) {
    projectDropdown.classList.add('hidden');
  }
  
  // Show dashboard content
  const dashboardContent = document.getElementById('dashboardContent');
  if (dashboardContent) {
    dashboardContent.classList.remove('hidden');
  }
  
  // Hide welcome section
  const welcomeSection = document.getElementById('welcomeSection');
  if (welcomeSection) {
    welcomeSection.classList.add('hidden');
  }
  
  // Show API key section
  const apiKeySection = document.getElementById('apiKeySection');
  if (apiKeySection) {
    apiKeySection.classList.remove('hidden');
  }
  
  // Show success message
  showToast('success', 'Project Selected', `Now viewing "${projectName}"`);
  
  // Reload dashboard data if function exists
  if (typeof loadDashboardData === 'function') {
    loadDashboardData(projectId);
  }
}

// Get date range from localStorage
function getDateRange() {
  const dateRange = localStorage.getItem('dateRange') || '7days';
  let startDate, endDate;
  
  if (dateRange === 'custom') {
    startDate = new Date(localStorage.getItem('customStartDate'));
    endDate = new Date(localStorage.getItem('customEndDate'));
  } else {
    startDate = new Date(localStorage.getItem('startDate'));
    endDate = new Date(localStorage.getItem('endDate'));
  }
  
  return { startDate, endDate };
}

// Format date for display
function formatDate(date) {
  if (!(date instanceof Date)) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString(undefined, options);
}

// Export UI functions
window.xpectraUI = {
  initUI,
  showToast,
  openModal,
  closeModal,
  selectProject,
  getDateRange,
  formatDate
}; 