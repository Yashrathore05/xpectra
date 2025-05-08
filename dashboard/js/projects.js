/**
 * Xpectra Analytics Dashboard
 * Projects Page Script
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the projects page
  initProjectsPage();
});

// Initialize projects page
function initProjectsPage() {
  console.log("Initializing projects page");
  
  // Initialize UI first
  window.xpectraUI.initUI();
  
  // Use the new Firebase utilities for more reliable initialization
  if (window.xpectraFirebaseUtils && window.xpectraFirebaseUtils.getFirebase) {
    window.xpectraFirebaseUtils.getFirebase()
      .then(firebase => {
        console.log("Firebase initialized successfully for projects page");
        
        // Initialize auth and setup listeners
        if (window.xpectraAuth && typeof window.xpectraAuth.initAuth === 'function') {
          window.xpectraAuth.initAuth();
          
          // Set up event listeners
          setupProjectsEventListeners();
        } else {
          console.error("Auth module not available or initAuth missing");
        }
      })
      .catch(error => {
        console.error("Firebase initialization failed:", error);
        
        // Show error message
        const projectsList = document.getElementById('projectsList');
        if (projectsList) {
          projectsList.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <p>Failed to initialize Firebase. Please refresh the page.</p>
            </div>
          `;
        }
      });
  } else {
    // Fall back to the old method
    let checkCount = 0;
    const checkFirebaseInit = setInterval(() => {
      checkCount++;
      
      if (window.xpectraFirebase) {
        clearInterval(checkFirebaseInit);
        console.log("Firebase initialized successfully for projects page (fallback)");
        
        // Initialize auth
        window.xpectraAuth.initAuth();
        
        // Set up event listeners
        setupProjectsEventListeners();
      } else if (checkCount > 20) {
        clearInterval(checkFirebaseInit);
        console.error("Firebase initialization timed out on projects page");
        
        // Show error message
        const projectsList = document.getElementById('projectsList');
        if (projectsList) {
          projectsList.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <p>Connection timed out. Please refresh the page.</p>
            </div>
          `;
        }
      }
    }, 300);
  }
}

// Set up event listeners for projects page
function setupProjectsEventListeners() {
  // Add project form
  const addProjectForm = document.getElementById('addProjectForm');
  if (addProjectForm) {
    addProjectForm.addEventListener('submit', handleAddProject);
  }
  
  // Edit project form
  const editProjectForm = document.getElementById('editProjectForm');
  if (editProjectForm) {
    editProjectForm.addEventListener('submit', handleEditProject);
  }
  
  // Delete project form
  const deleteProjectForm = document.getElementById('deleteProjectForm');
  if (deleteProjectForm) {
    deleteProjectForm.addEventListener('submit', handleDeleteProject);
  }
  
  // Confirm delete input
  const confirmDeleteInput = document.getElementById('confirmDelete');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteInput && confirmDeleteBtn) {
    confirmDeleteInput.addEventListener('input', () => {
      confirmDeleteBtn.disabled = confirmDeleteInput.value !== 'DELETE';
    });
  }
  
  // Cancel delete button
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      window.xpectraUI.closeModal('deleteProjectModal');
    });
  }
  
  // Add project button in sidebar
  const addProjectBtn = document.getElementById('addProjectBtn');
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
      window.xpectraUI.openModal('addProjectModal');
    });
  }
  
  // Add new project button in header
  const addNewProjectBtn = document.getElementById('addNewProjectBtn');
  if (addNewProjectBtn) {
    addNewProjectBtn.addEventListener('click', () => {
      window.xpectraUI.openModal('addProjectModal');
    });
  }
  
  // Empty state add button
  const emptyStateAddBtn = document.getElementById('emptyStateAddBtn');
  if (emptyStateAddBtn) {
    emptyStateAddBtn.addEventListener('click', () => {
      window.xpectraUI.openModal('addProjectModal');
    });
  }
  
  // Check auth state and load projects if authenticated
  checkAuthAndLoadProjects();
}

// Check authentication state and load projects if authenticated
function checkAuthAndLoadProjects() {
  const { auth } = window.xpectraFirebase;
  
  auth.onAuthStateChanged(user => {
    const welcomeSection = document.getElementById('welcomeSection');
    const projectsContent = document.getElementById('projectsContent');
    
    if (user) {
      // User is signed in
      if (welcomeSection) welcomeSection.classList.add('hidden');
      if (projectsContent) projectsContent.classList.remove('hidden');
      
      // Load user's projects
      loadProjects();
    } else {
      // User is not signed in
      if (welcomeSection) welcomeSection.classList.remove('hidden');
      if (projectsContent) projectsContent.classList.add('hidden');
    }
  });
}

// Load projects from Firestore
async function loadProjects() {
  const projectsList = document.getElementById('projectsList');
  const projectsEmpty = document.getElementById('projectsEmpty');
  
  if (!projectsList) {
    console.error("Projects list element not found");
    return;
  }
  
  // Show loading state
  projectsList.innerHTML = `
    <div class="loading-projects">
      <i class="fas fa-spinner fa-spin"></i> Loading projects...
    </div>
  `;
  
  // Check if Firebase is initialized
  if (!window.xpectraFirebase || !window.xpectraFirebase.db) {
    console.error("Firebase not initialized, cannot load projects");
    projectsList.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Firebase connection error. Please refresh the page or try again later.</p>
      </div>
    `;
    return;
  }
  
  const { db } = window.xpectraFirebase;
  
  // Check if user is authenticated and get user object
  let user;
  try {
    // Try to get user from xpectraAuth
    if (window.xpectraAuth && typeof window.xpectraAuth.getCurrentUser === 'function') {
      user = window.xpectraAuth.getCurrentUser();
    }
    
    // If that fails, try to get directly from Firebase
    if (!user && window.xpectraFirebase && window.xpectraFirebase.auth) {
      user = window.xpectraFirebase.auth.currentUser;
    }
    
    // If still no user, check localStorage as final fallback
    if (!user) {
      const cachedUser = localStorage.getItem('xpectra_auth_user');
      if (cachedUser) {
        user = JSON.parse(cachedUser);
      }
    }
  } catch (error) {
    console.error("Error getting current user:", error);
  }
  
  if (!user || !user.uid) {
    console.error("User not authenticated, cannot load projects");
    projectsList.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Authentication required. Please sign in to view projects.</p>
        <button class="btn btn-primary mt-3" onclick="window.xpectraAuth.showLoginModal()">
          <i class="fas fa-sign-in-alt"></i> Sign In
        </button>
      </div>
    `;
    return;
  }
  
  console.log("Attempting to load projects for user:", user.uid);
  
  try {
    // First, try a simple query to test Firestore connection
    const testQuery = await db.collection('projects').limit(1).get();
    console.log("Firestore connection test successful");
    
    // Now query for user's projects
    const snapshot = await db.collection('projects')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    console.log(`Projects query returned ${snapshot.size} projects`);
    
    if (snapshot.empty) {
      // No projects found
      console.log("No projects found for user, showing empty state");
      if (projectsEmpty) projectsEmpty.classList.remove('hidden');
      projectsList.innerHTML = '';
      return;
    }
    
    // Hide no projects message and clear list
    if (projectsEmpty) projectsEmpty.classList.add('hidden');
    projectsList.innerHTML = '';
    
    console.log("Adding projects to UI...");
    
    // Add projects to list
    snapshot.forEach(doc => {
      const project = {
        id: doc.id,
        ...doc.data()
      };
      
      addProjectToList(project);
    });
    
    console.log("Projects loaded successfully");
    
  } catch (error) {
    console.error('Error loading projects:', error);
    
    // Detailed error logging
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
    
    // Show user-friendly error with more details
    projectsList.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load projects: ${window.xpectraFirebaseUtils && window.xpectraFirebaseUtils.getFirebaseErrorMessage ? window.xpectraFirebaseUtils.getFirebaseErrorMessage(error) : (error.message || 'Unknown error')}</p>
        <button class="btn btn-primary retry-btn" onclick="loadProjects()">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
    
    // Create a fallback button to add a project even if loading failed
    const errorMessage = projectsList.querySelector('.error-message');
    if (errorMessage) {
      const fallbackButton = document.createElement('button');
      fallbackButton.className = 'btn btn-outline-primary mt-3';
      fallbackButton.innerHTML = '<i class="fas fa-plus"></i> Create New Project';
      fallbackButton.addEventListener('click', () => {
        window.xpectraUI.openModal('addProjectModal');
      });
      errorMessage.appendChild(fallbackButton);
    }
    
    // Show toast notification
    window.xpectraUI.showToast('error', 'Error', 'Failed to load projects');
  }
}

// Add a project to the projects list
function addProjectToList(project) {
  const projectsList = document.getElementById('projectsList');
  if (!projectsList) return;
  
  const projectItem = document.createElement('div');
  projectItem.className = 'project-item';
  projectItem.innerHTML = `
    <div class="project-info">
      <h3>${escapeHTML(project.name)}</h3>
      <p><a href="${escapeHTML(project.url)}" target="_blank">${escapeHTML(project.url)}</a></p>
      <div class="project-api-key">
        <span>API Key: </span>
        <code>${maskApiKey(project.apiKey)}</code>
        <button class="btn btn-icon btn-sm toggle-api-key" title="Show/Hide API Key">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-icon btn-sm copy-api-key" title="Copy API Key">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    </div>
    <div class="project-actions">
      <button class="btn btn-outline btn-sm select-project" title="Select Project">
        <i class="fas fa-check"></i> Select
      </button>
      <button class="btn btn-outline btn-sm edit-project" title="Edit Project">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button class="btn btn-outline btn-sm delete-project" title="Delete Project">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>
  `;
  
  projectsList.appendChild(projectItem);
  
  // Store project data in the DOM element
  projectItem.dataset.project = JSON.stringify(project);
  
  // Set up event listeners for this project item
  setupProjectItemListeners(projectItem, project);
}

// Set up event listeners for a project item
function setupProjectItemListeners(projectItem, project) {
  // Toggle API key visibility
  const toggleApiKeyBtn = projectItem.querySelector('.toggle-api-key');
  const apiKeyElement = projectItem.querySelector('.project-api-key code');
  
  if (toggleApiKeyBtn && apiKeyElement) {
    toggleApiKeyBtn.addEventListener('click', () => {
      const isShown = toggleApiKeyBtn.getAttribute('data-shown') === 'true';
      
      if (isShown) {
        apiKeyElement.textContent = maskApiKey(project.apiKey);
        toggleApiKeyBtn.setAttribute('data-shown', 'false');
        toggleApiKeyBtn.querySelector('i').className = 'fas fa-eye';
      } else {
        apiKeyElement.textContent = project.apiKey;
        toggleApiKeyBtn.setAttribute('data-shown', 'true');
        toggleApiKeyBtn.querySelector('i').className = 'fas fa-eye-slash';
      }
    });
  }
  
  // Copy API key
  const copyApiKeyBtn = projectItem.querySelector('.copy-api-key');
  if (copyApiKeyBtn) {
    copyApiKeyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(project.apiKey);
        window.xpectraUI.showToast('success', 'Copied', 'API key copied to clipboard');
      } catch (err) {
        window.xpectraUI.showToast('error', 'Copy Failed', 'Could not copy API key');
        console.error('Copy error:', err);
      }
    });
  }
  
  // Select project
  const selectProjectBtn = projectItem.querySelector('.select-project');
  if (selectProjectBtn) {
    selectProjectBtn.addEventListener('click', () => {
      window.xpectraUI.selectProject(project.id, project.name);
      
      // Store the entire project in localStorage
      localStorage.setItem('currentProject', JSON.stringify(project));
    });
  }
  
  // Edit project
  const editProjectBtn = projectItem.querySelector('.edit-project');
  if (editProjectBtn) {
    editProjectBtn.addEventListener('click', () => {
      showEditProjectModal(project);
    });
  }
  
  // Delete project
  const deleteProjectBtn = projectItem.querySelector('.delete-project');
  if (deleteProjectBtn) {
    deleteProjectBtn.addEventListener('click', () => {
      showDeleteProjectModal(project);
    });
  }
}

// Show edit project modal
function showEditProjectModal(project) {
  const editProjectNameInput = document.getElementById('editProjectName');
  const editProjectURLInput = document.getElementById('editProjectURL');
  const editProjectIdInput = document.getElementById('editProjectId');
  
  if (editProjectNameInput && editProjectURLInput && editProjectIdInput) {
    editProjectNameInput.value = project.name;
    editProjectURLInput.value = project.url;
    editProjectIdInput.value = project.id;
    
    window.xpectraUI.openModal('editProjectModal');
  }
}

// Show delete project modal
function showDeleteProjectModal(project) {
  const deleteProjectIdInput = document.getElementById('deleteProjectId');
  const confirmDeleteInput = document.getElementById('confirmDelete');
  const projectNameElement = document.getElementById('deleteProjectName');
  
  if (deleteProjectIdInput && confirmDeleteInput) {
    deleteProjectIdInput.value = project.id;
    confirmDeleteInput.value = '';
    
    if (projectNameElement) {
      projectNameElement.textContent = project.name;
    }
    
    // Disable delete button until confirmed
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.disabled = true;
    }
    
    window.xpectraUI.openModal('deleteProjectModal');
  }
}

// Handle add project form submission
async function handleAddProject(e) {
  e.preventDefault();
  
  const { db } = window.xpectraFirebase;
  const { getCurrentUser } = window.xpectraAuth;
  
  const projectName = document.getElementById('projectName').value;
  const projectURL = document.getElementById('projectURL').value;
  
  if (!projectName || !projectURL) {
    window.xpectraUI.showToast('error', 'Validation Error', 'Please fill out all fields');
    return;
  }
  
  // Validate URL
  let formattedURL = projectURL;
  try {
    // Make sure URL has protocol
    if (!projectURL.startsWith('http://') && !projectURL.startsWith('https://')) {
      formattedURL = 'https://' + projectURL;
    }
    new URL(formattedURL);
  } catch (err) {
    window.xpectraUI.showToast('error', 'Validation Error', 'Please enter a valid URL');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#addProjectForm button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
  submitBtn.disabled = true;
  
  const user = getCurrentUser();
  if (!user) {
    window.xpectraUI.showToast('error', 'Authentication Error', 'Please sign in to create a project');
    submitBtn.innerHTML = 'Create Project';
    submitBtn.disabled = false;
    return;
  }
  
  try {
    // Generate a new API key
    const apiKey = generateApiKey();
    
    // Add project to Firestore
    const projectRef = await db.collection('projects').add({
      name: projectName,
      url: formattedURL,
      apiKey: apiKey,
      userId: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Get the new project with its ID
    const newProject = {
      id: projectRef.id,
      name: projectName,
      url: formattedURL,
      apiKey: apiKey,
      userId: user.uid,
      createdAt: new Date()
    };
    
    // Add the new project to the list
    addProjectToList(newProject);
    
    // Close modal and reset form
    window.xpectraUI.closeModal('addProjectModal');
    document.getElementById('addProjectForm').reset();
    
    // Show success message
    window.xpectraUI.showToast('success', 'Project Created', `Project "${projectName}" has been created successfully`);
    
    // Check if we had no projects before
    const projectsEmpty = document.getElementById('projectsEmpty');
    if (projectsEmpty) {
      projectsEmpty.classList.add('hidden');
    }
    
  } catch (error) {
    console.error('Error adding project:', error);
    window.xpectraUI.showToast('error', 'Error', 'Failed to create project: ' + (error.message || 'Unknown error'));
  } finally {
    // Reset button
    submitBtn.innerHTML = 'Create Project';
    submitBtn.disabled = false;
  }
}

// Handle edit project form submission
async function handleEditProject(e) {
  e.preventDefault();
  
  const { db } = window.xpectraFirebase;
  
  const projectId = document.getElementById('editProjectId').value;
  const projectName = document.getElementById('editProjectName').value;
  const projectURL = document.getElementById('editProjectURL').value;
  
  if (!projectId || !projectName || !projectURL) {
    window.xpectraUI.showToast('error', 'Validation Error', 'Please fill out all fields');
    return;
  }
  
  // Validate URL
  try {
    new URL(projectURL);
  } catch (err) {
    window.xpectraUI.showToast('error', 'Validation Error', 'Please enter a valid URL');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#editProjectForm button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  submitBtn.disabled = true;
  
  try {
    // Update project in Firestore
    await db.collection('projects').doc(projectId).update({
      name: projectName,
      url: projectURL,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Close modal
    window.xpectraUI.closeModal('editProjectModal');
    
    // Reload projects
    loadProjects();
    
    // Show success message
    window.xpectraUI.showToast('success', 'Project Updated', `Project "${projectName}" has been updated successfully`);
    
    // Update currentProject in localStorage if this is the current project
    const currentProject = JSON.parse(localStorage.getItem('currentProject') || '{}');
    if (currentProject.id === projectId) {
      currentProject.name = projectName;
      currentProject.url = projectURL;
      localStorage.setItem('currentProject', JSON.stringify(currentProject));
      
      // Update project name in header
      const currentProjectName = document.getElementById('currentProjectName');
      if (currentProjectName) {
        currentProjectName.textContent = projectName;
      }
    }
    
  } catch (error) {
    console.error('Error updating project:', error);
    window.xpectraUI.showToast('error', 'Error', 'Failed to update project');
  } finally {
    // Reset button
    submitBtn.innerHTML = 'Save Changes';
    submitBtn.disabled = false;
  }
}

// Handle delete project form submission
async function handleDeleteProject(e) {
  e.preventDefault();
  
  const { db } = window.xpectraFirebase;
  
  const projectId = document.getElementById('deleteProjectId').value;
  const confirmText = document.getElementById('confirmDelete').value;
  
  if (confirmText !== 'DELETE') {
    window.xpectraUI.showToast('error', 'Validation Error', 'Please type "DELETE" to confirm');
    return;
  }
  
  // Show loading state
  const submitBtn = document.getElementById('confirmDeleteBtn');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
  submitBtn.disabled = true;
  
  try {
    // Delete project from Firestore
    await db.collection('projects').doc(projectId).delete();
    
    // Close modal
    window.xpectraUI.closeModal('deleteProjectModal');
    
    // Reload projects
    loadProjects();
    
    // Show success message
    window.xpectraUI.showToast('success', 'Project Deleted', 'Project has been deleted successfully');
    
    // Clear currentProject in localStorage if this was the current project
    const currentProject = JSON.parse(localStorage.getItem('currentProject') || '{}');
    if (currentProject.id === projectId) {
      localStorage.removeItem('currentProject');
      localStorage.removeItem('currentProjectId');
      
      // Update UI to reflect no project selected
      const currentProjectName = document.getElementById('currentProjectName');
      if (currentProjectName) {
        currentProjectName.textContent = 'No project selected';
      }
    }
    
  } catch (error) {
    console.error('Error deleting project:', error);
    window.xpectraUI.showToast('error', 'Error', 'Failed to delete project');
  } finally {
    // Reset button
    submitBtn.innerHTML = 'Delete Project';
    submitBtn.disabled = true;
    
    // Reset confirm input
    document.getElementById('confirmDelete').value = '';
  }
}

// Generate a secure API key
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Generate a random string of 32 characters
  const randomValues = new Uint32Array(32);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
}

// Generate a new API key for a project
async function regenerateApiKey(projectId) {
  const { db } = window.xpectraFirebase;
  
  if (!projectId) {
    window.xpectraUI.showToast('error', 'Error', 'No project selected');
    return;
  }
  
  try {
    // Generate a new API key
    const apiKey = generateApiKey();
    
    // Update project in Firestore
    await db.collection('projects').doc(projectId).update({
      apiKey: apiKey,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Reload projects
    loadProjects();
    
    // Show success message
    window.xpectraUI.showToast('success', 'API Key Updated', 'API key has been regenerated successfully');
    
    // Update currentProject in localStorage if this is the current project
    const currentProject = JSON.parse(localStorage.getItem('currentProject') || '{}');
    if (currentProject.id === projectId) {
      currentProject.apiKey = apiKey;
      localStorage.setItem('currentProject', JSON.stringify(currentProject));
    }
    
    return apiKey;
  } catch (error) {
    console.error('Error regenerating API key:', error);
    window.xpectraUI.showToast('error', 'Error', 'Failed to regenerate API key');
    return null;
  }
}

// Mask API key for display
function maskApiKey(apiKey) {
  if (!apiKey) return '••••••••••••••••';
  
  const firstChars = apiKey.substring(0, 4);
  const lastChars = apiKey.substring(apiKey.length - 4);
  const middleDots = '••••••••••••••••••••••••';
  
  return `${firstChars}${middleDots}${lastChars}`;
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
} 