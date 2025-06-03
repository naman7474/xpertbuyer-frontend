import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { MakeupProfile } from '../../types';
import { logger } from '../../utils/logger';

const MakeupProfileForm: React.FC = () => {
  const [formData, setFormData] = useState<MakeupProfile>({
    foundation_shade: '',
    foundation_undertone: '',
    foundation_finish: '',
    coverage_preference: '',
    makeup_frequency: '',
    makeup_style: '',
    preferred_lip_colors: [],
    preferred_eye_colors: [],
    preferred_blush_colors: [],
    product_finish_preferences: {
      eyeshadow: '',
      lipstick: ''
    },
    brand_preferences: [],
    price_range_preference: '',
    makeup_allergies: [],
    sensitive_eyes: false,
    contact_lenses: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMakeupProfile();
  }, []);

  const fetchMakeupProfile = async () => {
    try {
      const response = await authService.getMakeupProfile();
      if (response.success && response.data) {
        setFormData(response.data);
        setIsEditing(true);
      }
    } catch (err: any) {
              logger.debug('No existing makeup profile found');
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.updateMakeupProfile(formData);
      if (response.success) {
        navigate('/profile');
      } else {
        setError('Failed to save makeup profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save makeup profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name === 'sensitive_eyes' || name === 'contact_lenses') {
        setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
      }
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof MakeupProfile] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayInput = (field: keyof MakeupProfile, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const lipColors = [
    'nude', 'pink', 'coral', 'red', 'berry', 'plum', 'brown', 'orange'
  ];

  const eyeColors = [
    'brown', 'neutral', 'gold', 'bronze', 'pink', 'purple', 'green', 'blue', 'silver', 'black'
  ];

  const blushColors = [
    'peach', 'coral', 'pink', 'rose', 'berry', 'bronze', 'plum'
  ];

  const brandOptions = [
    'Maybelline', 'L\'Oreal', 'Lakme', 'Revlon', 'MAC', 'Urban Decay',
    'Too Faced', 'NARS', 'Charlotte Tilbury', 'Fenty Beauty', 'Rare Beauty'
  ];

  const makeupAllergies = [
    'nickel', 'cobalt', 'fragrance', 'parabens', 'talc', 'bismuth_oxychloride',
    'carmine', 'lanolin', 'formaldehyde', 'phenoxyethanol'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit' : 'Create'} Makeup Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Tell us about your makeup preferences for personalized product recommendations
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

            {/* Foundation Preferences */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Foundation Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foundation Shade
                  </label>
                  <input
                    type="text"
                    name="foundation_shade"
                    value={formData.foundation_shade}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Medium 3, NC30, 220"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foundation Undertone
                  </label>
                  <select
                    name="foundation_undertone"
                    value={formData.foundation_undertone}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select undertone</option>
                    <option value="warm">Warm</option>
                    <option value="cool">Cool</option>
                    <option value="neutral">Neutral</option>
                    <option value="olive">Olive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foundation Finish
                  </label>
                  <select
                    name="foundation_finish"
                    value={formData.foundation_finish}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select finish</option>
                    <option value="matte">Matte</option>
                    <option value="satin">Satin</option>
                    <option value="dewy">Dewy</option>
                    <option value="natural">Natural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Preference
                  </label>
                  <select
                    name="coverage_preference"
                    value={formData.coverage_preference}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select coverage</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="full">Full</option>
                    <option value="buildable">Buildable</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Makeup Habits */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Makeup Habits
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Makeup Frequency
                  </label>
                  <select
                    name="makeup_frequency"
                    value={formData.makeup_frequency}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays only</option>
                    <option value="special_occasions">Special occasions</option>
                    <option value="rarely">Rarely</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Makeup Style
                  </label>
                  <select
                    name="makeup_style"
                    value={formData.makeup_style}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select style</option>
                    <option value="natural">Natural</option>
                    <option value="professional">Professional</option>
                    <option value="glamorous">Glamorous</option>
                    <option value="dramatic">Dramatic</option>
                    <option value="trendy">Trendy</option>
                    <option value="classic">Classic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range Preference
                  </label>
                  <select
                    name="price_range_preference"
                    value={formData.price_range_preference}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select price range</option>
                    <option value="budget">Budget (Under ₹500)</option>
                    <option value="mid_range">Mid-range (₹500-₹2000)</option>
                    <option value="high_end">High-end (₹2000+)</option>
                    <option value="luxury">Luxury (₹5000+)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Color Preferences */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Color Preferences
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Preferred Lip Colors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {lipColors.map((color) => (
                      <label key={color} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.preferred_lip_colors.includes(color)}
                          onChange={(e) => handleArrayInput('preferred_lip_colors', color, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {color}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Preferred Eye Colors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {eyeColors.map((color) => (
                      <label key={color} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.preferred_eye_colors.includes(color)}
                          onChange={(e) => handleArrayInput('preferred_eye_colors', color, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {color}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Preferred Blush Colors</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {blushColors.map((color) => (
                      <label key={color} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.preferred_blush_colors.includes(color)}
                          onChange={(e) => handleArrayInput('preferred_blush_colors', color, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {color}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Finish Preferences */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Product Finish Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eyeshadow Finish
                  </label>
                  <select
                    name="product_finish_preferences.eyeshadow"
                    value={formData.product_finish_preferences.eyeshadow}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select finish</option>
                    <option value="matte">Matte</option>
                    <option value="shimmer">Shimmer</option>
                    <option value="metallic">Metallic</option>
                    <option value="satin">Satin</option>
                    <option value="glitter">Glitter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lipstick Finish
                  </label>
                  <select
                    name="product_finish_preferences.lipstick"
                    value={formData.product_finish_preferences.lipstick}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select finish</option>
                    <option value="matte">Matte</option>
                    <option value="satin">Satin</option>
                    <option value="glossy">Glossy</option>
                    <option value="sheer">Sheer</option>
                    <option value="velvet">Velvet</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Brand Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Brand Preferences
              </h3>
              <p className="text-sm text-gray-600">Select your favorite makeup brands</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {brandOptions.map((brand) => (
                  <label key={brand} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.brand_preferences.includes(brand)}
                      onChange={(e) => handleArrayInput('brand_preferences', brand, e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-700">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies & Sensitivities */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Allergies & Sensitivities
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Makeup Allergies</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {makeupAllergies.map((allergy) => (
                      <label key={allergy} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.makeup_allergies.includes(allergy)}
                          onChange={(e) => handleArrayInput('makeup_allergies', allergy, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {allergy.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="sensitive_eyes"
                      name="sensitive_eyes"
                      checked={formData.sensitive_eyes}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="sensitive_eyes" className="text-sm font-medium text-gray-700">
                      Sensitive eyes
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="contact_lenses"
                      name="contact_lenses"
                      checked={formData.contact_lenses}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <label htmlFor="contact_lenses" className="text-sm font-medium text-gray-700">
                      Wear contact lenses
                    </label>
                  </div>
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

export default MakeupProfileForm; 