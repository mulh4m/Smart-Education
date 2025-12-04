/**
 * Bootstrap CSS Loader Utility
 * Handles dynamic loading of Bootstrap CSS (RTL/LTR) based on language
 */

/**
 * Load Bootstrap CSS dynamically
 * @param {boolean} isRTL - Whether to load RTL version
 */
export const loadBootstrapCSS = (isRTL = false) => {
  console.log(`Loading Bootstrap CSS: ${isRTL ? 'RTL' : 'LTR'} version`);
  
  // Remove existing Bootstrap CSS if any
  const existingLink = document.getElementById('bootstrap-css');
  if (existingLink) {
    existingLink.remove();
    console.log('Removed existing Bootstrap CSS');
  }
  
  // Create new link element
  const link = document.createElement('link');
  link.id = 'bootstrap-css';
  link.rel = 'stylesheet';
  
  if (isRTL) {
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.rtl.min.css';
  } else {
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css';
  }
  
  link.crossOrigin = 'anonymous';
  
  // Add error handling
  link.onerror = () => {
    console.error(`Failed to load Bootstrap CSS: ${link.href}`);
    // Fallback: try without crossOrigin
    const fallbackLink = document.createElement('link');
    fallbackLink.id = 'bootstrap-css-fallback';
    fallbackLink.rel = 'stylesheet';
    fallbackLink.href = link.href;
    document.head.appendChild(fallbackLink);
    console.log('Attempting fallback Bootstrap CSS load...');
  };
  
  link.onload = () => {
    console.log(`Bootstrap CSS loaded successfully: ${link.href}`);
  };
  
  document.head.appendChild(link);
};

/**
 * Get current language from localStorage
 * @returns {string} Current language ('ar' or 'en')
 */
export const getCurrentLanguage = () => {
  return localStorage.getItem('language') || 'en';
};

/**
 * Check if current language is RTL
 * @returns {boolean} True if current language is RTL
 */
export const isRTLLanguage = () => {
  return getCurrentLanguage() === 'ar';
};

/**
 * Initialize Bootstrap CSS based on current language
 */
export const initializeBootstrapCSS = () => {
  const isRTL = isRTLLanguage();
  loadBootstrapCSS(isRTL);
};
