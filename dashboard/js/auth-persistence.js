/**
 * Xpectra Analytics Dashboard
 * Auth Persistence Helper
 * 
 * This script ensures smooth auth transitions between pages
 * by showing the authenticated UI immediately based on cached data
 */

document.addEventListener('DOMContentLoaded', function() {
  // Apply auth state immediately from localStorage
  applyInitialAuthState();
  
  // Add transitions for internal links
  setupPageTransitions();
});

// Apply initial auth state from localStorage
function applyInitialAuthState() {
  const cachedUser = localStorage.getItem('xpectra_auth_user');
  if (!cachedUser) return;
  
  try {
    const userData = JSON.parse(cachedUser);
    
    // Apply basic UI changes immediately based on cached auth state
    // Hide/show main UI sections
    const welcomeSection = document.getElementById('welcomeSection');
    const projectsContent = document.getElementById('projectsContent');
    const dashboardContent = document.getElementById('dashboardContent');
    const projectSelection = document.getElementById('projectSelection');
    
    // Update login/logout buttons
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Update user info if present
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (welcomeSection) welcomeSection.classList.add('hidden');
    if (projectsContent) projectsContent.classList.remove('hidden');
    if (projectSelection) projectSelection.classList.remove('hidden');
    
    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    
    if (userInfo) userInfo.classList.remove('hidden');
    if (userName) userName.textContent = userData.displayName || 'User';
    if (userEmail) userEmail.textContent = userData.email;
    
    // Show dashboard content if a project is selected
    const currentProject = localStorage.getItem('currentProject');
    if (currentProject && dashboardContent) {
      dashboardContent.classList.remove('hidden');
    }
    
    console.log("Applied cached auth state for user:", userData.email);
  } catch (e) {
    console.error("Error applying cached auth state:", e);
    localStorage.removeItem('xpectra_auth_user');
  }
}

// Set up smooth page transitions
function setupPageTransitions() {
  // Add fade-out effect to internal navigation
  document.addEventListener('click', function(e) {
    // Find closest anchor tag
    const anchor = e.target.closest('a');
    
    if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
      // This is an internal link
      const currentPath = window.location.pathname;
      const targetPath = new URL(anchor.href).pathname;
      
      // Skip if it's the same page or has a hash part
      if (currentPath === targetPath || anchor.href.includes('#')) {
        return;
      }
      
      e.preventDefault();
      
      // Add transition class
      document.body.classList.add('page-transition');
      
      // Navigate after short delay
      setTimeout(() => {
        window.location.href = anchor.href;
      }, 150);
    }
  });
}

// Add CSS for smooth transitions
const style = document.createElement('style');
style.textContent = `
  body {
    transition: opacity 0.15s ease-in-out;
  }
  
  body.page-transition {
    opacity: 0.8;
  }
  
  /* Initial load fade-in */
  body {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(style); 