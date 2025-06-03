interface Config {
  API_BASE_URL: string;
  ENABLE_LOGGING: boolean;
  APP_VERSION: string;
  ENVIRONMENT: 'development' | 'production' | 'staging';
  ENABLE_ANALYTICS: boolean;
  ENABLE_DEBUG_MODE: boolean;
  GA_TRACKING_ID?: string;
  SENTRY_DSN?: string;
  YOUTUBE_API_KEY?: string;
}

// Validate required environment variables
const requiredEnvVars = ['REACT_APP_API_BASE_URL'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar] && process.env.NODE_ENV === 'production') {
    console.warn(`Missing environment variable: ${envVar}`);
  }
});

const config: Config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://api.xpertbuyer.com/api' 
      : 'http://localhost:5000/api'),
  ENABLE_LOGGING: process.env.NODE_ENV !== 'production',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  ENVIRONMENT: (process.env.NODE_ENV as 'development' | 'production' | 'staging') || 'development',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_MODE: process.env.REACT_APP_ENABLE_DEBUG_MODE === 'true',
  GA_TRACKING_ID: process.env.REACT_APP_GA_TRACKING_ID,
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  YOUTUBE_API_KEY: process.env.REACT_APP_YOUTUBE_API_KEY
};

export default config; 