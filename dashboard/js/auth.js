/**
 * Xpectra Analytics Dashboard
 * Authentication Module
 */

// Initialize auth state object
let authState = {
  user: null,
  loading: true,
  initialized: false
};

// DOM Elements (will be initialized when DOM is loaded)
let loginForm, signupForm, loginBtn, logoutBtn, welcomeLoginBtn, welcomeSignupBtn;
let showLoginModalBtn, showSignupModalBtn, userInfo, userName, userEmail;
let welcomeSection, dashboardContent, projectSelection;

// Initialize auth state
function initAuth() {
  // Add a safety timeout to remove loading state after 5 seconds
  // This ensures the loading spinner doesn't run forever if auth fails
  setTimeout(function() {
    if (document.body.classList.contains('loading')) {
      console.warn("Auth safety: Removing loading state due to timeout");
      document.body.classList.remove('loading');
    }
  }, 5000);

  // Make sure Firebase is initialized before continuing
  if (!window.xpectraFirebase) {
    console.error("Firebase not initialized yet. Retrying in 500ms...");
    setTimeout(initAuth, 500);
    return;
  }
  
  console.log("Initializing auth module...");
  
  // Get Firebase services
  const { auth } = window.xpectraFirebase;
  
  // Initialize DOM elements
  initDOMElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check for cached auth data
  const cachedUser = localStorage.getItem('xpectra_auth_user');
  if (cachedUser) {
    try {
      const userData = JSON.parse(cachedUser);
      // Apply cached user data immediately to prevent flash of unauthenticated content
      authState.user = userData;
      updateUIForAuthenticatedUser(userData);
    } catch (e) {
      console.error("Error parsing cached user data:", e);
      localStorage.removeItem('xpectra_auth_user');
    }
  }
  
  // Listen for auth state changes
  auth.onAuthStateChanged(handleAuthStateChanged);
  
  console.log("Auth module initialized");
}

// Initialize DOM elements
function initDOMElements() {
  console.log("Initializing auth DOM elements");
  
  // Get form elements
  loginForm = document.getElementById('loginForm');
  signupForm = document.getElementById('signupForm');
  
  // Get button elements
  loginBtn = document.getElementById('loginBtn');
  logoutBtn = document.getElementById('logoutBtn');
  welcomeLoginBtn = document.getElementById('welcomeLoginBtn');
  welcomeSignupBtn = document.getElementById('welcomeSignupBtn');
  showLoginModalBtn = document.getElementById('showLoginModal');
  showSignupModalBtn = document.getElementById('showSignupModal');
  
  // Get user info elements
  userInfo = document.getElementById('userInfo');
  userName = document.getElementById('userName');
  userEmail = document.getElementById('userEmail');
  
  // Get section elements
  welcomeSection = document.getElementById('welcomeSection');
  dashboardContent = document.getElementById('dashboardContent');
  projectSelection = document.getElementById('projectSelection');
  
  // Create modals if they don't exist
  createAuthModals();
}

// Create auth modals if they don't exist
function createAuthModals() {
  // Check if modals container exists
  let modalsContainer = document.getElementById('modalsContainer');
  if (!modalsContainer) {
    modalsContainer = document.createElement('div');
    modalsContainer.id = 'modalsContainer';
    document.body.appendChild(modalsContainer);
  }
  
  // Create login modal if it doesn't exist
  if (!document.getElementById('loginModal')) {
    const loginModalHTML = `
      <div id="loginModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Sign In</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <form id="loginForm">
              <div class="form-group">
                <label for="loginEmail">Email</label>
                <input type="email" id="loginEmail" required>
              </div>
              <div class="form-group">
                <label for="loginPassword">Password</label>
                <input type="password" id="loginPassword" required>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Sign In</button>
              </div>
            </form>
            <div class="form-footer">
              <p>Don't have an account? <a href="#" id="showSignupModal">Create one</a></p>
            </div>
          </div>
        </div>
      </div>
    `;
    modalsContainer.insertAdjacentHTML('beforeend', loginModalHTML);
  }
  
  // Create signup modal if it doesn't exist
  if (!document.getElementById('signupModal')) {
    const signupModalHTML = `
      <div id="signupModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Create Account</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <form id="signupForm">
              <div class="form-group">
                <label for="signupName">Name</label>
                <input type="text" id="signupName" required>
              </div>
              <div class="form-group">
                <label for="signupEmail">Email</label>
                <input type="email" id="signupEmail" required>
              </div>
              <div class="form-group">
                <label for="signupPassword">Password</label>
                <input type="password" id="signupPassword" required minlength="6">
              </div>
              <div class="form-group">
                <label for="signupConfirmPassword">Confirm Password</label>
                <input type="password" id="signupConfirmPassword" required minlength="6">
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Create Account</button>
              </div>
            </form>
            <div class="form-footer">
              <p>Already have an account? <a href="#" id="showLoginModal">Sign In</a></p>
            </div>
          </div>
        </div>
      </div>
    `;
    modalsContainer.insertAdjacentHTML('beforeend', signupModalHTML);
  }
  
  // Create toast container if it doesn't exist
  if (!document.getElementById('toastContainer')) {
    const toastContainerHTML = `<div id="toastContainer" class="toast-container"></div>`;
    document.body.insertAdjacentHTML('beforeend', toastContainerHTML);
  }
  
  // Reinitialize DOM elements after creating modals
  loginForm = document.getElementById('loginForm');
  signupForm = document.getElementById('signupForm');
  showLoginModalBtn = document.getElementById('showLoginModal');
  showSignupModalBtn = document.getElementById('showSignupModal');
}

