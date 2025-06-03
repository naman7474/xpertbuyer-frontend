import { authApi } from './authService';
import { logger } from '../utils/logger';

export interface SearchQuery {
  query: string;
  limit?: number;
  includeIngredients?: boolean;
}

export interface SearchResult {
  query: string;
  parsedQuery: {
    intent: string;
    entities: string[];
    category?: string;
    brand?: string;
    ingredients?: string[];
  };
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
  ingredients?: {
    key_ingredients: string[];
    full_ingredients: string[];
    harmful_ingredients: string[];
    beneficial_ingredients: string[];
  };
  match_reason?: string;
  personalization_boost?: number;
  availability?: {
    in_stock: boolean;
    variants: Array<{
      id: string;
      name: string;
      price: number;
      in_stock: boolean;
    }>;
  };
}

export interface ComparisonResult {
  products: Product[];
  comparison: {
    price_comparison: Array<{
      product_id: string;
      price_rank: number;
      value_score: number;
    }>;
    ingredient_analysis: {
      common_ingredients: string[];
      unique_ingredients: Record<string, string[]>;
      harmful_ingredients: Record<string, string[]>;
    };
    ratings_comparison: Array<{
      product_id: string;
      rating: number;
      review_count: number;
      trust_score: number;
    }>;
    recommendation: {
      best_value: string;
      best_rated: string;
      most_suitable: string;
      reasons: Record<string, string>;
    };
  };
}

class SearchService {
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  async search(searchQuery: SearchQuery): Promise<SearchResult> {
    try {
      const response = await authApi.post('/search', searchQuery);
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Search failed' };
    }
  }

  async getProductDetails(productId: string): Promise<Product> {
    try {
      const response = await authApi.get(`/products/${productId}`);
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Failed to get product details' };
    }
  }

  async compareProducts(productIds: string[]): Promise<ComparisonResult> {
    try {
      const response = await authApi.post('/compare', { productIds });
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Comparison failed' };
    }
  }

  async trackSearch(query: string, resultsCount: number, filtersApplied?: any) {
    try {
      await authApi.post('/activity/track/search', {
        search_query: query,
        results_count: resultsCount,
        filters_applied: filtersApplied,
        session_id: this.getSessionId()
      });
    } catch (error) {
      logger.error('Failed to track search:', error);
    }
  }

  async getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
    try {
      const response = await authApi.get(`/search/suggestions?query=${encodeURIComponent(query)}&limit=${limit}`);
      return response.data.data.suggestions;
    } catch (error) {
      logger.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  async getPopularSearches(limit = 10): Promise<string[]> {
    try {
      const response = await authApi.get(`/search/popular?limit=${limit}`);
      return response.data.data.searches;
    } catch (error) {
      logger.error('Failed to get popular searches:', error);
      return [];
    }
  }
}

export const searchService = new SearchService(); 