import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { HealthProfile } from '../../types';
import { logger } from '../../utils/logger';

const HealthProfileForm: React.FC = () => {
  const [formData, setFormData] = useState<HealthProfile>({
    skin_conditions: [],
    hair_scalp_disorders: [],
    systemic_allergies: [],
    photosensitivity: false,
    current_medications: {
      skincare: [],
      oral: []
    },
    hormonal_status: '',
    menstrual_cycle_regularity: '',
    chronic_conditions: [],
    family_history_skin: [],
    family_history_hair: [],
    mental_health_status: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchHealthProfile();
  }, []);

  const fetchHealthProfile = async () => {
    try {
      const response = await authService.getHealthProfile();
      if (response.success && response.data) {
        setFormData(response.data);
        setIsEditing(true);
      }
    } catch (err: any) {
              logger.debug('No existing health profile found');
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.updateHealthProfile(formData);
      if (response.success) {
        navigate('/profile');
      } else {
        setError('Failed to save health profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save health profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name === 'photosensitivity') {
        setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayInput = (field: keyof HealthProfile, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleMedicationChange = (type: 'skincare' | 'oral', medication: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      current_medications: {
        ...prev.current_medications,
        [type]: checked 
          ? [...prev.current_medications[type], medication]
          : prev.current_medications[type].filter(m => m !== medication)
      }
    }));
  };

  const skinConditions = [
    'eczema', 'rosacea', 'psoriasis', 'dermatitis', 'melasma',
    'vitiligo', 'acne_scarring', 'keratosis_pilaris', 'seborrheic_dermatitis'
  ];

  const hairScalpDisorders = [
    'seborrheic_dermatitis', 'alopecia_areata', 'androgenetic_alopecia',
    'telogen_effluvium', 'trichotillomania', 'scalp_psoriasis'
  ];

  const systemicAllergies = [
    'nuts', 'shellfish', 'eggs', 'dairy', 'soy', 'wheat',
    'latex', 'pollen', 'dust_mites', 'pet_dander'
  ];

  const chronicConditions = [
    'diabetes', 'thyroid_disorder', 'autoimmune_disorder', 'hypertension',
    'heart_disease', 'kidney_disease', 'liver_disease', 'pcos'
  ];

  const skincareMedications = [
    'retinoid', 'vitamin_c', 'niacinamide', 'salicylic_acid',
    'benzoyl_peroxide', 'hydroquinone', 'tretinoin', 'azelaic_acid'
  ];

  const oralMedications = [
    'multivitamin', 'vitamin_d', 'omega_3', 'biotin',
    'collagen', 'iron', 'b_complex', 'zinc'
  ];

  const familyHistorySkin = [
    'melasma', 'psoriasis', 'eczema', 'skin_cancer',
    'premature_aging', 'hyperpigmentation'
  ];

  const familyHistoryHair = [
    'male_pattern_baldness', 'female_pattern_baldness', 'early_graying',
    'alopecia', 'thin_hair'
  ];

  // Helper function to get user-friendly labels
  const getFriendlyLabel = (value: string): string => {
    const labels: { [key: string]: string } = {
      // Skin conditions
      'eczema': 'Eczema (dry, itchy skin)',
      'rosacea': 'Rosacea (facial redness)',
      'psoriasis': 'Psoriasis (thick, scaly patches)',
      'dermatitis': 'Dermatitis (skin irritation)',
      'melasma': 'Dark spots (melasma)',
      'vitiligo': 'White patches (vitiligo)',
      'acne_scarring': 'Acne scars',
      'keratosis_pilaris': 'Bumpy skin texture',
      'seborrheic_dermatitis': 'Flaky, oily skin patches',
      
      // Hair/scalp
      'alopecia_areata': 'Patchy hair loss',
      'androgenetic_alopecia': 'Pattern baldness',
      'telogen_effluvium': 'Thinning hair',
      'trichotillomania': 'Hair pulling habit',
      'scalp_psoriasis': 'Scaly scalp',
      
      // Allergies
      'nuts': 'Tree nuts',
      'shellfish': 'Shellfish',
      'eggs': 'Eggs',
      'dairy': 'Dairy products',
      'soy': 'Soy products',
      'wheat': 'Wheat/gluten',
      'latex': 'Latex',
      'pollen': 'Pollen (hay fever)',
      'dust_mites': 'Dust mites',
      'pet_dander': 'Pet allergies',
      
      // Chronic conditions
      'diabetes': 'Diabetes',
      'thyroid_disorder': 'Thyroid issues',
      'autoimmune_disorder': 'Autoimmune condition',
      'hypertension': 'High blood pressure',
      'heart_disease': 'Heart condition',
      'kidney_disease': 'Kidney problems',
      'liver_disease': 'Liver problems',
      'pcos': 'PCOS',
      
      // Medications
      'retinoid': 'Retinol/Tretinoin',
      'vitamin_c': 'Vitamin C serum',
      'niacinamide': 'Niacinamide',
      'salicylic_acid': 'Salicylic acid',
      'benzoyl_peroxide': 'Benzoyl peroxide',
      'hydroquinone': 'Hydroquinone',
      'tretinoin': 'Tretinoin (prescription)',
      'azelaic_acid': 'Azelaic acid',
      'multivitamin': 'Multivitamin',
      'vitamin_d': 'Vitamin D',
      'omega_3': 'Omega-3/Fish oil',
      'biotin': 'Biotin',
      'collagen': 'Collagen supplement',
      'iron': 'Iron supplement',
      'b_complex': 'B-Complex vitamins',
      'zinc': 'Zinc supplement',
      
      // Family history
      'skin_cancer': 'Skin cancer',
      'premature_aging': 'Early aging/wrinkles',
      'hyperpigmentation': 'Dark spots',
      'male_pattern_baldness': 'Male pattern baldness',
      'female_pattern_baldness': 'Female pattern baldness',
      'early_graying': 'Early gray hair',
      'alopecia': 'Hair loss',
      'thin_hair': 'Thin/fine hair'
    };
    
    return labels[value] || value.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Update' : 'Tell Us About'} Your Health
              </h1>
              <p className="text-gray-600 mt-1">
                Help us give you safe, personalized skincare recommendations
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

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Your privacy matters:</strong> All health information is kept private and secure. We only use it to give you better, safer skincare recommendations. We never share your information with anyone else.
                  </p>
                </div>
              </div>
            </div>

            {/* Skin Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Skin Concerns
              </h3>
              <p className="text-sm text-gray-600">Do you have any of these skin concerns? (Select all that apply)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skinConditions.map((condition) => (
                  <label key={condition} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.skin_conditions.includes(condition)}
                      onChange={(e) => handleArrayInput('skin_conditions', condition, e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {getFriendlyLabel(condition)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hair & Scalp Disorders */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Hair & Scalp Issues
              </h3>
              <p className="text-sm text-gray-600">Any hair or scalp concerns? (Select all that apply)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hairScalpDisorders.map((disorder) => (
                  <label key={disorder} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.hair_scalp_disorders.includes(disorder)}
                      onChange={(e) => handleArrayInput('hair_scalp_disorders', disorder, e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {getFriendlyLabel(disorder)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Systemic Allergies */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Allergies
              </h3>
              <p className="text-sm text-gray-600">Do you have any known allergies? (Select all that apply)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {systemicAllergies.map((allergy) => (
                  <label key={allergy} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.systemic_allergies.includes(allergy)}
                      onChange={(e) => handleArrayInput('systemic_allergies', allergy, e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {getFriendlyLabel(allergy)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Health Status */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                General Health
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="photosensitivity"
                    name="photosensitivity"
                    checked={formData.photosensitivity}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <label htmlFor="photosensitivity" className="text-sm font-medium text-gray-700">
                    I'm sensitive to sunlight
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How are your hormones?
                  </label>
                  <select
                    name="hormonal_status"
                    value={formData.hormonal_status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Choose one</option>
                    <option value="normal">Everything's normal</option>
                    <option value="imbalanced">I think I have hormonal issues</option>
                    <option value="menopause">I'm in menopause</option>
                    <option value="perimenopause">I'm approaching menopause</option>
                    <option value="pregnancy">I'm pregnant</option>
                    <option value="postpartum">I recently had a baby</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is your period regular?
                  </label>
                  <select
                    name="menstrual_cycle_regularity"
                    value={formData.menstrual_cycle_regularity}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Choose one</option>
                    <option value="regular">Yes, it's regular</option>
                    <option value="irregular">No, it's irregular</option>
                    <option value="not_applicable">Not applicable to me</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How is your stress level?
                  </label>
                  <select
                    name="mental_health_status"
                    value={formData.mental_health_status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Choose one</option>
                    <option value="stable">Low stress, feeling good</option>
                    <option value="mild_stress">A little stressed</option>
                    <option value="moderate_stress">Moderately stressed</option>
                    <option value="high_stress">Very stressed</option>
                    <option value="under_treatment">Getting help for stress/mental health</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Health Conditions
              </h3>
              <p className="text-sm text-gray-600">Do you have any of these health conditions? (Select all that apply)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {chronicConditions.map((condition) => (
                  <label key={condition} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.chronic_conditions.includes(condition)}
                      onChange={(e) => handleArrayInput('chronic_conditions', condition, e.target.checked)}
                      className="form-checkbox"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {getFriendlyLabel(condition)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                What You're Currently Using
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Skincare Products</h4>
                  <div className="space-y-2">
                    {skincareMedications.map((medication) => (
                      <label key={medication} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.current_medications.skincare.includes(medication)}
                          onChange={(e) => handleMedicationChange('skincare', medication, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {getFriendlyLabel(medication)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Vitamins & Supplements</h4>
                  <div className="space-y-2">
                    {oralMedications.map((medication) => (
                      <label key={medication} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.current_medications.oral.includes(medication)}
                          onChange={(e) => handleMedicationChange('oral', medication, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {getFriendlyLabel(medication)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Family History */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Family History
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Skin Issues in Your Family</h4>
                  <div className="space-y-2">
                    {familyHistorySkin.map((condition) => (
                      <label key={condition} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.family_history_skin.includes(condition)}
                          onChange={(e) => handleArrayInput('family_history_skin', condition, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {getFriendlyLabel(condition)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Hair Issues in Your Family</h4>
                  <div className="space-y-2">
                    {familyHistoryHair.map((condition) => (
                      <label key={condition} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.family_history_hair.includes(condition)}
                          onChange={(e) => handleArrayInput('family_history_hair', condition, e.target.checked)}
                          className="form-checkbox"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {getFriendlyLabel(condition)}
                        </span>
                      </label>
                    ))}
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
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg hover:from-blue-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

export default HealthProfileForm; 