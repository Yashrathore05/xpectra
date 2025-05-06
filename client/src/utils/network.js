/**
 * Network utilities for sending data to the server
 */

/**
 * Send data using the Beacon API
 * @param {string} url - The endpoint URL
 * @param {object} data - The data to send
 * @returns {boolean} Whether the beacon was successfully queued
 */
export function sendBeacon(url, data) {
  if (navigator.sendBeacon) {
    try {
      // Convert data to JSON and send as blob
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      return navigator.sendBeacon(url, blob);
    } catch (e) {
      console.error('Error sending beacon:', e);
      return false;
    }
  }
  return false;
}

/**
 * Send data using XMLHttpRequest
 * @param {string} url - The endpoint URL
 * @param {object} data - The data to send
 * @returns {Promise<object>} The server response
 */
export function sendXHR(url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          resolve({ success: true, status: xhr.status });
        }
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };
    
    xhr.onerror = function() {
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };
    
    xhr.send(JSON.stringify(data));
  }).catch(error => {
    console.error('XHR Error:', error);
    return { success: false, error };
  });
}

/**
 * Send data using the Fetch API
 * @param {string} url - The endpoint URL
 * @param {object} data - The data to send
 * @returns {Promise<object>} The server response
 */
export function sendFetch(url, data) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    // Use keepalive to ensure the request completes even if the page is unloading
    keepalive: true
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return response.json();
  })
  .catch(error => {
    console.error('Fetch Error:', error);
    return { success: false, error: error.message };
  });
} 