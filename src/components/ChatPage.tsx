import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Grid, List, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { authService } from '../services/authService';
import { ChatMessage, Product } from '../types';
import { trackSearch, trackMetaSearch } from '../utils/analytics';
import { activityService } from '../services/activityService';
import { shouldShowProfilePrompt, getSearchProfilePromptMessage, getProfileCompletion } from '../utils/profileUtils';
import { logger } from '../utils/logger';
import LoadingIndicator from './LoadingIndicator';
import ProductCard from './ProductCard';
import CompareView from './CompareView';
import ProductDetailModal from './ProductDetailModal';
import ProfilePrompt from './ProfilePrompt';
import SearchSuggestions from './SearchSuggestions';
import IngredientHighlight from './IngredientHighlight';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { state: authState } = useAuth();
  const [inputQuery, setInputQuery] = useState('');
  const [keyIngredients, setKeyIngredients] = useState<string[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (state.currentQuery && state.messages.length === 0) {
      handleSearch(state.currentQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    const fetchProfile = async () => {
      if (authState.isAuthenticated) {
        try {
          const response = await authService.getCompleteProfile();
          if (response.success) {
            setProfileCompletion(getProfileCompletion(response.data));
          }
        } catch (error) {
          logger.error('Failed to fetch profile:', error);
        }
      }
    };

    fetchProfile();
  }, [authState.isAuthenticated]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await apiService.searchProducts({ query });
      
      if (response.success) {
        dispatch({ type: 'SET_PRODUCTS', payload: response.data.products });
        
        // Track search events
        trackSearch(query, response.data.products.length);
        trackMetaSearch(query);
        
        // Track search with new activity service
        activityService.trackSearch({
          search_query: query,
          filters_applied: response.data.parsedQuery || {},
          results_count: response.data.products.length,
          session_id: activityService.getSessionId()
        });
        
        // Extract key ingredients for highlighting
        const ingredients = response.data.products
          .flatMap(p => p.ingredients?.map(i => i.name) || [])
          .filter(Boolean);
        setKeyIngredients(Array.from(new Set(ingredients)));

        // Create AI response message without streaming
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateResponseText(response.data),
          timestamp: new Date(),
          searchResults: response.data,
        };

        dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
        setShowAllProducts(false); // Reset to show only first product
      }
    } catch (error) {
      logger.error('Search failed:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process your request right now. Please try again.",
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateResponseText = (data: any): string => {
    try {
      const { products, parsedQuery } = data;
      const concern = parsedQuery.concern || 'your skin concerns';
      
      let text = `Great question! I found ${products.length} excellent products for ${concern}.\n\n`;
      
      if (parsedQuery.ingredient) {
        text += `Since you're interested in ${parsedQuery.ingredient}, I've focused on products that contain this powerhouse ingredient.\n\n`;
      }

      text += `Here's your personalized skincare plan:\n\n`;
      
      // Add key ingredients section only (not products)
      const allIngredients = products
        .flatMap((p: Product) => p.ingredients?.map(i => i.name) || [])
        .filter((name: any): name is string => Boolean(name) && typeof name === 'string');
      const uniqueIngredients = Array.from(new Set(allIngredients)).slice(0, 5);
      
      if (uniqueIngredients.length > 0) {
        text += `Key Ingredients to look for:\n`;
        uniqueIngredients.forEach((ingredient) => {
          text += `• ${ingredient}\n`;
        });
        text += `\n`;
      }

      text += `I've curated the perfect products for your needs. Check out the recommendations below!`;

      return text;
    } catch (error) {
      logger.error('Error generating response text:', error);
      return 'I found some great products for you! Please check the product cards below for detailed information.';
    }
  };

  const handleNewQuery = () => {
    if (!inputQuery.trim()) return;
    
    setInputQuery('');
    handleSearch(inputQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNewQuery();
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputQuery(suggestion);
    handleSearch(suggestion);
  };

  const showProfilePrompt = shouldShowProfilePrompt(authState.user, profileCompletion);
  const promptMessage = getSearchProfilePromptMessage(authState.user);

  const productsToShow = showAllProducts ? state.currentProducts : state.currentProducts.slice(0, 1);
  const hasMoreProducts = state.currentProducts.length > 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">Skincare Consultation</h1>
            <p className="text-sm text-gray-500 hidden sm:block">AI-powered recommendations</p>
          </div>
        </div>
        
        {state.currentProducts.length > 0 && (
          <button
            onClick={() => dispatch({ type: 'TOGGLE_COMPARE_MODE' })}
            className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-full transition-all duration-200 ${
              state.compareMode 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {state.compareMode ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            <span className="font-medium hidden sm:inline">
              {state.compareMode ? 'Back to Results' : 'Compare'}
            </span>
          </button>
        )}
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Show profile prompt when needed - for guest users show during any search activity */}
          {showProfilePrompt && (state.currentProducts.length > 0 || (!authState.isAuthenticated && state.messages.length > 0)) && (
            <ProfilePrompt 
              message={promptMessage}
              variant="banner"
              className="mb-6"
            />
          )}

          {state.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <IngredientHighlight 
                  text={message.content} 
                  ingredients={keyIngredients}
                  className={message.role === 'user' ? 'text-white' : 'text-gray-900'}
                />
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {state.isLoading && <LoadingIndicator />}

          {/* Show profile prompt during loading for guest users */}
          {showProfilePrompt && state.isLoading && !authState.isAuthenticated && (
            <ProfilePrompt 
              message="Sign in to get the most accurate personalized recommendations!"
              variant="inline"
              className="my-4"
            />
          )}

          {/* Show suggestions when no messages and not loading */}
          {state.messages.length === 0 && !state.isLoading && (
            <SearchSuggestions onSuggestionClick={handleSuggestionClick} />
          )}

          {/* Products Section */}
          {state.currentProducts.length > 0 && !state.compareMode && !state.isLoading && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Recommended Products
                </h3>
                <p className="text-gray-600">
                  Click on any product to see detailed information and reviews
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {productsToShow.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => {
                      dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product });
                      dispatch({ type: 'TOGGLE_PRODUCT_DETAIL' });
                    }}
                  />
                ))}
              </div>

              {/* Show More/Less Button */}
              {hasMoreProducts && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllProducts(!showAllProducts)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  >
                    <span className="font-medium text-gray-700">
                      {showAllProducts 
                        ? 'Show Less' 
                        : `See ${state.currentProducts.length - 1} More Recommended Products`
                      }
                    </span>
                    {showAllProducts ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              )}

              {/* Profile prompt after products for better personalization */}
              {showProfilePrompt && authState.isAuthenticated && (
                <ProfilePrompt 
                  message="Get more personalized recommendations by completing your profile!"
                  variant="card"
                  className="mt-8"
                />
              )}
            </div>
          )}

          {/* Compare View */}
          {state.compareMode && state.currentProducts.length > 0 && (
            <CompareView products={state.currentProducts} />
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile prompt when starting to search */}
          {showProfilePrompt && state.messages.length === 0 && !state.isLoading && (
            <ProfilePrompt 
              message={promptMessage}
              variant="inline"
              className="mb-4"
            />
          )}
          
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about skincare..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                rows={1}
                style={{ minHeight: '48px' }}
              />
            </div>
            <button
              onClick={handleNewQuery}
              disabled={!inputQuery.trim() || state.isLoading}
              className={`px-4 py-3 rounded-xl transition-all duration-200 ${
                inputQuery.trim() && !state.isLoading
                  ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {state.showProductDetail && state.selectedProduct && (
        <ProductDetailModal
          product={state.selectedProduct}
          onClose={() => {
            dispatch({ type: 'TOGGLE_PRODUCT_DETAIL' });
            dispatch({ type: 'SET_SELECTED_PRODUCT', payload: undefined });
          }}
        />
      )}
    </div>
  );
};

export default ChatPage; 