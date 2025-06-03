import axios from 'axios';
import { SearchResponse, Product, CompareResponse, ProductVideoResponse } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SearchRequest {
  query: string;
  limit?: number;
  includeIngredients?: boolean;
}

export const apiService = {
  // Search products based on query
  searchProducts: async (params: SearchRequest): Promise<SearchResponse> => {
    const response = await api.post('/search', {
      query: params.query,
      limit: params.limit || 4,
      includeIngredients: params.includeIngredients !== false,
    });
    return response.data;
  },

  // Get product details by ID
  getProductDetails: async (productId: string): Promise<{ success: boolean; data: Product }> => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  // Compare multiple products
  compareProducts: async (productIds: string[]): Promise<CompareResponse> => {
    const response = await api.post('/compare', { productIds });
    return response.data;
  },

  // Get videos for a product
  getProductVideos: async (productId: string): Promise<ProductVideoResponse> => {
    const response = await api.get(`/products/${productId}/videos`);
    return response.data;
  },

  // Get videos summary for multiple products
  getProductVideosSummary: async (productIds: string[]) => {
    const response = await api.get(`/videos/products-summary?productIds=${productIds.join(',')}`);
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default apiService; 