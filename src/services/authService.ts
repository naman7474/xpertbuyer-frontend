import axios from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  CompleteProfile,
  SkinProfile,
  HairProfile,
  LifestyleProfile,
  HealthProfile,
  MakeupProfile,
  ApiError
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with interceptors for token management
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Authentication endpoints
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/auth/register', userData);
      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Registration failed' };
    }
  },

  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/auth/login', credentials);
      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  refreshToken: async (): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/auth/refresh-token');
      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Token refresh failed' };
    }
  },

  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    try {
      const response = await authApi.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get user profile' };
    }
  },

  updateBasicProfile: async (userData: Partial<User>): Promise<{ success: boolean; data: User }> => {
    try {
      const response = await authApi.put('/auth/profile', userData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Profile update failed' };
    }
  },

  // Profile management endpoints
  getCompleteProfile: async (): Promise<{ success: boolean; data: CompleteProfile }> => {
    try {
      const response = await authApi.get('/profile/complete');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get complete profile' };
    }
  },

  // Skin profile
  getSkinProfile: async (): Promise<{ success: boolean; data: SkinProfile }> => {
    try {
      const response = await authApi.get('/profile/skin');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get skin profile' };
    }
  },

  updateSkinProfile: async (skinData: SkinProfile): Promise<{ success: boolean; data: SkinProfile }> => {
    try {
      const response = await authApi.put('/profile/skin', skinData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update skin profile' };
    }
  },

  uploadSkinPhoto: async (photoFile: File): Promise<{ success: boolean; data: any }> => {
    try {
      const formData = new FormData();
      formData.append('face_photo', photoFile);
      
      const response = await authApi.post('/profile/skin/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to upload skin photo' };
    }
  },

  // Hair profile
  getHairProfile: async (): Promise<{ success: boolean; data: HairProfile }> => {
    try {
      const response = await authApi.get('/profile/hair');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get hair profile' };
    }
  },

  updateHairProfile: async (hairData: HairProfile): Promise<{ success: boolean; data: HairProfile }> => {
    try {
      const response = await authApi.put('/profile/hair', hairData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update hair profile' };
    }
  },

  // Lifestyle profile
  getLifestyleProfile: async (): Promise<{ success: boolean; data: LifestyleProfile }> => {
    try {
      const response = await authApi.get('/profile/lifestyle');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get lifestyle profile' };
    }
  },

  updateLifestyleProfile: async (lifestyleData: LifestyleProfile): Promise<{ success: boolean; data: LifestyleProfile }> => {
    try {
      const response = await authApi.put('/profile/lifestyle', lifestyleData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update lifestyle profile' };
    }
  },

  // Health profile
  getHealthProfile: async (): Promise<{ success: boolean; data: HealthProfile }> => {
    try {
      const response = await authApi.get('/profile/health');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get health profile' };
    }
  },

  updateHealthProfile: async (healthData: HealthProfile): Promise<{ success: boolean; data: HealthProfile }> => {
    try {
      const response = await authApi.put('/profile/health', healthData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update health profile' };
    }
  },

  // Makeup profile
  getMakeupProfile: async (): Promise<{ success: boolean; data: MakeupProfile }> => {
    try {
      const response = await authApi.get('/profile/makeup');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get makeup profile' };
    }
  },

  updateMakeupProfile: async (makeupData: MakeupProfile): Promise<{ success: boolean; data: MakeupProfile }> => {
    try {
      const response = await authApi.put('/profile/makeup', makeupData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to update makeup profile' };
    }
  },

  // Utility functions
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  getStoredUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearAuth: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};

export default authService; 