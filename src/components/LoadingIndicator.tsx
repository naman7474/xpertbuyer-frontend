import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-3xl p-4 rounded-2xl bg-white border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-600">AI is analyzing your request</span>
            <div className="flex space-x-1 ml-2">
              <span className="typing-indicator"></span>
              <span className="typing-indicator"></span>
              <span className="typing-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator; 