/**
 * API Configuration for WeReady Frontend
 * Automatically detects environment and provides appropriate API URLs
 */

// Detect environment
const isProduction = () => {
  if (typeof window === 'undefined') {
    // Server-side: check NODE_ENV
    return process.env.NODE_ENV === 'production';
  }
  // Client-side: check hostname
  return window.location.hostname === 'weready.dev' || 
         window.location.hostname.includes('netlify.app');
};

// Base URLs for different environments
const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:8000',
    functions: 'http://localhost:8000'
  },
  production: {
    baseUrl: '', // Use relative URLs for serverless functions
    functions: '/.netlify/functions'
  }
};

// Get current environment config
const getApiConfig = () => {
  return isProduction() ? API_CONFIG.production : API_CONFIG.development;
};

// Endpoint mapping for serverless functions
const ENDPOINT_MAPPING = {
  // Health endpoints
  '/health': '/health',
  
  // Bailey Intelligence endpoints
  '/bailey/semantic-query': '/bailey-semantic-query',
  '/semantic-search': '/semantic-search-engine',
  
  // GitHub endpoints (to be created)
  '/github/trending-intelligence': '/github-trending-intelligence',
  '/github/repository-analysis': '/github-repository-analysis',
  
  // Demo endpoints (to be created)
  '/api/demo/dashboard': '/demo-dashboard',
  '/api/demo/portfolio': '/demo-portfolio',
  '/api/demo/portfolio/project': '/demo-portfolio-project',
  
  // Auth endpoints (to be created)
  '/api/auth/me': '/auth-me',
  '/api/auth/github': '/auth-github',
  '/api/auth/logout': '/auth-logout',
  '/api/auth/refresh': '/auth-refresh',
  '/api/auth/password-strength': '/auth-password-strength',
  '/api/auth/signup': '/auth-signup',
  '/api/auth/login': '/auth-login',
  '/api/auth/github/repos': '/auth-github-repos',
  '/api/auth/github/link-repo': '/auth-github-link-repo',
  
  // Analysis endpoints (to be created)
  '/api/analyze/free': '/analyze-free',
  '/api/user/analyses/summary': '/user-analyses-summary',
  '/api/user/analyses/history': '/user-analyses-history',
  
  // Evidence endpoints (to be created)
  '/evidence/hallucination_detection': '/evidence-hallucination-detection',
  '/methodology': '/methodology',
  
  // Market endpoints (to be created)
  '/trending/github': '/trending-github',
  '/market-timing/report': '/market-timing-report',
  '/market-timing/recommendation': '/market-timing-recommendation'
};

/**
 * Get the appropriate API URL for an endpoint
 * @param {string} endpoint - The API endpoint (e.g., '/health', '/bailey/semantic-query')
 * @param {Object} params - Query parameters as key-value pairs
 * @returns {string} - The complete URL for the endpoint
 */
export const getApiUrl = (endpoint, params = {}) => {
  const config = getApiConfig();
  
  if (isProduction()) {
    // In production, use serverless functions
    const functionName = ENDPOINT_MAPPING[endpoint];
    if (!functionName) {
      console.warn(`No serverless function mapping found for endpoint: ${endpoint}`);
      // Fallback to direct endpoint (might not work)
      return `${config.functions}${endpoint}`;
    }
    
    const url = `${config.functions}${functionName}`;
    
    // Add query parameters if provided
    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      return `${url}?${queryString}`;
    }
    
    return url;
  } else {
    // In development, use local backend
    const url = `${config.baseUrl}${endpoint}`;
    
    // Add query parameters if provided
    if (Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      return `${url}?${queryString}`;
    }
    
    return url;
  }
};

/**
 * Check if we're in production environment
 * @returns {boolean}
 */
export const isProdEnv = isProduction;

/**
 * Get the base configuration for current environment
 * @returns {Object}
 */
export const getConfig = getApiConfig;

/**
 * Helper function to make API calls with appropriate URL
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options
 * @param {Object} params - Query parameters
 * @returns {Promise<Response>}
 */
export const apiCall = async (endpoint, options = {}, params = {}) => {
  const url = getApiUrl(endpoint, params);
  
  // Add default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers
  });
};