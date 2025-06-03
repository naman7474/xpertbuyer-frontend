import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { LifestyleProfile } from '../../types';

const LifestyleProfileForm: React.FC = () => {
  const [formData, setFormData] = useState<LifestyleProfile>({
    location_city: '',
    location_state: '',
    climate_type: '',
    pollution_level: '',
    uv_exposure_level: '',
    water_quality: '',
    diet_type: '',
    hydration_level: '',
    dietary_preferences: {
      spicy_food: false,
      processed_food: ''
    },
    sleep_hours: 0,
    sleep_quality: '',
    stress_level: '',
    exercise_frequency: '',
    smoking_status: '',
    alcohol_consumption: '',
    work_environment: '',
    screen_time_hours: 0,
    ac_exposure_hours: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchLifestyleProfile();
  }, []);

  const fetchLifestyleProfile = async () => {
    try {
      const response = await authService.getLifestyleProfile();
      if (response.success && response.data) {
        setFormData(response.data);
        setIsEditing(true);
      }
    } catch (err: any) {
      console.log('No existing lifestyle profile found');
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.updateLifestyleProfile(formData);
      if (response.success) {
        navigate('/profile');
      } else {
        setError('Failed to save lifestyle profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save lifestyle profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name === 'dietary_preferences.spicy_food') {
        setFormData(prev => ({
          ...prev,
          dietary_preferences: {
            ...prev.dietary_preferences,
            spicy_food: checkbox.checked
          }
        }));
      }
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof LifestyleProfile] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit' : 'Create'} Lifestyle Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Tell us about your environment and daily habits for personalized recommendations
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Profile
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Location & Environment */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Location & Environment
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="location_city"
                    value={formData.location_city}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="e.g., Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="location_state"
                    value={formData.location_state}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="e.g., Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Climate Type
                  </label>
                  <select
                    name="climate_type"
                    value={formData.climate_type}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select climate type</option>
                    <option value="tropical">Tropical</option>
                    <option value="subtropical">Subtropical</option>
                    <option value="temperate">Temperate</option>
                    <option value="continental">Continental</option>
                    <option value="polar">Polar</option>
                    <option value="arid">Arid</option>
                    <option value="mediterranean">Mediterranean</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pollution Level
                  </label>
                  <select
                    name="pollution_level"
                    value={formData.pollution_level}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select pollution level</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UV Exposure Level
                  </label>
                  <select
                    name="uv_exposure_level"
                    value={formData.uv_exposure_level}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select UV exposure level</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Water Quality
                  </label>
                  <select
                    name="water_quality"
                    value={formData.water_quality}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select water quality</option>
                    <option value="soft">Soft</option>
                    <option value="moderate">Moderate</option>
                    <option value="hard">Hard</option>
                    <option value="very_hard">Very Hard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Diet & Nutrition */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Diet & Nutrition
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diet Type
                  </label>
                  <select
                    name="diet_type"
                    value={formData.diet_type}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select diet type</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="non_vegetarian">Non-Vegetarian</option>
                    <option value="keto">Keto</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="gluten_free">Gluten-Free</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hydration Level
                  </label>
                  <select
                    name="hydration_level"
                    value={formData.hydration_level}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select hydration level</option>
                    <option value="poor">Poor (less than 4 glasses/day)</option>
                    <option value="fair">Fair (4-6 glasses/day)</option>
                    <option value="good">Good (7-8 glasses/day)</option>
                    <option value="excellent">Excellent (8+ glasses/day)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processed Food Consumption
                  </label>
                  <select
                    name="dietary_preferences.processed_food"
                    value={formData.dietary_preferences.processed_food}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select frequency</option>
                    <option value="minimal">Minimal</option>
                    <option value="moderate">Moderate</option>
                    <option value="frequent">Frequent</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="spicy_food"
                    name="dietary_preferences.spicy_food"
                    checked={formData.dietary_preferences.spicy_food}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="spicy_food" className="text-sm font-medium text-gray-700">
                    Regular consumption of spicy food
                  </label>
                </div>
              </div>
            </div>

            {/* Sleep & Wellness */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Sleep & Wellness
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Sleep Hours
                  </label>
                  <input
                    type="number"
                    name="sleep_hours"
                    value={formData.sleep_hours}
                    onChange={handleInputChange}
                    min="3"
                    max="12"
                    step="0.5"
                    className="form-input"
                    placeholder="e.g., 7.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Quality
                  </label>
                  <select
                    name="sleep_quality"
                    value={formData.sleep_quality}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select sleep quality</option>
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="excellent">Excellent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stress Level
                  </label>
                  <select
                    name="stress_level"
                    value={formData.stress_level}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select stress level</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercise Frequency
                  </label>
                  <select
                    name="exercise_frequency"
                    value={formData.exercise_frequency}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select exercise frequency</option>
                    <option value="none">None</option>
                    <option value="light">Light (1-2 times/week)</option>
                    <option value="moderate">Moderate (3-4 times/week)</option>
                    <option value="high">High (5+ times/week)</option>
                    <option value="professional">Professional athlete</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lifestyle Habits */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Lifestyle Habits
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Smoking Status
                  </label>
                  <select
                    name="smoking_status"
                    value={formData.smoking_status}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select smoking status</option>
                    <option value="never">Never</option>
                    <option value="former">Former smoker</option>
                    <option value="occasional">Occasional</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alcohol Consumption
                  </label>
                  <select
                    name="alcohol_consumption"
                    value={formData.alcohol_consumption}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select alcohol consumption</option>
                    <option value="never">Never</option>
                    <option value="rarely">Rarely</option>
                    <option value="occasionally">Occasionally</option>
                    <option value="regularly">Regularly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Environment
                  </label>
                  <select
                    name="work_environment"
                    value={formData.work_environment}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select work environment</option>
                    <option value="air_conditioned_office">Air-conditioned office</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="industrial">Industrial</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail</option>
                    <option value="remote_home">Remote/Home</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Screen Time (hours)
                  </label>
                  <input
                    type="number"
                    name="screen_time_hours"
                    value={formData.screen_time_hours}
                    onChange={handleInputChange}
                    min="0"
                    max="16"
                    step="0.5"
                    className="form-input"
                    placeholder="e.g., 8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AC Exposure (hours/day)
                  </label>
                  <input
                    type="number"
                    name="ac_exposure_hours"
                    value={formData.ac_exposure_hours}
                    onChange={handleInputChange}
                    min="0"
                    max="24"
                    step="0.5"
                    className="form-input"
                    placeholder="e.g., 9"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? 'Saving...' : (isEditing ? 'Update Profile' : 'Save Profile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LifestyleProfileForm; 