// Handle auth state changes
async function handleAuthStateChanged(user) {
  console.log("Auth state changed");
  authState.loading = false;
  
  if (user) {
    // User is signed in
    console.log("User signed in:", user.email);
    authState.user = user;
    
    // Store user data in localStorage for persistence
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null
    };
    localStorage.setItem('xpectra_auth_user', JSON.stringify(userData));
    
    updateUIForAuthenticatedUser(user);
    
    // Load user's projects
    await loadUserProjects();
    
    // Display toast notification only if this is not from page load
    if (authState.initialized) {
      window.xpectraUI.showToast('success', 'Signed In', `Welcome back, ${user.displayName || user.email}`);
    }
  } else {
    // User is signed out
    console.log("User signed out");
    authState.user = null;
    
    // Remove user data from localStorage
    localStorage.removeItem('xpectra_auth_user');
    
    updateUIForUnauthenticatedUser();
  }
  
  // Set initialized flag
  if (!authState.initialized) {
    authState.initialized = true;
    // Remove loading state if any
    document.body.classList.remove('loading');
  }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser(user) {
  // Update user info
  if (userInfo) userInfo.classList.remove('hidden');
  if (userName) userName.textContent = user.displayName || 'User';
  if (userEmail) userEmail.textContent = user.email;
  
  // Show/hide elements
  if (loginBtn) loginBtn.classList.add('hidden');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
  if (welcomeSection) welcomeSection.classList.add('hidden');
  if (projectSelection) projectSelection.classList.remove('hidden');
  
  // Show dashboard content only if a project is selected
  const currentProject = localStorage.getItem('currentProject');
  if (currentProject && dashboardContent) {
    dashboardContent.classList.remove('hidden');
  }
}

// Update UI for unauthenticated user
function updateUIForUnauthenticatedUser() {
  // Update user info
  if (userInfo) userInfo.classList.add('hidden');
  
  // Show/hide elements
  if (loginBtn) loginBtn.classList.remove('hidden');
  if (logoutBtn) logoutBtn.classList.add('hidden');
  if (welcomeSection) welcomeSection.classList.remove('hidden');
  if (dashboardContent) dashboardContent.classList.add('hidden');
  if (projectSelection) projectSelection.classList.add('hidden');
  
  // Clear local storage
  localStorage.removeItem('currentProject');
  localStorage.removeItem('currentProjectId');
}

// Set up event listeners
function setupEventListeners() {
  console.log("Setting up auth event listeners");
  
  // Login form
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  } else {
    console.warn("Login form not found");
  }
  
  // Signup form
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  } else {
    console.warn("Signup form not found");
  }
  
  // Login button
  if (loginBtn) {
    loginBtn.addEventListener('click', showLoginModal);
  } else {
    console.warn("Login button not found");
  }
  
  // Welcome login button
  if (welcomeLoginBtn) {
    welcomeLoginBtn.addEventListener('click', showLoginModal);
  }
  
  // Welcome signup button
  if (welcomeSignupBtn) {
    welcomeSignupBtn.addEventListener('click', showSignupModal);
  }
  
  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  } else {
    console.warn("Logout button not found");
  }
  
  // Show login modal button (in signup form)
  const loginLink = document.getElementById('showLoginModal');
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      showLoginModal();
    });
  }
  
  // Show signup modal button (in login form)
  const signupLink = document.getElementById('showSignupModal');
  if (signupLink) {
    signupLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSignupModal();
    });
  }
  
  // Close buttons for modals
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  modalCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  // Close modal when clicking outside
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  
  const { auth } = window.xpectraFirebase;
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    window.xpectraUI.showToast('error', 'Login Failed', 'Please enter both email and password');
    return;
  }
  
  try {
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    submitBtn.disabled = true;
    
    // Sign in with Firebase
    await auth.signInWithEmailAndPassword(email, password);
    
    // Close modal
    closeModal('loginModal');
    
    // Reset form
    loginForm.reset();
  } catch (error) {
    let errorMessage = error.message;
    // Format error message for better readability
    if (errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/user-not-found')) {
      errorMessage = 'Invalid email or password';
    }
    window.xpectraUI.showToast('error', 'Login Failed', errorMessage);
    console.error('Login error:', error);
  } finally {
    // Reset button
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = 'Sign In';
    submitBtn.disabled = false;
  }
}

