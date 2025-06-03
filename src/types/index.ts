export interface Ingredient {
  name: string;
  inci_name?: string;
  position: number;
  benefits?: string;
  concerns: string[];
  safety: string;
}

export interface ProductPrice {
  mrp: number;
  sale: number;
  currency: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductBenefit {
  benefit: string;
  category: string;
  confidence: string;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  price: ProductPrice;
  rating: ProductRating;
  images: string[];
  description: string;
  ingredients: Ingredient[];
  benefits: ProductBenefit[] | { count: number; raw_text: string; benefits_list: string[] };
  sourceUrl: string;
  size: string;
  matchReason: string;
}

export interface ParsedQuery {
  intent: string;
  concern: string;
  ingredient?: string;
  product_type?: string;
  skin_type?: string;
  price_sensitivity?: string;
  brand?: string;
  user_segment: string;
}

export interface SearchResponse {
  success: boolean;
  data: {
    query: string;
    parsedQuery: ParsedQuery;
    products: Product[];
    ingredients: Ingredient[];
    totalFound: number;
    message: string;
    searchMethod: string;
  };
  meta: {
    processingTime: string;
    timestamp: string;
  };
}

export interface VideoMention {
  segmentId: number;
  startTime: number;
  endTime: number;
  text: string;
  sentiment: string;
  claimType: string;
  claimText: string;
  confidence: number;
}

export interface Video {
  videoId: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  thumbnail: string;
  videoUrl: string;
  mentions: VideoMention[];
}

export interface ProductVideoResponse {
  success: boolean;
  data: {
    productId: string;
    videoCount: number;
    creatorCount: number;
    creators: string[];
    videos: Video[];
  };
  meta: {
    timestamp: string;
    totalMentions: number;
  };
}

export interface ComparisonAttribute {
  attribute: string;
  products: { [productId: string]: string | number };
}

export interface UniqueIngredients {
  productId: string;
  uniqueIngredients: string[];
}

export interface ComparisonData {
  priceRange: {
    lowest: number;
    highest: number;
  };
  ratingRange: {
    lowest: number;
    highest: number;
  };
  commonIngredients: string[];
  uniqueIngredients: UniqueIngredients[];
  brands: string[];
}

export interface CompareResponse {
  success: boolean;
  data: {
    products: Product[];
    comparison: ComparisonData;
    message: string;
  };
  meta: {
    timestamp: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  searchResults?: SearchResponse['data'];
}

export interface AppState {
  currentQuery: string;
  isLoading: boolean;
  messages: ChatMessage[];
  currentProducts: Product[];
  compareMode: boolean;
  selectedProduct?: Product;
  showProductDetail: boolean;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  created_at: string;
  profile_completed?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    expires_at: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
}

// Profile Types
export interface SkinProfile {
  skin_type: string;
  skin_tone: string;
  undertone: string;
  fitzpatrick_phototype: number;
  primary_concerns: string[];
  known_allergies: string[];
  skin_sensitivity: string;
  daily_sun_exposure: number;
  sunscreen_usage: string;
  current_routine: {
    morning: string[];
    evening: string[];
  };
  photo_analysis_consent: boolean;
}

export interface HairProfile {
  hair_pattern: string;
  hair_texture: string;
  hair_thickness: string;
  hair_density: string;
  scalp_type: string;
  scalp_concerns: string[];
  hair_porosity: string;
  hair_concerns: string[];
  chemical_treatments: {
    coloring: string;
    last_treatment_date?: string;
  };
  heat_styling_frequency: string;
  current_hair_routine: {
    shampoo_frequency: string;
    conditioning: string;
    oils_used: string[];
  };
  wash_frequency: number;
}

export interface LifestyleProfile {
  location_city: string;
  location_state: string;
  climate_type: string;
  pollution_level: string;
  uv_exposure_level: string;
  water_quality: string;
  diet_type: string;
  hydration_level: string;
  dietary_preferences: {
    spicy_food: boolean;
    processed_food: string;
  };
  sleep_hours: number;
  sleep_quality: string;
  stress_level: string;
  exercise_frequency: string;
  smoking_status: string;
  alcohol_consumption: string;
  work_environment: string;
  screen_time_hours: number;
  ac_exposure_hours: number;
}

export interface HealthProfile {
  skin_conditions: string[];
  hair_scalp_disorders: string[];
  systemic_allergies: string[];
  photosensitivity: boolean;
  current_medications: {
    skincare: string[];
    oral: string[];
  };
  hormonal_status: string;
  menstrual_cycle_regularity?: string;
  chronic_conditions: string[];
  family_history_skin: string[];
  family_history_hair: string[];
  mental_health_status: string;
}

export interface MakeupProfile {
  foundation_shade: string;
  foundation_undertone: string;
  foundation_finish: string;
  coverage_preference: string;
  makeup_frequency: string;
  makeup_style: string;
  preferred_lip_colors: string[];
  preferred_eye_colors: string[];
  preferred_blush_colors: string[];
  product_finish_preferences: {
    eyeshadow: string;
    lipstick: string;
  };
  brand_preferences: string[];
  price_range_preference: string;
  makeup_allergies: string[];
  sensitive_eyes: boolean;
  contact_lenses: boolean;
}

export interface CompleteProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_completed: boolean;
  skin_profiles?: SkinProfile;
  hair_profiles?: HairProfile;
  lifestyle_demographics?: LifestyleProfile;
  health_medical_conditions?: HealthProfile;
  makeup_preferences?: MakeupProfile;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
} 