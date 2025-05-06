/**
 * Cookie management utilities
 */

export function setCookie(name, value, minutes) {
  const date = new Date();
  date.setTime(date.getTime() + (minutes * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
}

export function getCookieValue(name) {
  const nameEquals = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEquals) === 0) {
      return cookie.substring(nameEquals.length, cookie.length);
    }
  }
  
  return null;
}

export function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Generates a UUID v4
 * @returns {string} A random UUID
 */
export function generateUUID() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
} 