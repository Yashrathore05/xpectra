/**
 * Xpectra Analytics Dashboard
 * Settings Page Script
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the settings page
  initSettingsPage();
});

// Initialize the settings page
function initSettingsPage() {
  // Initialize Firebase and other modules
  window.xpectraUI.initUI();
  window.xpectraAuth.initAuth();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check authentication state and load settings if authenticated
  checkAuthAndLoadSettings();
}

// Set up event listeners
function setupEventListeners() {
  const settingsTabs = document.querySelectorAll('.settings-tab');
  const profileForm = document.getElementById('profileForm');
  const passwordForm = document.getElementById('passwordForm');
  const twoFactorSwitch = document.getElementById('twoFactorSwitch');
  const configureTwoFactorBtn = document.getElementById('configureTwoFactorBtn');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const deleteAccountForm = document.getElementById('deleteAccountForm');
  const cancelDeleteAccountBtn = document.getElementById('cancelDeleteAccountBtn');
  const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
  const removeAvatarBtn = document.getElementById('removeAvatarBtn');
  const addWebhookBtn = document.getElementById('addWebhookBtn');
  const webhookForm = document.getElementById('webhookForm');
  
  // Settings tabs
  if (settingsTabs) {
    settingsTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Get the tab name
        const tabName = tab.getAttribute('data-tab');
        
        // Remove active class from all tabs
        settingsTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Hide all settings sections
        const settingsSections = document.querySelectorAll('.settings-section');
        settingsSections.forEach(section => {
          section.classList.remove('active');
        });
        
        // Show selected settings section
        const selectedSection = document.getElementById(`${tabName}Settings`);
        if (selectedSection) {
          selectedSection.classList.add('active');
        }
      });
    });
  }
  
  // Profile form submission
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }
  
  // Password form submission
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordUpdate);
  }
  
  // Two-factor authentication toggle
  if (twoFactorSwitch && configureTwoFactorBtn) {
    twoFactorSwitch.addEventListener('change', () => {
      configureTwoFactorBtn.disabled = !twoFactorSwitch.checked;
    });
  }
  
  // Delete account button
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
      window.xpectraUI.openModal('deleteAccountModal');
    });
  }
  
  // Cancel delete account button
  if (cancelDeleteAccountBtn) {
    cancelDeleteAccountBtn.addEventListener('click', () => {
      window.xpectraUI.closeModal('deleteAccountModal');
    });
  }
  
  // Delete account form submission
  if (deleteAccountForm) {
    deleteAccountForm.addEventListener('submit', handleDeleteAccount);
  }
  
  // Upload avatar button
  if (uploadAvatarBtn) {
    uploadAvatarBtn.addEventListener('click', () => {
      // In a real app, would open a file picker
      window.xpectraUI.showToast('info', 'Not Implemented', 'Avatar upload is not implemented in the demo');
    });
  }
  
  // Remove avatar button
  if (removeAvatarBtn) {
    removeAvatarBtn.addEventListener('click', () => {
      // In a real app, would remove the user's avatar
      window.xpectraUI.showToast('info', 'Not Implemented', 'Avatar removal is not implemented in the demo');
    });
  }
  
  // Add webhook button
  if (addWebhookBtn) {
    addWebhookBtn.addEventListener('click', () => {
      window.xpectraUI.openModal('addWebhookModal');
    });
  }
  
  // Webhook form submission
  if (webhookForm) {
    webhookForm.addEventListener('submit', handleWebhookAdd);
  }
  
  // Setup notification switches
  setupNotificationSwitches();
  
  // Setup preference options
  setupPreferenceOptions();
}

// Check auth state and load settings if authenticated
function checkAuthAndLoadSettings() {
  const { auth } = window.xpectraFirebase;
  
  auth.onAuthStateChanged(user => {
    const welcomeSection = document.getElementById('welcomeSection');
    const settingsContent = document.getElementById('settingsContent');
    const projectInfo = document.getElementById('projectInfo');
    
    if (user) {
      // User is signed in
      if (welcomeSection) welcomeSection.classList.add('hidden');
      if (settingsContent) settingsContent.classList.remove('hidden');
      if (projectInfo) projectInfo.classList.remove('hidden');
      
      // Update project name in header
      updateProjectInfo();
      
      // Load user settings
      loadUserSettings(user);
      
      // Load API keys
      loadApiKeys();
    } else {
      // User is not signed in
      if (welcomeSection) welcomeSection.classList.remove('hidden');
      if (settingsContent) settingsContent.classList.add('hidden');
      if (projectInfo) projectInfo.classList.add('hidden');
    }
  });
}

// Update project info in header
function updateProjectInfo() {
  const currentProjectName = document.getElementById('currentProjectName');
  if (!currentProjectName) return;
  
  // Get current project from local storage
  const currentProject = JSON.parse(localStorage.getItem('currentProject') || '{}');
  
  if (currentProject.id) {
    currentProjectName.textContent = currentProject.name;
  } else {
    currentProjectName.textContent = 'No project selected';
  }
}

// Load user settings
function loadUserSettings(user) {
  const { db } = window.xpectraFirebase;
  
  // Get user's settings from Firestore
  db.collection('users').doc(user.uid).get()
    .then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        
        // Fill profile form
        fillProfileForm(userData);
      } else {
        // Create user document if it doesn't exist
        db.collection('users').doc(user.uid).set({
          name: user.displayName || '',
          email: user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Fill profile form with available data
        fillProfileForm({
          name: user.displayName || '',
          email: user.email
        });
      }
    })
    .catch(error => {
      console.error('Error loading user settings:', error);
      window.xpectraUI.showToast('error', 'Error', 'Could not load user settings');
    });
}

// Fill profile form with user data
function fillProfileForm(userData) {
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profilePhone = document.getElementById('profilePhone');
  const profileCompany = document.getElementById('profileCompany');
  const profileBio = document.getElementById('profileBio');
  
  if (profileName) profileName.value = userData.name || '';
  if (profileEmail) profileEmail.value = userData.email || '';
  if (profilePhone) profilePhone.value = userData.phone || '';
  if (profileCompany) profileCompany.value = userData.company || '';
  if (profileBio) profileBio.value = userData.bio || '';
}

// Handle profile form submission
function handleProfileUpdate(e) {
  e.preventDefault();
  
  const { auth, db } = window.xpectraFirebase;
  const user = auth.currentUser;
  
  if (!user) return;
  
  const profileName = document.getElementById('profileName').value;
  const profilePhone = document.getElementById('profilePhone').value;
  const profileCompany = document.getElementById('profileCompany').value;
  const profileBio = document.getElementById('profileBio').value;
  
  // Validate form
  if (!profileName) {
    window.xpectraUI.showToast('error', 'Validation Error', 'Please enter your name');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#profileForm button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  submitBtn.disabled = true;
  
  // Update user's profile in Firebase Auth
  user.updateProfile({
    displayName: profileName
  })
    .then(() => {
      // Update user's profile in Firestore
      return db.collection('users').doc(user.uid).update({
        name: profileName,
        phone: profilePhone,
        company: profileCompany,
        bio: profileBio,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      // Update displayed name in sidebar
      const userName = document.getElementById('userName');
      if (userName) userName.textContent = profileName;
      
      // Show success message
      window.xpectraUI.showToast('success', 'Profile Updated', 'Your profile has been updated successfully');
    })
    .catch(error => {
      console.error('Error updating profile:', error);
      window.xpectraUI.showToast('error', 'Error', 'Could not update profile');
    })
    .finally(() => {
      // Reset button
      submitBtn.innerHTML = 'Save Changes';
      submitBtn.disabled = false;
    });
}

// Handle password form submission
function handlePasswordUpdate(e) {
  e.preventDefault();
  
  const { auth } = window.xpectraFirebase;
  const user = auth.currentUser;
  
  if (!user) return;
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validate form
  if (!currentPassword || !newPassword || !confirmPassword) {
    window.xpectraUI.showToast('error', 'Validation Error', 'Please fill out all fields');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    window.xpectraUI.showToast('error', 'Validation Error', 'New passwords do not match');
    return;
  }
  
  if (newPassword.length < 6) {
    window.xpectraUI.showToast('error', 'Validation Error', 'New password must be at least 6 characters');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#passwordForm button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
  submitBtn.disabled = true;
  
  // Re-authenticate user before changing password
  const credential = firebase.auth.EmailAuthProvider.credential(
    user.email,
    currentPassword
  );
  
  user.reauthenticateWithCredential(credential)
    .then(() => {
      // Change password
      return user.updatePassword(newPassword);
    })
    .then(() => {
      // Show success message
      window.xpectraUI.showToast('success', 'Password Updated', 'Your password has been updated successfully');
      
      // Reset form
      document.getElementById('passwordForm').reset();
    })
    .catch(error => {
      console.error('Error updating password:', error);
      
      if (error.code === 'auth/wrong-password') {
        window.xpectraUI.showToast('error', 'Error', 'Current password is incorrect');
      } else {
        window.xpectraUI.showToast('error', 'Error', 'Could not update password');
      }
    })
    .finally(() => {
      // Reset button
      submitBtn.innerHTML = 'Update Password';
      submitBtn.disabled = false;
    });
}

// Handle account deletion
function handleDeleteAccount(e) {
  e.preventDefault();
  
  const { auth, db } = window.xpectraFirebase;
  const user = auth.currentUser;
  
  if (!user) return;
  
  const confirmEmail = document.getElementById('deleteConfirmEmail').value;
  const confirmPassword = document.getElementById('deleteConfirmPassword').value;
  
  // Validate form
  if (!confirmEmail || !confirmPassword) {
    window.xpectraUI.showToast('error', 'Validation Error', 'Please fill out all fields');
    return;
  }
  
  if (confirmEmail !== user.email) {
    window.xpectraUI.showToast('error', 'Validation Error', 'Email does not match your account');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#deleteAccountForm button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
  submitBtn.disabled = true;
  
  // Re-authenticate user before deleting account
  const credential = firebase.auth.EmailAuthProvider.credential(
    user.email,
    confirmPassword
  );
  
  user.reauthenticateWithCredential(credential)
    .then(() => {
      // Delete user's data from Firestore
      const batch = db.batch();
      
      // Delete user document
      batch.delete(db.collection('users').doc(user.uid));
      
      // Get user's projects
      return db.collection('projects')
        .where('userId', '==', user.uid)
        .get()
        .then(snapshot => {
          // Delete each project
          snapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          // Commit batch
          return batch.commit();
        })
        .then(() => {
          // Delete user account
          return user.delete();
        });
    })
    .then(() => {
      // Close modal
      window.xpectraUI.closeModal('deleteAccountModal');
      
      // Show success message
      window.xpectraUI.showToast('success', 'Account Deleted', 'Your account has been permanently deleted');
      
      // Redirect to home page after a delay
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 2000);
    })
    .catch(error => {
      console.error('Error deleting account:', error);
      
      if (error.code === 'auth/wrong-password') {
        window.xpectraUI.showToast('error', 'Error', 'Password is incorrect');
      } else {
        window.xpectraUI.showToast('error', 'Error', 'Could not delete account');
      }
    })
    .finally(() => {
      // Reset button
      submitBtn.innerHTML = 'Permanently Delete Account';
      submitBtn.disabled = false;
    });
}

// Load API keys from user's projects
function loadApiKeys() {
  const { db } = window.xpectraFirebase;
  const { getCurrentUser } = window.xpectraAuth;
  const apiKeysList = document.getElementById('apiKeysList');
  
  if (!apiKeysList) return;
  
  const user = getCurrentUser();
  if (!user) return;
  
  // Get user's projects
  db.collection('projects')
    .where('userId', '==', user.uid)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        // No projects found
        apiKeysList.innerHTML = `
          <div class="api-key-item">
            <div class="api-key-info">
              <h4>No projects found</h4>
              <p>Create a project to generate an API key.</p>
            </div>
            <div class="api-key-actions">
              <a href="projects.html" class="btn btn-primary">
                <i class="fas fa-project-diagram"></i> Go to Projects
              </a>
            </div>
          </div>
        `;
        return;
      }
      
      // Clear list
      apiKeysList.innerHTML = '';
      
      // Add each project's API key
      snapshot.forEach(doc => {
        const project = {
          id: doc.id,
          ...doc.data()
        };
        
        const apiKeyItem = document.createElement('div');
        apiKeyItem.className = 'api-key-item';
        apiKeyItem.innerHTML = `
          <div class="api-key-info">
            <h4>${escapeHTML(project.name)}</h4>
            <p>${escapeHTML(project.url)}</p>
            <code>${maskApiKey(project.apiKey)}</code>
          </div>
          <div class="api-key-actions">
            <button class="btn btn-outline btn-sm show-api-key" data-project-id="${project.id}">
              <i class="fas fa-eye"></i> Show
            </button>
            <button class="btn btn-outline btn-sm copy-api-key" data-api-key="${project.apiKey}">
              <i class="fas fa-copy"></i> Copy
            </button>
            <a href="projects.html" class="btn btn-outline btn-sm">
              <i class="fas fa-cog"></i> Manage
            </a>
          </div>
        `;
        
        apiKeysList.appendChild(apiKeyItem);
        
        // Add event listeners
        const showApiKeyBtn = apiKeyItem.querySelector('.show-api-key');
        const copyApiKeyBtn = apiKeyItem.querySelector('.copy-api-key');
        
        if (showApiKeyBtn) {
          showApiKeyBtn.addEventListener('click', () => {
            const apiKeyCode = apiKeyItem.querySelector('code');
            const icon = showApiKeyBtn.querySelector('i');
            
            if (apiKeyCode.textContent === maskApiKey(project.apiKey)) {
              apiKeyCode.textContent = project.apiKey;
              icon.className = 'fas fa-eye-slash';
            } else {
              apiKeyCode.textContent = maskApiKey(project.apiKey);
              icon.className = 'fas fa-eye';
            }
          });
        }
        
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
      });
    })
    .catch(error => {
      console.error('Error loading API keys:', error);
      apiKeysList.innerHTML = `
        <div class="api-key-item">
          <div class="api-key-info">
            <h4>Error loading projects</h4>
            <p>Could not load your projects. Please try again.</p>
          </div>
          <div class="api-key-actions">
            <button class="btn btn-primary" onclick="loadApiKeys()">
              <i class="fas fa-sync-alt"></i> Retry
            </button>
          </div>
        </div>
      `;
    });
}

// Handle webhook form submission
function handleWebhookAdd(e) {
  e.preventDefault();
  
  const webhookName = document.getElementById('webhookName').value;
  const webhookUrl = document.getElementById('webhookUrl').value;
  const webhookSecret = document.getElementById('webhookSecret').value;
  const webhookEvents = Array.from(document.querySelectorAll('input[name="webhookEvents"]:checked')).map(checkbox => checkbox.value);
  
  // Validate form
  if (!webhookName || !webhookUrl) {
    window.xpectraUI.showToast('error', 'Validation Error', 'Please fill out all required fields');
    return;
  }
  
  if (webhookEvents.length === 0) {
    window.xpectraUI.showToast('error', 'Validation Error', 'Please select at least one event');
    return;
  }
  
  // Show loading state
  const submitBtn = document.querySelector('#webhookForm button[type="submit"]');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
  submitBtn.disabled = true;
  
  // In a real app, would save the webhook to Firestore
  // For demo purposes, just show a success message
  setTimeout(() => {
    // Show success message
    window.xpectraUI.showToast('success', 'Webhook Added', 'Your webhook has been added successfully');
    
    // Close modal
    window.xpectraUI.closeModal('addWebhookModal');
    
    // Reset form
    document.getElementById('webhookForm').reset();
    
    // Update webhooks list
    const webhooksList = document.getElementById('webhooksList');
    if (webhooksList) {
      const eventsList = webhookEvents.join(', ');
      
      webhooksList.innerHTML = `
        <div class="api-key-item">
          <div class="api-key-info">
            <h4>${escapeHTML(webhookName)}</h4>
            <p>${escapeHTML(webhookUrl)}</p>
            <small>Events: ${escapeHTML(eventsList)}</small>
          </div>
          <div class="api-key-actions">
            <button class="btn btn-outline btn-sm">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-outline btn-sm">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
    }
    
    // Reset button
    submitBtn.innerHTML = 'Add Webhook';
    submitBtn.disabled = false;
  }, 1000);
}

// Setup notification switches
function setupNotificationSwitches() {
  const notificationSwitches = document.querySelectorAll('.notification-option .switch input');
  
  if (notificationSwitches) {
    notificationSwitches.forEach(switchInput => {
      switchInput.addEventListener('change', () => {
        const notificationType = switchInput.id.replace('Switch', '');
        const enabled = switchInput.checked;
        
        // In a real app, would save the notification preference to Firestore
        // For demo purposes, just show a toast
        window.xpectraUI.showToast('success', 'Setting Saved', `${notificationType} notifications ${enabled ? 'enabled' : 'disabled'}`);
      });
    });
  }
}

// Setup preference options
function setupPreferenceOptions() {
  const preferenceSelects = document.querySelectorAll('.preference-option select');
  
  if (preferenceSelects) {
    preferenceSelects.forEach(select => {
      select.addEventListener('change', () => {
        const preferenceName = select.id.replace('Select', '');
        const value = select.value;
        
        // In a real app, would save the preference to Firestore
        // For demo purposes, just show a toast
        window.xpectraUI.showToast('success', 'Setting Saved', `${preferenceName} preference updated to ${value}`);
      });
    });
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