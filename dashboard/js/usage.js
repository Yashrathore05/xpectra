/**
 * Xpectra Analytics Dashboard
 * Usage Page Script
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the usage page
  initUsagePage();
});

// Initialize the usage page
function initUsagePage() {
  console.log("Initializing usage page");
  
  // Initialize UI
  window.xpectraUI.initUI();
  
  // Initialize auth
  if (window.xpectraAuth) {
    window.xpectraAuth.initAuth();
  }
  
  // Setup event listeners
  setupUsageEventListeners();
  
  // Check auth state (usage page accessible to both authenticated and unauthenticated users)
  checkAuthState();
  
  // Initialize code copy buttons
  initCodeCopyButtons();
  
  // Initialize code snippet tabs
  initCodeSnippetTabs();
  
  // Update SDK code snippets
  updateSDKSnippets();
}

// Set up event listeners for the usage page
function setupUsageEventListeners() {
  // Listen for tab clicks
  const tabs = document.querySelectorAll('.tab-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Get the tab name
      const tabName = tab.getAttribute('data-tab');
      
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all tab contents
      const tabContents = document.querySelectorAll('.tab-content');
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      // Show selected tab content
      const selectedContent = document.getElementById(`${tabName}Content`);
      if (selectedContent) {
        selectedContent.classList.add('active');
      }
    });
  });
}

// Check auth state
function checkAuthState() {
  if (!window.xpectraFirebase || !window.xpectraFirebase.auth) {
    console.log("Firebase not available for auth state check on usage page");
    return;
  }
  
  const { auth } = window.xpectraFirebase;
  
  auth.onAuthStateChanged(user => {
    // Update API key in code snippets if user is signed in and has a project selected
    if (user) {
      updateSDKSnippets();
    }
  });
}

// Initialize code copy buttons
function initCodeCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-code');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the code block
      const codeBlock = button.parentElement.querySelector('code');
      
      if (codeBlock) {
        // Copy code to clipboard
        navigator.clipboard.writeText(codeBlock.textContent)
          .then(() => {
            // Show success message
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            // Reset button text after a short delay
            setTimeout(() => {
              button.innerHTML = originalText;
            }, 2000);
          })
          .catch(err => {
            console.error('Could not copy text:', err);
          });
      }
    });
  });
}

// Initialize code snippet tabs
function initCodeSnippetTabs() {
  const snippetTabs = document.querySelectorAll('.snippet-tab');
  
  snippetTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Get the parent container
      const container = tab.closest('.code-snippets');
      
      // Get the tab name
      const tabName = tab.getAttribute('data-snippet');
      
      // Remove active class from all tabs in this container
      const tabs = container.querySelectorAll('.snippet-tab');
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all snippets in this container
      const snippets = container.querySelectorAll('.snippet');
      snippets.forEach(snippet => {
        snippet.classList.remove('active');
      });
      
      // Show selected snippet
      const selectedSnippet = container.querySelector(`.snippet[data-snippet="${tabName}"]`);
      if (selectedSnippet) {
        selectedSnippet.classList.add('active');
      }
    });
  });
}

// Update SDK snippets with current API key and project info
function updateSDKSnippets() {
  // Get current project from local storage
  const currentProject = JSON.parse(localStorage.getItem('currentProject') || '{}');
  
  // If no project is selected, use placeholder values
  const apiKey = currentProject.apiKey || 'YOUR_API_KEY';
  const projectURL = currentProject.url || 'https://your-website.com';
  
  // Update all API key placeholders in code snippets
  const codeBlocks = document.querySelectorAll('code');
  codeBlocks.forEach(block => {
    let code = block.textContent;
    
    // Replace API key placeholder
    code = code.replace(/YOUR_API_KEY/g, apiKey);
    
    // Replace project URL placeholder
    code = code.replace(/https:\/\/your-website\.com/g, projectURL);
    
    // Update the code block
    block.textContent = code;
  });
}

// Generate SDK code snippets for different frameworks
function generateScriptTagSnippet(apiKey) {
  return `<!-- Xpectra Analytics SDK -->
<script src="https://cdn.xpectra.com/sdk/xpectra.min.js"></script>
<script>
  // Initialize Xpectra Analytics
  Xpectra.init('${apiKey}', {
    // Optional configuration options
    trackPageViews: true,
    trackClicks: true,
    trackScrollDepth: true,
    sessionTimeout: 30 // minutes
  });
</script>`;
}

function generateNpmSnippet(apiKey) {
  return `// Install the package
npm install xpectra-analytics

// In your app
import Xpectra from 'xpectra-analytics';

// Initialize Xpectra Analytics
Xpectra.init('${apiKey}', {
  // Optional configuration options
  trackPageViews: true,
  trackClicks: true,
  trackScrollDepth: true,
  sessionTimeout: 30 // minutes
});`;
}

function generateModuleSnippet(apiKey) {
  return `// Import as ES module
import { Xpectra } from 'https://cdn.xpectra.com/sdk/xpectra.esm.js';

// Initialize Xpectra Analytics
Xpectra.init('${apiKey}', {
  // Optional configuration options
  trackPageViews: true,
  trackClicks: true,
  trackScrollDepth: true,
  sessionTimeout: 30 // minutes
});`;
}

function generateEventTrackingSnippet() {
  return `// Track a custom event
Xpectra.trackEvent('button_click', {
  button_id: 'signup-button',
  page: '/homepage'
});

// Track a purchase event
Xpectra.trackEvent('purchase', {
  product_id: '12345',
  product_name: 'Premium Plan',
  price: 49.99,
  currency: 'USD'
});

// Track form submission
document.getElementById('contact-form').addEventListener('submit', function(e) {
  Xpectra.trackEvent('form_submit', {
    form_id: 'contact-form',
    page: window.location.pathname
  });
});`;
}

function generateEcommerceSnippet() {
  return `// Track product view
Xpectra.trackEvent('product_view', {
  product_id: '12345',
  product_name: 'Premium Plan',
  price: 49.99,
  currency: 'USD',
  category: 'Subscription'
});

// Track add to cart
Xpectra.trackEvent('add_to_cart', {
  product_id: '12345',
  product_name: 'Premium Plan',
  price: 49.99,
  currency: 'USD',
  quantity: 1
});

// Track checkout
Xpectra.trackEvent('begin_checkout', {
  cart_id: 'abc123',
  cart_value: 49.99,
  currency: 'USD',
  items: [
    {
      product_id: '12345',
      product_name: 'Premium Plan',
      price: 49.99,
      quantity: 1
    }
  ]
});

// Track purchase
Xpectra.trackEvent('purchase', {
  transaction_id: 'T-12345',
  value: 49.99,
  currency: 'USD',
  tax: 5.00,
  shipping: 0,
  coupon: 'SUMMER20',
  items: [
    {
      product_id: '12345',
      product_name: 'Premium Plan',
      price: 49.99,
      quantity: 1
    }
  ]
});`;
}

function generateIdentifyUserSnippet() {
  return `// Identify a user
Xpectra.identify('user123', {
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'premium',
  signup_date: '2023-05-15'
});

// Update user properties
Xpectra.updateUser({
  plan: 'enterprise',
  company: 'Acme Inc.',
  employees: 500
});

// Clear user identification (e.g., on logout)
Xpectra.clearUser();`;
}

function generateAdvancedConfigSnippet() {
  return `// Advanced configuration
Xpectra.init('YOUR_API_KEY', {
  // Basic tracking options
  trackPageViews: true,
  trackClicks: true,
  trackScrollDepth: true,
  
  // Session configuration
  sessionTimeout: 30, // minutes
  
  // Data collection options
  collectIp: true,
  collectUserAgent: true,
  anonymizeIp: false,
  
  // Sampling
  samplingRate: 100, // percentage of sessions to track
  
  // Performance options
  minimumVisitTime: 5, // seconds
  heartbeatInterval: 15, // seconds
  
  // Callback functions
  onInitialized: function() {
    console.log('Xpectra Analytics initialized');
  },
  onPageView: function(data) {
    console.log('Page viewed:', data.page);
  },
  onEvent: function(name, data) {
    console.log('Event tracked:', name, data);
  }
});`;
}

// Export functionality for manual testing
window.xpectraUsage = {
  generateScriptTagSnippet,
  generateNpmSnippet,
  generateModuleSnippet,
  generateEventTrackingSnippet,
  generateEcommerceSnippet,
  generateIdentifyUserSnippet,
  generateAdvancedConfigSnippet,
  updateSDKSnippets
}; 