// Handle signup form submission
async function handleSignup(e) {
  e.preventDefault();
  
  const { auth, db } = window.xpectraFirebase;
  
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  if (!name || !email || !password || !confirmPassword) {
    window.xpectraUI.showToast('error', 'Signup Failed', 'Please fill out all fields');
    return;
  }
  
  if (password !== confirmPassword) {
    window.xpectraUI.showToast('error', 'Signup Failed', 'Passwords do not match');
    return;
  }
  
  try {
    // Show loading state
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;
    
    // Create user with Firebase
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update profile
    await user.updateProfile({ displayName: name });
    
    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      name,
      email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Close modal
    closeModal('signupModal');
    
    // Reset form
    signupForm.reset();
    
    // Show success message
    window.xpectraUI.showToast('success', 'Account Created', 'Your account has been created successfully!');
    
    // Create default project
    createDefaultProject(user.uid, name);
  } catch (error) {
    let errorMessage = error.message;
    // Format error message for better readability
    if (errorMessage.includes('auth/email-already-in-use')) {
      errorMessage = 'An account with this email already exists';
    } else if (errorMessage.includes('auth/weak-password')) {
      errorMessage = 'Password is too weak. Use at least 6 characters.';
    }
    window.xpectraUI.showToast('error', 'Signup Failed', errorMessage);
    console.error('Signup error:', error);
  } finally {
    // Reset button
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = 'Create Account';
    submitBtn.disabled = false;
  }
}

// Create default project for new user
async function createDefaultProject(userId, userName) {
  try {
    const { db } = window.xpectraFirebase;
    
    // Generate API key
    const apiKey = generateApiKey();
    
    // Create project document
    const projectRef = await db.collection('projects').add({
      name: 'My First Project',
      userId,
      apiKey,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      domain: '', // Will be set by user later
      description: 'Default project created automatically'
    });
    
    // Set as selected project
    await db.collection('users').doc(userId).update({
      selectedProjectId: projectRef.id
    });
    
    console.log('Default project created:', projectRef.id);
  } catch (error) {
    console.error('Error creating default project:', error);
  }
}

// Generate API key
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 32;
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Handle logout
function handleLogout() {
  const { auth } = window.xpectraFirebase;
  
  auth.signOut().then(() => {
    // Clear local storage
    localStorage.removeItem('currentProject');
    localStorage.removeItem('currentProjectId');
    localStorage.removeItem('xpectra_auth_user');
    
    // Show success message
    window.xpectraUI.showToast('success', 'Signed Out', 'You have been signed out successfully');
  }).catch(error => {
    console.error('Logout error:', error);
    window.xpectraUI.showToast('error', 'Logout Failed', error.message);
  });
}

// Show login modal
function showLoginModal() {
  openModal('loginModal');
}

// Show signup modal
function showSignupModal() {
  openModal('signupModal');
}

// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  } else {
    console.error(`Modal with ID ${modalId} not found`);
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  } else {
    console.error(`Modal with ID ${modalId} not found`);
  }
}

// Load user's projects
async function loadUserProjects() {
  try {
    const { auth, db } = window.xpectraFirebase;
    const user = auth.currentUser;
    
    if (!user) {
      console.error('No user signed in');
      return;
    }
    
    const projectsSnapshot = await db.collection('projects')
      .where('userId', '==', user.uid)
      .get();
    
    const projects = [];
    projectsSnapshot.forEach(doc => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Loaded ${projects.length} projects`);
    
    // If user has projects but none selected, select the first one
    if (projects.length > 0) {
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data() || {};
      
      if (!userData.selectedProjectId) {
        await db.collection('users').doc(user.uid).update({
          selectedProjectId: projects[0].id
        });
      }
    }
    
    return projects;
  } catch (error) {
    console.error('Error loading projects:', error);
    window.xpectraUI.showToast('error', 'Error', 'Failed to load projects');
    return [];
  }
}

// Get current user
function getCurrentUser() {
  // First check auth state
  if (authState.user) {
    return authState.user;
  }
  
  // Then check localStorage as fallback
  const cachedUser = localStorage.getItem('xpectra_auth_user');
  if (cachedUser) {
    try {
      return JSON.parse(cachedUser);
    } catch (e) {
      console.error("Error parsing cached user data:", e);
    }
  }
  
  // Finally check Firebase directly
  const { auth } = window.xpectraFirebase;
  return auth.currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getCurrentUser();
}

// Export auth functions
window.xpectraAuth = {
  initAuth,
  showLoginModal,
  showSignupModal,
  handleLogout,
  getCurrentUser,
  isAuthenticated,
  openModal,
  closeModal
}; 