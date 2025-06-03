import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { SkinProfile } from '../../types';

const SkinProfileForm: React.FC = () => {
  const [formData, setFormData] = useState<SkinProfile>({
    skin_type: '',
    skin_tone: '',
    undertone: '',
    fitzpatrick_phototype: 1,
    primary_concerns: [],
    known_allergies: [],
    skin_sensitivity: '',
    daily_sun_exposure: 0,
    sunscreen_usage: '',
    current_routine: {
      morning: [],
      evening: []
    },
    photo_analysis_consent: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkinProfile();
  }, []);

  const fetchSkinProfile = async () => {
    try {
      const response = await authService.getSkinProfile();
      if (response.success && response.data) {
        setFormData(response.data);
        setIsEditing(true);
      }
    } catch (err: any) {
      // Profile doesn't exist yet, user will create new one
      console.log('No existing skin profile found');
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.updateSkinProfile(formData);
      if (response.success) {
        navigate('/profile');
      } else {
        setError('Failed to save skin profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save skin profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayInput = (field: keyof SkinProfile, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleRoutineChange = (period: 'morning' | 'evening', product: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      current_routine: {
        ...prev.current_routine,
        [period]: checked 
          ? [...prev.current_routine[period], product]
          : prev.current_routine[period].filter(p => p !== product)
      }
    }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;
    
    setPhotoUploading(true);
    try {
      const response = await authService.uploadSkinPhoto(selectedPhoto);
      if (response.success) {
        alert('Photo uploaded successfully! AI analysis results will be available in your profile.');
        setSelectedPhoto(null);
        setPhotoPreview(null);
      } else {
        setError('Failed to upload photo');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const skinConcerns = [
    'acne', 'hyperpigmentation', 'dryness', 'oiliness', 'aging', 'sensitivity',
    'dark_spots', 'fine_lines', 'pores', 'redness', 'dullness', 'uneven_texture'
  ];

  const commonAllergies = [
    'fragrance', 'parabens', 'sulfates', 'alcohol', 'retinol', 'salicylic_acid',
    'benzoyl_peroxide', 'lanolin', 'formaldehyde', 'nickel'
  ];

  const routineProducts = [
    'cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'face_oil',
    'exfoliant', 'mask', 'eye_cream', 'spot_treatment'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit' : 'Create'} Skin Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Help us understand your skin to provide personalized recommendations
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

            {/* Basic Skin Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Skin Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skin Type
                  </label>
                  <select
                    name="skin_type"
                    value={formData.skin_type}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select skin type</option>
                    <option value="dry">Dry</option>
                    <option value="oily">Oily</option>
                    <option value="combination">Combination</option>
                    <option value="normal">Normal</option>
                    <option value="sensitive">Sensitive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skin Tone
                  </label>
                  <select
                    name="skin_tone"
                    value={formData.skin_tone}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select skin tone</option>
                    <option value="very_light">Very Light</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="dark">Dark</option>
                    <option value="very_dark">Very Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Undertone
                  </label>
                  <select
                    name="undertone"
                    value={formData.undertone}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select undertone</option>
                    <option value="warm">Warm</option>
                    <option value="cool">Cool</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitzpatrick Phototype (1-6)
                  </label>
                  <select
                    name="fitzpatrick_phototype"
                    value={formData.fitzpatrick_phototype}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value={1}>Type I - Always burns, never tans</option>
                    <option value={2}>Type II - Usually burns, tans minimally</option>
                    <option value={3}>Type III - Sometimes burns, tans gradually</option>
                    <option value={4}>Type IV - Burns minimally, tans easily</option>
                    <option value={5}>Type V - Rarely burns, tans deeply</option>
                    <option value={6}>Type VI - Never burns, deeply pigmented</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skin Sensitivity
                  </label>
                  <select
                    name="skin_sensitivity"
                    value={formData.skin_sensitivity}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select sensitivity level</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Sun Exposure (minutes)
                  </label>
                  <input
                    type="number"
                    name="daily_sun_exposure"
                    value={formData.daily_sun_exposure}
                    onChange={handleInputChange}
                    min="0"
                    max="1440"
                    className="form-input"
                    placeholder="e.g., 120"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sunscreen Usage
                </label>
                <select
                  name="sunscreen_usage"
                  value={formData.sunscreen_usage}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="">Select sunscreen usage</option>
                  <option value="never">Never</option>
                  <option value="rarely">Rarely</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="daily">Daily</option>
                  <option value="multiple_times">Multiple times daily</option>
                </select>
              </div>
            </div>

            {/* Primary Concerns */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Primary Skin Concerns
              </h3>
              <p className="text-sm text-gray-600">Select all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skinConcerns.map((concern) => (
                  <label key={concern} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.primary_concerns.includes(concern)}
                      onChange={(e) => handleArrayInput('primary_concerns', concern, e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="capitalize">
                      {concern.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Known Allergies */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Known Allergies
              </h3>
              <p className="text-sm text-gray-600">Select all ingredients you're allergic to</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {commonAllergies.map((allergy) => (
                  <label key={allergy} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.known_allergies.includes(allergy)}
                      onChange={(e) => handleArrayInput('known_allergies', allergy, e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {allergy.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Current Routine */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Current Skincare Routine
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Morning Routine</h4>
                  <div className="space-y-2">
                    {routineProducts.map((product) => (
                      <label key={`morning-${product}`} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.current_routine.morning.includes(product)}
                          onChange={(e) => handleRoutineChange('morning', product, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {product.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Evening Routine</h4>
                  <div className="space-y-2">
                    {routineProducts.map((product) => (
                      <label key={`evening-${product}`} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.current_routine.evening.includes(product)}
                          onChange={(e) => handleRoutineChange('evening', product, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {product.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Analysis Consent */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="photo_analysis_consent"
                  checked={formData.photo_analysis_consent}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-1"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Photo Analysis Consent
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    I consent to uploading face photos for AI-powered skin analysis to improve product recommendations.
                  </p>
                </div>
              </label>
            </div>

            {/* Photo Upload Section */}
            {formData.photo_analysis_consent && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Upload Face Photo for AI Analysis
                </h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Photo Guidelines:</strong> Please upload a clear, well-lit photo of your face without makeup for the most accurate analysis.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Face Photo
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handlePhotoSelect}
                      className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                  </div>

                  {photoPreview && (
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-4">
                          Photo selected. Click upload to send for AI analysis.
                        </p>
                        <button
                          type="button"
                          onClick={handlePhotoUpload}
                          disabled={photoUploading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {photoUploading ? 'Uploading...' : 'Upload Photo'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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

export default SkinProfileForm; 