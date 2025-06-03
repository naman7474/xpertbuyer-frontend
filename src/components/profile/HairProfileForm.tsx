import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { HairProfile } from '../../types';
import { logger } from '../../utils/logger';

const HairProfileForm: React.FC = () => {
  const [formData, setFormData] = useState<HairProfile>({
    hair_pattern: '',
    hair_texture: '',
    hair_thickness: '',
    hair_density: '',
    scalp_type: '',
    scalp_concerns: [],
    hair_porosity: '',
    hair_concerns: [],
    chemical_treatments: {
      coloring: '',
      last_treatment_date: ''
    },
    heat_styling_frequency: '',
    current_hair_routine: {
      shampoo_frequency: '',
      conditioning: '',
      oils_used: []
    },
    wash_frequency: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchHairProfile();
  }, []);

  const fetchHairProfile = async () => {
    try {
      const response = await authService.getHairProfile();
      if (response.success && response.data) {
        setFormData(response.data);
        setIsEditing(true);
      }
    } catch (err: any) {
              logger.debug('No existing hair profile found');
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.updateHairProfile(formData);
      if (response.success) {
        navigate('/profile');
      } else {
        setError('Failed to save hair profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save hair profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else if (name.includes('.')) {
      // Handle nested objects like chemical_treatments.coloring
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof HairProfile] as any),
          [child]: value
        }
      }));
    } else if (name.startsWith('routine_')) {
      // Handle current_hair_routine fields
      const field = name.replace('routine_', '');
      setFormData(prev => ({
        ...prev,
        current_hair_routine: {
          ...prev.current_hair_routine,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayInput = (field: keyof HairProfile, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleOilsChange = (oil: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      current_hair_routine: {
        ...prev.current_hair_routine,
        oils_used: checked 
          ? [...prev.current_hair_routine.oils_used, oil]
          : prev.current_hair_routine.oils_used.filter(o => o !== oil)
      }
    }));
  };

  const scalpConcerns = [
    'dandruff', 'dryness', 'oiliness', 'itchiness', 'sensitivity',
    'hair_loss', 'thinning', 'buildup', 'flakiness'
  ];

  const hairConcerns = [
    'frizz', 'dryness', 'damage', 'breakage', 'split_ends',
    'lack_of_volume', 'color_fading', 'tangles', 'dullness'
  ];

  const commonOils = [
    'coconut', 'argan', 'jojoba', 'castor', 'olive',
    'rosemary', 'tea_tree', 'almond', 'avocado'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit' : 'Create'} Hair Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Help us understand your hair to provide personalized recommendations
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

            {/* Basic Hair Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Hair Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hair Pattern
                  </label>
                  <select
                    name="hair_pattern"
                    value={formData.hair_pattern}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select hair pattern</option>
                    <option value="straight">Straight</option>
                    <option value="wavy">Wavy</option>
                    <option value="curly">Curly</option>
                    <option value="coily">Coily</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hair Texture
                  </label>
                  <select
                    name="hair_texture"
                    value={formData.hair_texture}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select hair texture</option>
                    <option value="fine">Fine</option>
                    <option value="medium">Medium</option>
                    <option value="coarse">Coarse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hair Thickness
                  </label>
                  <select
                    name="hair_thickness"
                    value={formData.hair_thickness}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select hair thickness</option>
                    <option value="thin">Thin</option>
                    <option value="medium">Medium</option>
                    <option value="thick">Thick</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hair Density
                  </label>
                  <select
                    name="hair_density"
                    value={formData.hair_density}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select hair density</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scalp Type
                  </label>
                  <select
                    name="scalp_type"
                    value={formData.scalp_type}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select scalp type</option>
                    <option value="normal">Normal</option>
                    <option value="dry">Dry</option>
                    <option value="oily">Oily</option>
                    <option value="sensitive">Sensitive</option>
                    <option value="combination">Combination</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hair Porosity
                  </label>
                  <select
                    name="hair_porosity"
                    value={formData.hair_porosity}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select hair porosity</option>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heat Styling Frequency
                  </label>
                  <select
                    name="heat_styling_frequency"
                    value={formData.heat_styling_frequency}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select frequency</option>
                    <option value="never">Never</option>
                    <option value="rarely">Rarely</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wash Frequency (times per week)
                  </label>
                  <input
                    type="number"
                    name="wash_frequency"
                    value={formData.wash_frequency}
                    onChange={handleInputChange}
                    min="1"
                    max="7"
                    className="form-input"
                    placeholder="e.g., 3"
                  />
                </div>
              </div>
            </div>

            {/* Scalp Concerns */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Scalp Concerns
              </h3>
              <p className="text-sm text-gray-600">Select all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {scalpConcerns.map((concern) => (
                  <label key={concern} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.scalp_concerns.includes(concern)}
                      onChange={(e) => handleArrayInput('scalp_concerns', concern, e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {concern.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hair Concerns */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Hair Concerns
              </h3>
              <p className="text-sm text-gray-600">Select all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hairConcerns.map((concern) => (
                  <label key={concern} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.hair_concerns.includes(concern)}
                      onChange={(e) => handleArrayInput('hair_concerns', concern, e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {concern.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chemical Treatments */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Chemical Treatments
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hair Coloring
                  </label>
                  <select
                    name="chemical_treatments.coloring"
                    value={formData.chemical_treatments.coloring}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {formData.chemical_treatments.coloring === 'yes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Treatment Date
                    </label>
                    <input
                      type="date"
                      name="chemical_treatments.last_treatment_date"
                      value={formData.chemical_treatments.last_treatment_date || ''}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Current Hair Routine */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Current Hair Routine
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shampoo Frequency
                  </label>
                  <select
                    name="routine_shampoo_frequency"
                    value={formData.current_hair_routine.shampoo_frequency}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="every_other_day">Every other day</option>
                    <option value="3_times_week">3 times a week</option>
                    <option value="twice_week">Twice a week</option>
                    <option value="once_week">Once a week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conditioning
                  </label>
                  <select
                    name="routine_conditioning"
                    value={formData.current_hair_routine.conditioning}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select option</option>
                    <option value="every_wash">Every wash</option>
                    <option value="alternate_washes">Alternate washes</option>
                    <option value="weekly">Weekly deep conditioning</option>
                    <option value="rarely">Rarely</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Oils Used</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {commonOils.map((oil) => (
                    <label key={oil} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.current_hair_routine.oils_used.includes(oil)}
                        onChange={(e) => handleOilsChange(oil, e.target.checked)}
                        className="form-checkbox"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {oil.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
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

export default HairProfileForm; 