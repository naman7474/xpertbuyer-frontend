import React, { useState } from 'react';
import { searchService, SearchQuery, SearchResult } from '../services/searchService';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

const SearchWithPersonalization: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { state } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const searchQuery: SearchQuery = {
        query,
        limit: 4,
        includeIngredients: true
      };
      
      const searchResults = await searchService.search(searchQuery);
      setResults(searchResults);
      
      // Track search
      await searchService.trackSearch(query, searchResults.products.length);
      
      logger.debug('Search Results:', searchResults);
      logger.debug('Personalization:', searchResults.personalization);
      
    } catch (err: any) {
      setError(err.message || 'Search failed');
      logger.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Authentication Status */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Authentication Status</h3>
        {state.isAuthenticated ? (
          <div className="text-green-600">
            ✅ Logged in as {state.user?.first_name} {state.user?.last_name}
          </div>
        ) : (
          <div className="text-orange-600">
            ⚠️ Not authenticated - will get basic search results
          </div>
        )}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for skincare products... (e.g., 'best sunscreen for office use')"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">❌ Error: {error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Personalization Info */}
          {results.personalization.isPersonalized && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🎯 Personalized Results</h3>
              <div className="text-sm text-green-700">
                <p><strong>User Segment:</strong> {results.personalization.userSegment}</p>
                <p><strong>Profile Completeness:</strong> {results.personalization.profileCompleteness}%</p>
                {results.personalization.skinType && (
                  <p><strong>Skin Type:</strong> {results.personalization.skinType}</p>
                )}
                {results.personalization.primaryConcerns && results.personalization.primaryConcerns.length > 0 && (
                  <p><strong>Primary Concerns:</strong> {results.personalization.primaryConcerns.join(', ')}</p>
                )}
                <p><strong>Reason:</strong> {results.personalization.reason}</p>
              </div>
            </div>
          )}

          {/* Search Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🔍 Search Information</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Query:</strong> {results.query}</p>
              <p><strong>Intent:</strong> {results.parsedQuery.intent}</p>
              <p><strong>Category:</strong> {results.parsedQuery.category || 'Not specified'}</p>
              <p><strong>Brand:</strong> {results.parsedQuery.brand || 'Not specified'}</p>
              <p><strong>Search Method:</strong> {results.searchMethod}</p>
              <p><strong>Total Found:</strong> {results.totalFound} products</p>
              {results.parsedQuery.entities.length > 0 && (
                <p><strong>Entities:</strong> {results.parsedQuery.entities.join(', ')}</p>
              )}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Products ({results.products.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h4>
                  <p className="text-gray-600 mb-2">{product.brand}</p>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-lg font-bold text-green-600">₹{product.price_sale}</span>
                      {product.price_mrp > product.price_sale && (
                        <span className="text-sm text-gray-500 line-through ml-2">₹{product.price_mrp}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm ml-1">{product.rating} ({product.review_count})</span>
                    </div>
                  </div>
                  
                  {/* Match Reason */}
                  {product.match_reason && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <strong>Why this matches:</strong> {product.match_reason}
                    </div>
                  )}

                  {/* Personalization Boost */}
                  {product.personalization_boost && product.personalization_boost > 0 && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <strong>Personalization Boost:</strong> +{(product.personalization_boost * 100).toFixed(1)}%
                    </div>
                  )}

                  {/* Key Ingredients */}
                  {product.ingredients?.key_ingredients && product.ingredients.key_ingredients.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-sm mb-1">Key Ingredients:</h5>
                      <div className="flex flex-wrap gap-1">
                        {product.ingredients.key_ingredients.slice(0, 3).map((ingredient, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {ingredient}
                          </span>
                        ))}
                        {product.ingredients.key_ingredients.length > 3 && (
                          <span className="text-xs text-gray-500">+{product.ingredients.key_ingredients.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {product.availability && (
                    <div className="text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        product.availability.in_stock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.availability.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients Analysis */}
          {results.ingredients && results.ingredients.length > 0 && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">🧪 Ingredients Found</h3>
              <div className="flex flex-wrap gap-2">
                {results.ingredients.map((ingredient, idx) => (
                  <span key={idx} className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
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

export default SearchWithPersonalization; 