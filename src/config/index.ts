interface Config {
  API_BASE_URL: string;
  ENABLE_LOGGING: boolean;
  APP_VERSION: string;
  ENVIRONMENT: 'development' | 'production' | 'staging';
}

const config: Config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://api.xpertbuyer.com/api' 
      : 'http://localhost:5000/api'),
  ENABLE_LOGGING: process.env.NODE_ENV !== 'production',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  ENVIRONMENT: (process.env.NODE_ENV as 'development' | 'production' | 'staging') || 'development'
};

export default config; 