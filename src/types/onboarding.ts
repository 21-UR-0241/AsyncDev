export interface OnboardingData {
  industry: string;
  niche: string;
  targetAudience: string;
  goals: string[];
  style: string;
  tone: string;
  colorPalette: string;
  formats: string[];
}

export interface PromptData extends OnboardingData {
  category: string;
  agencyType: string;
  instructions: string;
}
