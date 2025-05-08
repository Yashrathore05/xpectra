/**
 * Xpectra Analytics Dashboard - Auth Test Script
 * This script helps debug login/signup issues
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("Auth test script loaded");
  
  // Check if Firebase is loaded
  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded!");
    addTestMessage('error', 'Firebase SDK not loaded. Check your script imports.');
    return;
  }
  
  // Wait for Firebase to initialize
  let checkCount = 0;
  const checkFirebaseInit = setInterval(() => {
    checkCount++;
    
    if (window.xpectraFirebase) {
      clearInterval(checkFirebaseInit);
      console.log("Firebase initialized successfully!");
      addTestMessage('success', 'Firebase initialized successfully!');
      
      // Test Firebase connection
      testFirebaseConnection();
    } else if (checkCount > 20) {
      clearInterval(checkFirebaseInit);
      console.error("Firebase initialization timed out");
      addTestMessage('error', 'Firebase initialization timed out. Check firebase-config.js');
    }
  }, 300);
  
  // Create test buttons
  createTestPanel();
});

// Test Firebase connection
function testFirebaseConnection() {
  const { db } = window.xpectraFirebase;
  
  if (!db) {
    addTestMessage('error', 'Firestore instance not available');
    return;
  }
  
  // Try to read a test collection
  db.collection('_test_connection')
    .limit(1)
    .get()
    .then(() => {
      addTestMessage('success', 'Connected to Firestore successfully!');
    })
    .catch(error => {
      addTestMessage('error', `Firestore connection failed: ${error.message}`);
      console.error("Firestore connection error:", error);
    });
}

// Create a test panel
function createTestPanel() {
  const panel = document.createElement('div');
  panel.className = 'auth-test-panel';
  panel.innerHTML = `
    <div class="test-header">
      <h3>Auth Test Panel</h3>
      <button id="closeTestPanel">×</button>
    </div>
    <div class="test-body">
      <div id="testMessages"></div>
      <div class="test-actions">
        <button id="testCreateUser">Create Test User</button>
        <button id="testSignIn">Test Sign In</button>
        <button id="testSignOut">Test Sign Out</button>
        <button id="checkAuthState">Check Auth State</button>
      </div>
    </div>
  `;
  
  // Add styles for the panel
  const style = document.createElement('style');
  style.textContent = `
    .auth-test-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
    }
    .test-header h3 {
      margin: 0;
      font-size: 14px;
    }
    .test-header button {
      border: none;
      background: none;
      font-size: 18px;
      cursor: pointer;
    }
    .test-body {
      padding: 15px;
    }
    #testMessages {
      max-height: 150px;
      overflow-y: auto;
      margin-bottom: 10px;
    }
    .test-message {
      padding: 8px 10px;
      margin-bottom: 5px;
      border-radius: 4px;
      font-size: 12px;
    }
    .test-message.success {
      background-color: #d4edda;
      color: #155724;
    }
    .test-message.error {
      background-color: #f8d7da;
      color: #721c24;
    }
    .test-message.info {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    .test-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .test-actions button {
      padding: 8px;
      border: none;
      background-color: #4361ee;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .test-actions button:hover {
      background-color: #3a56d4;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(panel);
  
  // Add event listeners to buttons
  document.getElementById('closeTestPanel').addEventListener('click', () => {
    panel.remove();
  });
  
  document.getElementById('testCreateUser').addEventListener('click', createTestUser);
  document.getElementById('testSignIn').addEventListener('click', testSignIn);
  document.getElementById('testSignOut').addEventListener('click', testSignOut);
  document.getElementById('checkAuthState').addEventListener('click', checkAuthState);
}

// Add test message
function addTestMessage(type, message) {
  const messagesContainer = document.getElementById('testMessages');
  if (!messagesContainer) return;
  
  const msgElement = document.createElement('div');
  msgElement.className = `test-message ${type}`;
  msgElement.textContent = message;
  
  messagesContainer.appendChild(msgElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Create a test user
function createTestUser() {
  if (!window.xpectraFirebase || !window.xpectraFirebase.auth) {
    addTestMessage('error', 'Firebase Auth not initialized');
    return;
  }
  
  const { auth, db } = window.xpectraFirebase;
  
  const email = `test_${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';
  
  addTestMessage('info', `Creating test user: ${email}`);
  
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      
      addTestMessage('success', `User created: ${email}`);
      
      // Update profile
      return user.updateProfile({ displayName: name })
        .then(() => {
          addTestMessage('success', 'User profile updated');
          
          // Create user document in Firestore
          return db.collection('users').doc(user.uid).set({
            name,
            email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        })
        .then(() => {
          addTestMessage('success', 'User document created in Firestore');
        });
    })
    .catch(error => {
      addTestMessage('error', `Create user error: ${error.message}`);
      console.error("Create user error:", error);
    });
}

// Test sign in
function testSignIn() {
  if (!window.xpectraFirebase || !window.xpectraFirebase.auth) {
    addTestMessage('error', 'Firebase Auth not initialized');
    return;
  }
  
  const { auth } = window.xpectraFirebase;
  
  // Use either the test email from localStorage or a default one
  const email = localStorage.getItem('testUserEmail') || 'test@example.com';
  const password = 'password123';
  
  addTestMessage('info', `Attempting to sign in: ${email}`);
  
  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      addTestMessage('success', `Signed in: ${user.email}`);
    })
    .catch(error => {
      addTestMessage('error', `Sign in error: ${error.message}`);
      console.error("Sign in error:", error);
    });
}

// Test sign out
function testSignOut() {
  if (!window.xpectraFirebase || !window.xpectraFirebase.auth) {
    addTestMessage('error', 'Firebase Auth not initialized');
    return;
  }
  
  const { auth } = window.xpectraFirebase;
  
  addTestMessage('info', 'Signing out...');
  
  auth.signOut()
    .then(() => {
      addTestMessage('success', 'Signed out successfully');
    })
    .catch(error => {
      addTestMessage('error', `Sign out error: ${error.message}`);
      console.error("Sign out error:", error);
    });
}

// Check auth state
function checkAuthState() {
  if (!window.xpectraFirebase || !window.xpectraFirebase.auth) {
    addTestMessage('error', 'Firebase Auth not initialized');
    return;
  }
  
  const { auth } = window.xpectraFirebase;
  const user = auth.currentUser;
  
  if (user) {
    addTestMessage('info', `Currently signed in as: ${user.email}`);
  } else {
    addTestMessage('info', 'Not currently signed in');
  }
} 