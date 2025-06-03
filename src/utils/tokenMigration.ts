import { logger } from './logger';

// Utility to migrate existing auth tokens to new format
export const migrateAuthToken = () => {
  // Get existing token
  const existingToken = localStorage.getItem('auth_token');
  
  if (existingToken) {
    // Store in new format if not already present
    if (!localStorage.getItem('token')) {
      localStorage.setItem('token', existingToken);
      logger.debug('Migrated auth_token to token format');
    }
    
    // For now, create empty refresh token if not present
    if (!localStorage.getItem('refreshToken')) {
      localStorage.setItem('refreshToken', '');
      logger.debug('Added placeholder refreshToken');
    }
  }
};

// Auto-migrate when imported
migrateAuthToken(); 