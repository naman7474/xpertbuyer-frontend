import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance for activity tracking
const activityApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
activityApi.interceptors.request.use(
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

interface ActivityTrackingData {
  activity_type: string;
  product_id?: string;
  search_query?: string;
  filters_applied?: Record<string, any>;
  page_url?: string;
  referrer_url?: string;
  session_id?: string;
  metadata?: Record<string, any>;
  position?: number;
  recommendation_context?: string;
  results_count?: number;
  search_context?: string;
}

interface ProductViewData {
  product_id: string;
  page_url: string;
  referrer_url?: string;
  session_id?: string;
}

interface SearchData {
  search_query: string;
  filters_applied?: Record<string, any>;
  results_count: number;
  session_id?: string;
}

interface FilterData {
  filters_applied: Record<string, any>;
  search_context?: string;
  results_count: number;
  session_id?: string;
}

interface RecommendationData {
  activity_type: 'recommendation_clicked' | 'recommendation_viewed';
  product_id: string;
  recommendation_context: string;
  position: number;
  session_id?: string;
}

interface WishlistData {
  activity_type: 'wishlist_add' | 'wishlist_remove';
  product_id: string;
  session_id?: string;
}

export const activityService = {
  // Generic activity tracking
  track: async (data: ActivityTrackingData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await activityApi.post('/activity/track', data);
      return response.data;
    } catch (error: any) {
      console.error('Activity tracking error:', error);
      return { success: false, message: 'Failed to track activity' };
    }
  },

  // Track product view
  trackProductView: async (data: ProductViewData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await activityApi.post('/activity/track/product-view', data);
      return response.data;
    } catch (error: any) {
      console.error('Product view tracking error:', error);
      return { success: false, message: 'Failed to track product view' };
    }
  },

  // Track search query
  trackSearch: async (data: SearchData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await activityApi.post('/activity/track/search', data);
      return response.data;
    } catch (error: any) {
      console.error('Search tracking error:', error);
      return { success: false, message: 'Failed to track search' };
    }
  },

  // Track filter application
  trackFilter: async (data: FilterData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await activityApi.post('/activity/track/filter', data);
      return response.data;
    } catch (error: any) {
      console.error('Filter tracking error:', error);
      return { success: false, message: 'Failed to track filter' };
    }
  },

  // Track recommendation interaction
  trackRecommendation: async (data: RecommendationData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await activityApi.post('/activity/track/recommendation', data);
      return response.data;
    } catch (error: any) {
      console.error('Recommendation tracking error:', error);
      return { success: false, message: 'Failed to track recommendation' };
    }
  },

  // Track wishlist action (requires authentication)
  trackWishlist: async (data: WishlistData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await activityApi.post('/activity/track/wishlist', data);
      return response.data;
    } catch (error: any) {
      console.error('Wishlist tracking error:', error);
      return { success: false, message: 'Failed to track wishlist action' };
    }
  },

  // Get user activity history (requires authentication)
  getActivityHistory: async (params?: {
    activity_type?: string;
    limit?: number;
    offset?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const response = await activityApi.get('/activity/history', { params });
      return response.data;
    } catch (error: any) {
      console.error('Activity history fetch error:', error);
      return { success: false, message: 'Failed to fetch activity history' };
    }
  },

  // Get user activity analytics (requires authentication)
  getActivityAnalytics: async (days?: number): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const params = days ? { days } : {};
      const response = await activityApi.get('/activity/analytics', { params });
      return response.data;
    } catch (error: any) {
      console.error('Activity analytics fetch error:', error);
      return { success: false, message: 'Failed to fetch activity analytics' };
    }
  },

  // Utility function to generate session ID
  generateSessionId: (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Get or create session ID from localStorage
  getSessionId: (): string => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = activityService.generateSessionId();
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  },

  // Clear session (useful for logout)
  clearSession: (): void => {
    localStorage.removeItem('session_id');
  },
};

export default activityService; 