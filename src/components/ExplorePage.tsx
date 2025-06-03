import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();

  const skinConcerns = [
    { name: 'Acne', description: 'Clear breakouts and prevent future blemishes', icon: '🔥' },
    { name: 'Anti-Aging', description: 'Reduce fine lines and improve skin elasticity', icon: '⏰' },
    { name: 'Dark Spots', description: 'Fade pigmentation and even skin tone', icon: '✨' },
    { name: 'Dry Skin', description: 'Deep hydration and moisture retention', icon: '💧' },
    { name: 'Sensitive Skin', description: 'Gentle care for reactive skin', icon: '🌸' },
    { name: 'Sun Protection', description: 'Shield from harmful UV rays', icon: '☀️' },
    { name: 'Pores', description: 'Minimize appearance and refine texture', icon: '🎯' },
    { name: 'Dullness', description: 'Restore natural glow and radiance', icon: '🌟' },
  ];

  const popularIngredients = [
    { name: 'Vitamin C', description: 'Brightening and antioxidant protection', icon: '🍊' },
    { name: 'Retinol', description: 'Anti-aging and cell renewal', icon: '🔄' },
    { name: 'Hyaluronic Acid', description: 'Intense hydration and plumping', icon: '💧' },
    { name: 'Niacinamide', description: 'Oil control and pore refinement', icon: '🎯' },
    { name: 'Salicylic Acid', description: 'Exfoliation and acne treatment', icon: '🧪' },
    { name: 'Alpha Arbutin', description: 'Brightening and spot reduction', icon: '✨' },
    { name: 'Ceramides', description: 'Barrier repair and protection', icon: '🛡️' },
    { name: 'Peptides', description: 'Collagen support and firming', icon: '💪' },
  ];

  const handleConcernClick = (concern: string) => {
    const query = `I have ${concern.toLowerCase()} concerns, what products do you recommend?`;
    dispatch({ type: 'SET_QUERY', payload: query });
    navigate('/chat');
  };

  const handleIngredientClick = (ingredient: string) => {
    const query = `Show me products with ${ingredient}`;
    dispatch({ type: 'SET_QUERY', payload: query });
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Explore Skincare</h1>
              <p className="text-sm text-gray-500">Discover products by concern or ingredient</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">XpertBuyer</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Search Bar */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Find Your Perfect Skincare
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse by skin concerns or explore specific ingredients to get personalized AI recommendations
          </p>
          
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search for concerns or ingredients..."
              className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  dispatch({ type: 'SET_QUERY', payload: e.currentTarget.value });
                  navigate('/chat');
                }
              }}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Skin Concerns */}
        <section className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Browse by Skin Concern</h3>
            <p className="text-gray-600">Get targeted solutions for your specific needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {skinConcerns.map((concern) => (
              <button
                key={concern.name}
                onClick={() => handleConcernClick(concern.name)}
                className="card p-6 text-left hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{concern.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{concern.name}</h4>
                <p className="text-sm text-gray-600">{concern.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Popular Ingredients */}
        <section className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Explore Key Ingredients</h3>
            <p className="text-gray-600">Discover products featuring these powerhouse ingredients</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularIngredients.map((ingredient) => (
              <button
                key={ingredient.name}
                onClick={() => handleIngredientClick(ingredient.name)}
                className="card p-6 text-left hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{ingredient.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{ingredient.name}</h4>
                <p className="text-sm text-gray-600">{ingredient.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Categories */}
        <section className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-8 text-center space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900">Not sure where to start?</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Try our AI-powered skin analysis. Just describe your skin goals, and we'll create a personalized routine for you.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Start AI Analysis
          </button>
        </section>
      </div>
    </div>
  );
};

export default ExplorePage; 