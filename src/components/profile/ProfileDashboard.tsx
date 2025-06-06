import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { CompleteProfile } from '../../types';
import { getProfileCompletion } from '../../utils/profileUtils';
import { logger } from '../../utils/logger';

const ProfileDashboard: React.FC = () => {
  const [profile, setProfile] = useState<CompleteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchCompleteProfile();
  }, [authState.isAuthenticated, navigate]);

  const fetchCompleteProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getCompleteProfile();
      if (response.success) {
        setProfile(response.data);
      } else {
        setError('Failed to load profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
              logger.error('Logout error:', error);
    }
  };

  const profileCompletion = getProfileCompletion(profile);

  const profileSections = [
    {
      id: 'skin',
      title: 'Skin Profile',
      description: 'Your skin type, concerns, and skincare routine',
      icon: '🧴',
      completed: !!profile?.skin_profiles,
      path: '/profile/skin'
    },
    {
      id: 'hair',
      title: 'Hair Profile',
      description: 'Hair type, texture, and care preferences',
      icon: '💇‍♀️',
      completed: !!profile?.hair_profiles,
      path: '/profile/hair'
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle & Environment',
      description: 'Location, climate, diet, and daily habits',
      icon: '🌍',
      completed: !!profile?.lifestyle_demographics,
      path: '/profile/lifestyle'
    },
    {
      id: 'health',
      title: 'Health & Medical',
      description: 'Medical conditions, allergies, and medications',
      icon: '🏥',
      completed: !!profile?.health_medical_conditions,
      path: '/profile/health'
    },
    {
      id: 'makeup',
      title: 'Makeup Preferences',
      description: 'Makeup style, colors, and product preferences',
      icon: '💄',
      completed: !!profile?.makeup_preferences,
      path: '/profile/makeup'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchCompleteProfile}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-6">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">XpertBuyer</h1>
              <span className="ml-2 md:ml-4 text-gray-500 text-sm md:text-base">Profile Dashboard</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-3 md:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm md:text-base font-medium"
              >
                Continue Shopping
              </button>
              <button
                onClick={handleLogout}
                className="px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl text-white p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold">
                Welcome back, {profile?.first_name}!
              </h2>
              <p className="mt-2 text-blue-100 text-sm md:text-base">
                Complete your profile to get personalized skincare recommendations
              </p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-3xl md:text-4xl font-bold">{profileCompletion}%</div>
              <div className="text-sm text-blue-100">Profile Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="bg-blue-700 bg-opacity-50 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Basic Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Basic Information</h3>
            <button
              onClick={() => navigate('/profile/basic')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium self-start sm:self-auto"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-gray-900">{profile?.first_name} {profile?.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900 break-all">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Complete Your Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {profileSections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(section.path)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl md:text-3xl">{section.icon}</div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    section.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {section.completed ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                  {section.title}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {section.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    section.completed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {section.completed ? 'Completed' : 'Pending'}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        {profileCompletion < 100 && (
          <div className="mt-8 md:mt-12 bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <svg className="w-8 h-8 text-blue-600 mb-4 md:mb-0 md:mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-lg font-semibold text-blue-900">
                  Complete your profile for better recommendations
                </h4>
                <p className="text-blue-700 mt-1 text-sm md:text-base">
                  The more we know about your skin and preferences, the better recommendations we can provide.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDashboard; 