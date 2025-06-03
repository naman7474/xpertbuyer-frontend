import { User, CompleteProfile } from '../types';

export const getProfileCompletion = (profile: CompleteProfile | null): number => {
  if (!profile) return 0;
  
  let completedSections = 0;
  const totalSections = 5; // Skin + Hair + Lifestyle + Health + Makeup
  
  if (profile.skin_profiles) completedSections++;
  if (profile.hair_profiles) completedSections++;
  if (profile.lifestyle_demographics) completedSections++;
  if (profile.health_medical_conditions) completedSections++;
  if (profile.makeup_preferences) completedSections++;
  
  return Math.round((completedSections / totalSections) * 100);
};

export const isProfileComplete = (user: User | null, profileCompletion: number = 0): boolean => {
  return user?.profile_completed === true || profileCompletion === 100;
};

export const shouldShowProfilePrompt = (user: User | null, profileCompletion: number = 0): boolean => {
  return !user || !isProfileComplete(user, profileCompletion);
};

export const getProfilePromptMessage = (user: User | null): string => {
  if (!user) {
    return "Sign in and complete your profile for the most accurate personalized skincare recommendations tailored to your unique needs!";
  }
  return "Complete your profile to get personalized recommendations based on your skin type, concerns, and lifestyle!";
};

export const getSearchProfilePromptMessage = (user: User | null): string => {
  if (!user) {
    return "For the most accurate results, please sign in and complete your profile first.";
  }
  return "Complete your profile to get more accurate, personalized results.";
}; 