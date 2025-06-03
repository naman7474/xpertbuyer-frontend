# 🎨 XpertBuyer Frontend Implementation Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication System](#authentication-system)
3. [User Profile Management](#user-profile-management)
4. [AI Analysis Integration](#ai-analysis-integration)
5. [Search & Personalization](#search--personalization)
6. [Product Management](#product-management)
7. [Video Content Integration](#video-content-integration)
8. [Activity Tracking](#activity-tracking)
9. [State Management](#state-management)
10. [UI Components](#ui-components)
11. [Error Handling](#error-handling)
12. [Performance Optimization](#performance-optimization)

## 🎯 Overview

XpertBuyer is a personalized beauty product recommendation platform with AI-powered analysis. The frontend should provide:

- **Personalized Experience**: AI-driven product recommendations based on user profiles
- **Comprehensive Profiles**: Multi-section user profiles (skin, hair, lifestyle, health, makeup)
- **Smart Search**: Context-aware product search with personalization
- **Rich Content**: Product details with video reviews and comparisons
- **Progress Tracking**: User journey and recommendation tracking

### Tech Stack Recommendations

- **Framework**: React 18+ / Next.js 14+ / Vue 3+
- **Styling**: Tailwind CSS / Styled Components / Material-UI
- **State Management**: Zustand / Redux Toolkit / Pinia (Vue)
- **HTTP Client**: Axios / Fetch API with custom hooks
- **Forms**: React Hook Form / Formik / VeeValidate (Vue)
- **UI Components**: Headless UI / Radix UI / Ant Design

## 🔐 Authentication System

### API Endpoints
```typescript
// Authentication endpoints
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
PUT  /api/auth/profile
POST /api/auth/change-password
```

### Implementation

#### 1. Authentication Service
```typescript
// services/authService.ts
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_completed: boolean;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth header
    axios.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            return axios.request(error.config);
          } catch (refreshError) {
            this.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
  }): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE}/auth/register`, userData);
    this.setTokens(response.data.data.token, response.data.data.refreshToken);
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    this.setTokens(response.data.data.token, response.data.data.refreshToken);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_BASE}/auth/logout`);
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<void> {
    const response = await axios.post(`${API_BASE}/auth/refresh`, {
      refreshToken: this.refreshToken
    });
    this.setTokens(response.data.data.token, response.data.data.refreshToken);
  }

  async getCurrentUser(): Promise<User> {
    const response = await axios.get(`${API_BASE}/auth/profile`);
    return response.data.data;
  }

  private setTokens(token: string, refreshToken: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();
```

#### 2. Authentication Context (React)
```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.data.user);
  };

  const register = async (userData: any) => {
    const response = await authService.register(userData);
    setUser(response.data.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    // Implementation for profile update
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

#### 3. Login Component
```typescript
// components/auth/LoginForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      // Handle error
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};
```

## 👤 User Profile Management

### Profile API Endpoints
```typescript
// Profile management endpoints
GET  /api/profile/complete           // Get complete profile
PUT  /api/profile/basic             // Update basic info
PUT  /api/profile/skin              // Update skin profile
PUT  /api/profile/hair              // Update hair profile
PUT  /api/profile/lifestyle         // Update lifestyle
PUT  /api/profile/health            // Update health info
PUT  /api/profile/makeup            // Update makeup preferences
GET  /api/profile/completion-status // Get profile completion status
```

### Implementation

#### 1. Profile Service
```typescript
// services/profileService.ts
import axios from 'axios';

export interface SkinProfile {
  skin_type: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';
  skin_tone: 'very_fair' | 'fair' | 'light' | 'medium' | 'tan' | 'deep';
  undertone: 'cool' | 'warm' | 'neutral';
  fitzpatrick_phototype: 1 | 2 | 3 | 4 | 5 | 6;
  primary_concerns: string[];
  skin_sensitivity: 'low' | 'medium' | 'high';
  known_allergies: string[];
  current_routine: {
    morning: string[];
    evening: string[];
  };
  daily_sun_exposure: 'minimal' | 'moderate' | 'high';
  sunscreen_usage: 'daily' | 'occasional' | 'rarely' | 'never';
}

export interface HairProfile {
  hair_pattern: 'straight' | 'wavy' | 'curly' | 'coily';
  hair_texture: 'fine' | 'medium' | 'coarse';
  hair_thickness: 'thin' | 'medium' | 'thick';
  hair_porosity: 'low' | 'medium' | 'high';
  scalp_type: 'oily' | 'dry' | 'normal' | 'sensitive';
  scalp_concerns: string[];
  hair_concerns: string[];
  chemical_treatments: string[];
  heat_styling_frequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
  current_routine: {
    washing_frequency: string;
    products_used: string[];
  };
}

export interface CompleteProfile {
  basic: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  };
  skin?: SkinProfile;
  hair?: HairProfile;
  lifestyle?: any;
  health?: any;
  makeup?: any;
  completion_status: {
    overall: number;
    sections: {
      basic: boolean;
      skin: boolean;
      hair: boolean;
      lifestyle: boolean;
      health: boolean;
      makeup: boolean;
    };
  };
}

class ProfileService {
  async getCompleteProfile(): Promise<CompleteProfile> {
    const response = await axios.get('/api/profile/complete');
    return response.data.data;
  }

  async updateSkinProfile(data: Partial<SkinProfile>): Promise<SkinProfile> {
    const response = await axios.put('/api/profile/skin', data);
    return response.data.data;
  }

  async updateHairProfile(data: Partial<HairProfile>): Promise<HairProfile> {
    const response = await axios.put('/api/profile/hair', data);
    return response.data.data;
  }

  async getCompletionStatus() {
    const response = await axios.get('/api/profile/completion-status');
    return response.data.data;
  }
}

export const profileService = new ProfileService();
```

#### 2. Skin Profile Form Component
```typescript
// components/profile/SkinProfileForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { SkinProfile, profileService } from '../../services/profileService';

interface SkinProfileFormProps {
  initialData?: Partial<SkinProfile>;
  onSuccess?: (data: SkinProfile) => void;
}

export const SkinProfileForm: React.FC<SkinProfileFormProps> = ({ 
  initialData, 
  onSuccess 
}) => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = 
    useForm<SkinProfile>({
      defaultValues: initialData
    });

  const onSubmit = async (data: SkinProfile) => {
    try {
      const result = await profileService.updateSkinProfile(data);
      onSuccess?.(result);
    } catch (error) {
      console.error('Failed to update skin profile:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Skin Profile</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Skin Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skin Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['oily', 'dry', 'combination', 'sensitive', 'normal'].map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  {...register('skin_type', { required: 'Skin type is required' })}
                  className="text-indigo-600"
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
          {errors.skin_type && (
            <p className="text-red-500 text-sm mt-1">{errors.skin_type.message}</p>
          )}
        </div>

        {/* Skin Concerns */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Skin Concerns (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'acne', 'aging', 'dark_spots', 'dryness', 'dullness', 
              'large_pores', 'oiliness', 'redness', 'sensitivity', 'uneven_texture'
            ].map((concern) => (
              <label key={concern} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={concern}
                  {...register('primary_concerns')}
                  className="text-indigo-600"
                />
                <span className="capitalize">{concern.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sun Protection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How often do you use sunscreen?
          </label>
          <div className="space-y-2">
            {[
              { value: 'daily', label: 'Daily' },
              { value: 'occasional', label: 'Occasionally' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'never', label: 'Never' }
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value={option.value}
                  {...register('sunscreen_usage')}
                  className="text-indigo-600"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Skin Profile'}
        </button>
      </form>
    </div>
  );
};
```

## 🤖 AI Analysis Integration

### AI Analysis API Endpoints
```typescript
// AI Analysis endpoints
POST /api/ai/comprehensive                    // Trigger comprehensive analysis
POST /api/ai/analyze/:category               // Trigger specific category analysis
GET  /api/ai/history                         // Get analysis history
GET  /api/ai/recommendations                 // Get active recommendations
GET  /api/ai/result/:analysisId              // Get specific analysis result
GET  /api/ai/dashboard                       // Get analysis dashboard
GET  /api/ai/cache/stats                     // Get cache statistics
DELETE /api/ai/cache/invalidate              // Clear cache
DELETE /api/ai/cache/invalidate/:analysisType // Clear specific cache
```

### Implementation

#### 1. AI Analysis Service
```typescript
// services/aiAnalysisService.ts
import axios from 'axios';

export interface AnalysisResult {
  sessionId: string;
  analysisResults: any[];
  summary: any;
  fromCache: boolean;
  cacheInfo?: {
    cachedAt: string;
    expiresAt: string;
    accessCount: number;
  };
}

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

class AIAnalysisService {
  async triggerComprehensiveAnalysis(): Promise<AnalysisResult> {
    const response = await axios.post('/api/ai/comprehensive');
    return response.data.data;
  }

  async triggerCategoryAnalysis(category: string): Promise<AnalysisResult> {
    const response = await axios.post(`/api/ai/analyze/${category}`);
    return response.data.data;
  }

  async getAnalysisHistory(category?: string, limit = 10) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    
    const response = await axios.get(`/api/ai/history?${params}`);
    return response.data.data;
  }

  async getActiveRecommendations(category?: string): Promise<Recommendation[]> {
    const params = category ? `?category=${category}` : '';
    const response = await axios.get(`/api/ai/recommendations${params}`);
    return response.data.data.recommendations;
  }

  async getDashboard() {
    const response = await axios.get('/api/ai/dashboard');
    return response.data.data;
  }

  async getCacheStatistics() {
    const response = await axios.get('/api/ai/cache/stats');
    return response.data.data;
  }

  async invalidateCache(analysisType?: string) {
    const endpoint = analysisType 
      ? `/api/ai/cache/invalidate/${analysisType}`
      : '/api/ai/cache/invalidate';
    
    const response = await axios.delete(endpoint);
    return response.data;
  }
}

export const aiAnalysisService = new AIAnalysisService();
```

#### 2. AI Analysis Dashboard Component
```typescript
// components/ai/AnalysisDashboard.tsx
import React, { useEffect, useState } from 'react';
import { aiAnalysisService, Recommendation } from '../../services/aiAnalysisService';

interface DashboardData {
  statistics: {
    total_analyses: number;
    total_recommendations: number;
    categories_analyzed: string[];
    last_analysis: string | null;
    average_confidence: number;
  };
  recent_analyses: any[];
  active_recommendations: Record<string, Recommendation[]>;
}

export const AnalysisDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await aiAnalysisService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAnalysis = async (category: string) => {
    try {
      setIsLoading(true);
      await aiAnalysisService.triggerCategoryAnalysis(category);
      await loadDashboard(); // Refresh dashboard
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">AI Analysis Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Analyses</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {dashboard?.statistics.total_analyses || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Recommendations</h3>
          <p className="text-3xl font-bold text-green-600">
            {dashboard?.statistics.total_recommendations || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Categories Analyzed</h3>
          <p className="text-3xl font-bold text-purple-600">
            {dashboard?.statistics.categories_analyzed.length || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg. Confidence</h3>
          <p className="text-3xl font-bold text-blue-600">
            {Math.round((dashboard?.statistics.average_confidence || 0) * 100)}%
          </p>
        </div>
      </div>

      {/* Analysis Triggers */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Request New Analysis</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['skin', 'hair', 'lifestyle', 'health', 'makeup'].map((category) => (
            <button
              key={category}
              onClick={() => triggerAnalysis(category)}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 capitalize"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Active Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Active Recommendations</h2>
        {Object.entries(dashboard?.active_recommendations || {}).map(([category, recommendations]) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-medium capitalize mb-3">{category}</h3>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{rec.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      rec.priority === 1 ? 'bg-red-100 text-red-800' :
                      rec.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      Priority {rec.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🔍 Search & Personalization

### Search API Endpoints
```typescript
// Search endpoints
POST /api/search                    // Main search with personalization
GET  /api/products/:productId       // Get product details
POST /api/compare                   // Compare products
POST /api/activity/track/search     // Track search activity
```

### Implementation

#### 1. Search Service
```typescript
// services/searchService.ts
import axios from 'axios';

export interface SearchQuery {
  query: string;
  limit?: number;
  includeIngredients?: boolean;
}

export interface SearchResult {
  query: string;
  parsedQuery: any;
  products: Product[];
  ingredients: string[];
  totalFound: number;
  message: string;
  searchMethod: string;
  personalization: {
    isPersonalized: boolean;
    userSegment?: string;
    profileCompleteness?: number;
    skinType?: string;
    primaryConcerns?: string[];
    reason?: string;
  };
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price_mrp: number;
  price_sale: number;
  rating: number;
  review_count: number;
  image_url: string;
  category: string;
  ingredients?: any;
  match_reason?: string;
  personalization_boost?: number;
}

class SearchService {
  async search(searchQuery: SearchQuery): Promise<SearchResult> {
    const response = await axios.post('/api/search', searchQuery);
    return response.data.data;
  }

  async getProductDetails(productId: string): Promise<Product> {
    const response = await axios.get(`/api/products/${productId}`);
    return response.data.data;
  }

  async compareProducts(productIds: string[]) {
    const response = await axios.post('/api/compare', { productIds });
    return response.data.data;
  }

  async trackSearch(query: string, resultsCount: number, filtersApplied?: any) {
    try {
      await axios.post('/api/activity/track/search', {
        search_query: query,
        results_count: resultsCount,
        filters_applied: filtersApplied,
        session_id: this.getSessionId()
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = Date.now().toString();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
}

export const searchService = new SearchService();
```

#### 2. Search Component
```typescript
// components/search/SearchInterface.tsx
import React, { useState } from 'react';
import { searchService, SearchResult } from '../../services/searchService';
import { ProductCard } from './ProductCard';
import { SearchInput } from './SearchInput';

export const SearchInterface: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const searchResults = await searchService.search({
        query: searchQuery,
        limit: 8,
        includeIngredients: true
      });
      
      setResults(searchResults);
      setQuery(searchQuery);
      
      // Track search
      await searchService.trackSearch(searchQuery, searchResults.products.length);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <SearchInput 
          onSearch={handleSearch}
          isLoading={isLoading}
          placeholder="Search for skincare products..."
        />
      </div>

      {results && (
        <div className="space-y-6">
          {/* Search Results Header */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Search Results for "{query}"
              </h2>
              <div className="text-sm text-gray-600">
                {results.totalFound} products found • {results.searchMethod}
              </div>
            </div>
            
            <p className="text-gray-600 mt-2">{results.message}</p>
            
            {/* Personalization Info */}
            {results.personalization.isPersonalized && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-indigo-600 font-medium">🎯 Personalized Results</span>
                  <span className="text-sm text-indigo-700">
                    Profile: {results.personalization.profileCompleteness}% complete
                  </span>
                </div>
                <div className="text-sm text-indigo-600 mt-1">
                  Tailored for {results.personalization.skinType} skin • 
                  {results.personalization.userSegment}
                </div>
              </div>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Highlighted Ingredients */}
          {results.ingredients.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Key Ingredients Found</h3>
              <div className="flex flex-wrap gap-2">
                {results.ingredients.map((ingredient, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

#### 3. Product Card Component
```typescript
// components/search/ProductCard.tsx
import React from 'react';
import { Product } from '../../services/searchService';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();

  const discountPercentage = product.price_sale && product.price_mrp 
    ? Math.round(((product.price_mrp - product.price_sale) / product.price_mrp) * 100)
    : 0;

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="relative">
        <img
          src={product.image_url || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            {discountPercentage}% OFF
          </span>
        )}
        {product.personalization_boost && product.personalization_boost > 0 && (
          <span className="absolute top-2 right-2 bg-indigo-500 text-white px-2 py-1 rounded text-xs">
            🎯 Match
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {product.price_sale && product.price_sale < product.price_mrp ? (
              <>
                <span className="font-bold text-lg">₹{product.price_sale}</span>
                <span className="text-gray-500 line-through text-sm">₹{product.price_mrp}</span>
              </>
            ) : (
              <span className="font-bold text-lg">₹{product.price_mrp}</span>
            )}
          </div>
          
          {product.rating && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-gray-500 text-xs">({product.review_count})</span>
            </div>
          )}
        </div>

        {product.match_reason && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
            <strong>Why this matches:</strong> {product.match_reason}
          </div>
        )}

        <button 
          className="w-full mt-3 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/products/${product.id}`);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};
```

## 📱 Complete Frontend Architecture

### State Management (Zustand Example)
```typescript
// stores/useAppStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Profile
  profile: CompleteProfile | null;
  profileLoading: boolean;
  
  // AI Analysis
  analysisHistory: any[];
  activeRecommendations: Recommendation[];
  
  // Search
  searchHistory: string[];
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: CompleteProfile) => void;
  addToSearchHistory: (query: string) => void;
  setAnalysisHistory: (history: any[]) => void;
  setActiveRecommendations: (recommendations: Recommendation[]) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        profile: null,
        profileLoading: false,
        analysisHistory: [],
        activeRecommendations: [],
        searchHistory: [],

        // Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setProfile: (profile) => set({ profile }),
        addToSearchHistory: (query) => {
          const current = get().searchHistory;
          const updated = [query, ...current.filter(q => q !== query)].slice(0, 10);
          set({ searchHistory: updated });
        },
        setAnalysisHistory: (analysisHistory) => set({ analysisHistory }),
        setActiveRecommendations: (activeRecommendations) => set({ activeRecommendations }),
      }),
      {
        name: 'xpertbuyer-store',
        partialize: (state) => ({
          searchHistory: state.searchHistory,
          user: state.user,
        }),
      }
    )
  )
);
```

### App Router (React Router)
```typescript
// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { AnalysisPage } from './pages/AnalysisPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/products/:productId" element={<ProductDetailsPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/analysis" element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            } />

            {/* Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

This documentation provides a complete foundation for implementing the XpertBuyer frontend with all the key features integrated. Each section includes working code examples that you can adapt to your chosen frontend framework. 



## 🎥 Video Content Integration

### Video API Endpoints
```typescript
// Video content endpoints
GET /api/products/:productId/videos          // Get videos for specific product
GET /api/videos/products-summary?productIds  // Get video summary for multiple products
```

### Implementation

#### 1. Video Service
```typescript
// services/videoService.ts
import axios from 'axios';

export interface VideoMention {
  id: string;
  video_id: string;
  start_time: number;
  end_time: number;
  context: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  claims: string[];
  mentioned_benefits: string[];
}

export interface CreatorVideo {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  duration: number;
  view_count: number;
  like_count: number;
  creator: {
    id: string;
    name: string;
    profile_image: string;
    subscriber_count: number;
    verified: boolean;
  };
  mentions: VideoMention[];
  published_at: string;
}

export interface ProductVideos {
  product_id: string;
  total_videos: number;
  total_mentions: number;
  average_sentiment: number;
  videos: CreatorVideo[];
}

class VideoService {
  async getProductVideos(productId: string): Promise<ProductVideos> {
    const response = await axios.get(`/api/products/${productId}/videos`);
    return response.data.data;
  }

  async getVideosSummary(productIds: string[]) {
    const params = productIds.join(',');
    const response = await axios.get(`/api/videos/products-summary?productIds=${params}`);
    return response.data.data;
  }
}

export const videoService = new VideoService();
```

#### 2. Video Player Component
```typescript
// components/video/VideoPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { VideoMention } from '../../services/videoService';

interface VideoPlayerProps {
  videoUrl: string;
  mentions: VideoMention[];
  productName: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  mentions, 
  productName 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const jumpToMention = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full h-64 object-cover"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Video Overlay for Mentions */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
            {mentions.find(m => currentTime >= m.start_time && currentTime <= m.end_time) && (
              <span>🎯 {productName} mentioned here</span>
            )}
          </div>
        </div>
      </div>

      {/* Mention Timeline */}
      <div className="p-4">
        <h4 className="font-semibold mb-3">Product Mentions</h4>
        <div className="space-y-2">
          {mentions.map((mention) => (
            <div
              key={mention.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => jumpToMention(mention.start_time)}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {Math.floor(mention.start_time / 60)}:{String(Math.floor(mention.start_time % 60)).padStart(2, '0')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    mention.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                    mention.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mention.sentiment}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{mention.context}</p>
                {mention.mentioned_benefits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mention.mentioned_benefits.map((benefit, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {benefit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button className="text-indigo-600 hover:text-indigo-800">
                ▶ Jump to
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

#### 3. Video Gallery Component
```typescript
// components/video/VideoGallery.tsx
import React, { useState, useEffect } from 'react';
import { videoService, ProductVideos, CreatorVideo } from '../../services/videoService';
import { VideoPlayer } from './VideoPlayer';

interface VideoGalleryProps {
  productId: string;
  productName: string;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ productId, productName }) => {
  const [videoData, setVideoData] = useState<ProductVideos | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<CreatorVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, [productId]);

  const loadVideos = async () => {
    try {
      const data = await videoService.getProductVideos(productId);
      setVideoData(data);
      if (data.videos.length > 0) {
        setSelectedVideo(data.videos[0]);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  if (!videoData || videoData.videos.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <p className="text-gray-600">No video reviews available for this product yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-indigo-600">{videoData.total_videos}</div>
          <div className="text-sm text-gray-600">Videos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-green-600">{videoData.total_mentions}</div>
          <div className="text-sm text-gray-600">Mentions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(videoData.average_sentiment * 100)}%
          </div>
          <div className="text-sm text-gray-600">Positive</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Player */}
        <div className="lg:col-span-2">
          {selectedVideo && (
            <VideoPlayer
              videoUrl={selectedVideo.video_url}
              mentions={selectedVideo.mentions}
              productName={productName}
            />
          )}
        </div>

        {/* Video List */}
        <div className="space-y-4">
          <h3 className="font-semibold">All Reviews</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {videoData.videos.map((video) => (
              <div
                key={video.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedVideo?.id === video.id 
                    ? 'bg-indigo-100 border-2 border-indigo-500' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => setSelectedVideo(video)}
              >
                <div className="flex space-x-3">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <img
                        src={video.creator.profile_image}
                        alt={video.creator.name}
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-xs text-gray-600">{video.creator.name}</span>
                      {video.creator.verified && <span className="text-blue-500">✓</span>}
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>{video.view_count.toLocaleString()} views</span>
                      <span>•</span>
                      <span>{video.mentions.length} mentions</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 📊 Activity Tracking

### Activity Tracking API
```typescript
// Activity tracking endpoints
POST /api/activity/track/search         // Track search queries
POST /api/activity/track/product-view   // Track product views
POST /api/activity/track/interaction    // Track user interactions
GET  /api/activity/analytics           // Get user analytics
```

### Implementation

#### 1. Activity Tracking Service
```typescript
// services/activityService.ts
import axios from 'axios';

export interface ActivityData {
  activity_type: string;
  search_query?: string;
  product_id?: string;
  interaction_type?: string;
  filters_applied?: any;
  session_id: string;
  metadata?: any;
}

class ActivityService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  async trackSearch(query: string, resultsCount: number, filtersApplied?: any) {
    try {
      await axios.post('/api/activity/track/search', {
        search_query: query,
        results_count: resultsCount,
        filters_applied: filtersApplied,
        session_id: this.sessionId,
        metadata: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  }

  async trackProductView(productId: string, source?: string, timeSpent?: number) {
    try {
      await axios.post('/api/activity/track/product-view', {
        product_id: productId,
        session_id: this.sessionId,
        metadata: {
          source,
          time_spent: timeSpent,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to track product view:', error);
    }
  }

  async trackInteraction(interactionType: string, targetId?: string, metadata?: any) {
    try {
      await axios.post('/api/activity/track/interaction', {
        interaction_type: interactionType,
        target_id: targetId,
        session_id: this.sessionId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }

  async getAnalytics() {
    try {
      const response = await axios.get('/api/activity/analytics');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }
}

export const activityService = new ActivityService();
```

#### 2. Activity Tracking Hook
```typescript
// hooks/useActivityTracking.ts
import { useEffect, useRef } from 'react';
import { activityService } from '../services/activityService';

export const usePageTracking = (pageType: string, pageId?: string) => {
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    // Track page entry
    activityService.trackInteraction('page_view', pageId, {
      page_type: pageType,
      entry_time: new Date().toISOString()
    });

    // Track page exit on unmount
    return () => {
      const timeSpent = Date.now() - startTime.current;
      activityService.trackInteraction('page_exit', pageId, {
        page_type: pageType,
        time_spent: Math.round(timeSpent / 1000) // seconds
      });
    };
  }, [pageType, pageId]);
};

export const useProductViewTracking = (productId: string, source?: string) => {
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    if (productId) {
      // Track product view on mount
      activityService.trackProductView(productId, source);

      // Track time spent on unmount
      return () => {
        const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
        if (timeSpent > 5) { // Only track if spent more than 5 seconds
          activityService.trackProductView(productId, source, timeSpent);
        }
      };
    }
  }, [productId, source]);
};

export const useSearchTracking = () => {
  const trackSearch = (query: string, resultsCount: number, filters?: any) => {
    activityService.trackSearch(query, resultsCount, filters);
  };

  const trackFilterApplied = (filterType: string, filterValue: any) => {
    activityService.trackInteraction('filter_applied', null, {
      filter_type: filterType,
      filter_value: filterValue
    });
  };

  const trackResultClicked = (productId: string, position: number, query: string) => {
    activityService.trackInteraction('search_result_click', productId, {
      query,
      position,
      result_type: 'product'
    });
  };

  return {
    trackSearch,
    trackFilterApplied,
    trackResultClicked
  };
};
```

## 🚨 Error Handling

### Global Error Boundary
```typescript
// components/error/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to error tracking service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Send to error tracking service like Sentry, LogRocket, etc.
    console.error('Error logged:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry! An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler
```typescript
// utils/errorHandler.ts
export interface APIError {
  success: false;
  error: string;
  message: string;
  details?: any;
}

export const handleAPIError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 401) {
    return 'You need to log in to access this feature.';
  }
  
  if (error.response?.status === 403) {
    return 'You don\'t have permission to perform this action.';
  }
  
  if (error.response?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  if (error.message === 'Network Error') {
    return 'Network error. Please check your connection.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Error Toast Hook
export const useErrorToast = () => {
  const showError = (error: any) => {
    const message = handleAPIError(error);
    // Show toast notification
    console.error(message);
    // You can integrate with toast libraries like react-hot-toast, sonner, etc.
  };

  return { showError };
};
```

## 🔧 Performance Optimization

### Code Splitting & Lazy Loading
```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const AnalysisDashboard = lazy(() => import('../components/ai/AnalysisDashboard'));
const VideoGallery = lazy(() => import('../components/video/VideoGallery'));
const ProductComparison = lazy(() => import('../components/product/ProductComparison'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AnalysisDashboard />
</Suspense>
```

### Image Optimization
```typescript
// components/ui/OptimizedImage.tsx
import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const generateWebPUrl = (url: string) => {
    // Convert to WebP if service supports it
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  return (
    <picture>
      <source srcSet={generateWebPUrl(src)} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </picture>
  );
};
```

### Infinite Scroll Hook
```typescript
// hooks/useInfiniteScroll.ts
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps<T> {
  fetchMore: (page: number) => Promise<T[]>;
  hasMore: boolean;
  threshold?: number;
}

export const useInfiniteScroll = <T>({
  fetchMore,
  hasMore,
  threshold = 100
}: UseInfiniteScrollProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await fetchMore(page);
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, hasMore, loading, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - threshold
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, threshold]);

  return { items, loading, loadMore };
};
```

## 🚀 Deployment Configuration

### Environment Configuration
```typescript
// config/environment.ts
export const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
  WS_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:3000',
  SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
  GOOGLE_ANALYTICS_ID: process.env.REACT_APP_GA_ID,
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  
  // Feature flags
  FEATURES: {
    ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    ENABLE_ERROR_REPORTING: process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true',
    ENABLE_VIDEO_CONTENT: process.env.REACT_APP_ENABLE_VIDEO_CONTENT === 'true'
  }
};
```

### Build Optimization (Vite/Webpack)
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
          utils: ['axios', 'date-fns', 'lodash']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  }
});
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

This completes the comprehensive frontend implementation guide for XpertBuyer. The guide covers all major aspects including authentication, profile management, AI integration, search functionality, video content, activity tracking, error handling, and deployment configurations. 