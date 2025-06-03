import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfilePromptProps {
  message: string;
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
}

const ProfilePrompt: React.FC<ProfilePromptProps> = ({ 
  message, 
  variant = 'banner',
  className = '' 
}) => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();

  const handleAction = () => {
    if (!authState.isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/profile');
    }
  };

  const buttonText = authState.isAuthenticated ? 'Complete Profile' : 'Sign In to Get Started';

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-4 md:p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm md:text-base text-blue-900 font-medium">{message}</p>
            </div>
          </div>
          <button
            onClick={handleAction}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <span className="text-sm font-medium">{buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-6 text-center ${className}`}>
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={handleAction}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <span className="font-medium">{buttonText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // inline variant
  return (
    <div className={`flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <p className="text-sm text-blue-800">{message}</p>
      <button
        onClick={handleAction}
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        {buttonText} →
      </button>
    </div>
  );
};

export default ProfilePrompt; 