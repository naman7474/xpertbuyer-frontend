import { SearchResponse, Product, CompareResponse, ProductVideoResponse } from '../types';
import { authApi } from './authService'; // Import authApi

// const API_BASE_URL = 'http://localhost:5000/api'; // Not needed if authApi is used

// Remove local api instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

export interface SearchRequest {
  query: string;
  limit?: number;
  includeIngredients?: boolean;
}

export const apiService = {
  // Search products based on query
  searchProducts: async (params: SearchRequest): Promise<SearchResponse> => {
    const response = await authApi.post('/search', { // Use authApi
      query: params.query,
      limit: params.limit || 4,
      includeIngredients: params.includeIngredients !== false,
    });
    return response.data;
  },

  // Get product details by ID
  getProductDetails: async (productId: string): Promise<{ success: boolean; data: Product }> => {
    const response = await authApi.get(`/products/${productId}`); // Use authApi
    return response.data;
  },

  // Compare multiple products
  compareProducts: async (productIds: string[]): Promise<CompareResponse> => {
    const response = await authApi.post('/compare', { productIds }); // Use authApi
    return response.data;
  },

  // Get videos for a product
  getProductVideos: async (productId: string): Promise<ProductVideoResponse> => {
    const response = await authApi.get(`/products/${productId}/videos`); // Use authApi
    return response.data;
  },

  // Get videos summary for multiple products
  getProductVideosSummary: async (productIds: string[]) => {
    const response = await authApi.get(`/videos/products-summary?productIds=${productIds.join(',')}`); // Use authApi
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await authApi.get('/health'); // Use authApi
    return response.data;
  },
};

export default apiService; 