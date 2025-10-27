// Central configuration file for the application
const config = {
  // API Configuration
  apiUrl: process.env.REACT_APP_API_URL || '',
  
  // App Environment
  env: process.env.REACT_APP_ENV || 'development',
  
  // Check if we're in production
  isProduction: process.env.REACT_APP_ENV === 'production' || process.env.NODE_ENV === 'production',
  
  // Check if we're in development
  isDevelopment: process.env.REACT_APP_ENV === 'development' || process.env.NODE_ENV === 'development',
  
  // Get full API URL for a given path
  getApiUrl: (path = '') => {
    const baseUrl = config.apiUrl;
    if (!path) return baseUrl;
    
    // Remove leading slash if baseUrl already has one
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  },
  
  // Validate configuration
  isValid: () => {
    if (!config.apiUrl && config.isProduction) {
      console.error('❌ REACT_APP_API_URL is not set! API calls will fail.');
      return false;
    }
    return true;
  },
  
  // Log configuration (for debugging)
  logConfig: () => {
    console.log('📋 App Configuration:', {
      apiUrl: config.apiUrl || '(not set)',
      env: config.env,
      isProduction: config.isProduction,
      isDevelopment: config.isDevelopment,
      isValid: config.isValid()
    });
  }
};

// Validate config on load in development
if (config.isDevelopment) {
  config.logConfig();
}

// Validate config in production
if (config.isProduction && !config.isValid()) {
  console.error('⚠️ WARNING: Application is not configured correctly!');
  console.error('Please set REACT_APP_API_URL in Netlify environment variables.');
}

export default config;
