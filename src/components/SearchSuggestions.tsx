import React from 'react';
import { Sparkles, Heart, Sun, Moon, Droplet, Shield } from 'lucide-react';

interface SearchSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      text: "I want glowing skin",
      category: "General"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      text: "Best serum for acne",
      category: "Acne Care"
    },
    {
      icon: <Sun className="w-5 h-5" />,
      text: "Anti-aging routine for 30s",
      category: "Anti-Aging"
    },
    {
      icon: <Droplet className="w-5 h-5" />,
      text: "Dry skin moisturizer",
      category: "Dry Skin"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "Sensitive skin cleanser",
      category: "Sensitive Skin"
    },
    {
      icon: <Moon className="w-5 h-5" />,
      text: "Night skincare routine",
      category: "Routine"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What can I help you with today?
        </h2>
        <p className="text-gray-600">
          Try these popular searches or ask me anything about skincare
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {suggestion.icon}
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {suggestion.category}
              </span>
            </div>
            <p className="text-gray-900 font-medium group-hover:text-blue-900 transition-colors">
              "{suggestion.text}"
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Or ask specific questions like "What vitamin C serum is good for sensitive skin?" or "Best moisturizer for oily acne-prone skin"
        </p>
      </div>
    </div>
  );
};

export default SearchSuggestions; 