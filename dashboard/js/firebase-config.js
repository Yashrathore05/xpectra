/**
 * Xpectra Analytics Dashboard
 * Firebase Configuration
 */

// Initialize Firebase with the configuration
const firebaseConfig = {
  apiKey: "AIzaSyDffudUm4k56hOmRp5RDxh2qolYqGpJUwQ",
  authDomain: "xpectra-is-best.firebaseapp.com",
  projectId: "xpectra-is-best",
  storageBucket: "xpectra-is-best.appspot.com",
  messagingSenderId: "948726499152",
  appId: "1:948726499152:web:ae1dd756631bf33fd1ce55",
  measurementId: "G-R0SPDYSH45"
};

// Make sure Firebase is available before initializing
function initFirebase() {
  try {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.error("Firebase SDK not loaded. Attempting to load it dynamically.");
      loadFirebaseSDK();
      return;
    }

    // Initialize Firebase
    if (!firebase.apps.length) {
      const firebaseApp = firebase.initializeApp(firebaseConfig);
      const auth = firebase.auth();
      const db = firebase.firestore();
      
      console.log("Firebase initialized successfully");
      
      // Enable Firebase Firestore offline persistence if supported
      db.enablePersistence({ synchronizeTabs: true })
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab
            console.warn('Firebase persistence failed: Multiple tabs open');
          } else if (err.code === 'unimplemented') {
            // The current browser does not support persistence
            console.warn('Firebase persistence not supported in this browser');
          }
        });
      
      // Export the Firebase services for use in other modules
      window.xpectraFirebase = {
        app: firebaseApp,
        auth,
        db
      };
    } else {
      console.log("Firebase already initialized");
      // Export the Firebase services if needed but not already done
      if (!window.xpectraFirebase) {
        window.xpectraFirebase = {
          app: firebase.app(),
          auth: firebase.auth(),
          db: firebase.firestore()
        };
      }
    }
    
    // Dispatch an event when Firebase is ready
    document.dispatchEvent(new Event('firebase-ready'));
    
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

// Check if Firebase is already initialized
function isFirebaseInitialized() {
  return window.xpectraFirebase && window.xpectraFirebase.auth && window.xpectraFirebase.db;
}

// Get Firebase with retry mechanism
function getFirebase(maxRetries = 5, retryInterval = 500) {
  return new Promise((resolve, reject) => {
    if (isFirebaseInitialized()) {
      resolve(window.xpectraFirebase);
      return;
    }

    let retries = 0;
    const checkInterval = setInterval(() => {
      if (isFirebaseInitialized()) {
        clearInterval(checkInterval);
        resolve(window.xpectraFirebase);
        return;
      }

      retries++;
      if (retries >= maxRetries) {
        clearInterval(checkInterval);
        reject(new Error("Firebase initialization timed out"));
      }
    }, retryInterval);
    
    // Also try initializing Firebase if not already done
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
      initFirebase();
    }
  });
}

// Translate Firebase error codes to user-friendly messages
function getFirebaseErrorMessage(error) {
  if (!error) return "Unknown error occurred";
  
  const errorCode = error.code || "";
  const errorMessage = error.message || "Unknown error occurred";
  
  // Common Firebase error codes
  switch (errorCode) {
    // Auth errors
    case 'auth/user-not-found':
      return "No user found with this email address";
    case 'auth/wrong-password':
      return "Incorrect password";
    case 'auth/invalid-email':
      return "Invalid email address";
    case 'auth/user-disabled':
      return "This account has been disabled";
    case 'auth/email-already-in-use':
      return "This email is already in use by another account";
    case 'auth/weak-password':
      return "Password is too weak, please use a stronger password";
    case 'auth/operation-not-allowed':
      return "Operation not allowed";
    case 'auth/account-exists-with-different-credential':
      return "An account already exists with the same email but different sign-in credentials";
      
    // Firestore errors
    case 'permission-denied':
      return "You don't have permission to access this data";
    case 'unavailable':
      return "The service is currently unavailable. Please try again later";
    case 'not-found':
      return "The requested document was not found";
    case 'already-exists':
      return "The document already exists";
    case 'failed-precondition':
      return "Operation failed due to a precondition failure";
    case 'resource-exhausted':
      return "Resource quota exceeded";
    case 'cancelled':
      return "The operation was cancelled";
    case 'unknown':
    default:
      // If it's a network error, provide a specific message
      if (errorMessage.includes('network error') || 
          errorMessage.includes('Network Error') ||
          errorMessage.includes('failed to fetch')) {
        return "Network error. Please check your internet connection";
      }
      
      // For database security rule errors
      if (errorMessage.includes('Missing or insufficient permissions') ||
          errorMessage.includes('permission_denied')) {
        return "You don't have permission to perform this action. Please sign in again";
      }
      
      return errorMessage;
  }
}

// Load Firebase SDK dynamically if not available
function loadFirebaseSDK() {
  // Function to load scripts one after the other
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  // Load Firebase scripts in order
  Promise.all([
    loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js'),
    loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js'),
    loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js'),
    loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-analytics.js')
  ])
  .then(() => {
    console.log("Firebase SDK loaded dynamically");
    // Initialize Firebase after loading
    setTimeout(initFirebase, 500);
  })
  .catch((error) => {
    console.error("Failed to load Firebase SDK:", error);
  });
}

// Initialize Firebase when the document is ready
document.addEventListener('DOMContentLoaded', initFirebase);

// Export functions for use in other modules
window.xpectraFirebaseUtils = {
  initFirebase,
  isFirebaseInitialized,
  getFirebase
}; 