import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const { state: authState, logout } = useAuth();

  const handleStartChat = () => {
    if (query.trim()) {
      dispatch({ type: 'SET_QUERY', payload: query });
      navigate('/chat');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleStartChat();
    }
  };

  const suggestions = [
    "I want glowing skin",
    "Best serum for acne",
    "Anti-aging routine for 30s",
    "Vitamin C products",
    "Dry skin moisturizer",
    "Sensitive skin cleanser"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-emerald-400/10" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
      
      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">XpertBuyer</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button className="text-gray-600 hover:text-gray-900 font-medium">About</button>
            <button className="text-gray-600 hover:text-gray-900 font-medium">How it works</button>
            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Hi, {authState.user?.first_name}
                </button>
                <button 
                  onClick={logout}
                  className="btn-secondary"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign in
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="btn-primary"
                >
                  Get Started
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center min-h-[80vh] px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Achieve Your
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent block">
              Best Skin
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Get AI-powered skincare recommendations tailored to your unique needs and concerns
          </p>

          {/* Search Input */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell us your skincare goal... (e.g., I want glowing skin)"
                className="w-full px-6 py-4 text-lg rounded-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-lg bg-white/80 backdrop-blur-sm"
              />
              <button
                onClick={handleStartChat}
                disabled={!query.trim()}
                className={`absolute right-2 top-2 bottom-2 px-6 rounded-full transition-all duration-200 flex items-center space-x-2 ${
                  query.trim() 
                    ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="font-medium">Start</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="mb-12">
            <p className="text-sm text-gray-500 mb-4">Try these popular searches:</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(suggestion)}
                  className="px-4 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm text-gray-700 hover:text-gray-900 transition-all duration-200 hover:shadow-md"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/explore')}
              className="btn-secondary flex items-center space-x-2"
            >
              <span>Explore Categories</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Play className="w-5 h-5" />
              <span className="font-medium">Watch how it works</span>
            </button>
          </div>
        </div>
      </main>

      {/* Features Preview */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">Get personalized recommendations based on your skin type and concerns</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Comparisons</h3>
              <p className="text-gray-600">Compare products side-by-side with detailed ingredient analysis</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Reviews</h3>
              <p className="text-gray-600">Watch real reviews from skincare influencers and experts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 