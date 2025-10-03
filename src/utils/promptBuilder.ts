import { OnboardingData, PromptData } from "@/types/onboarding";

export const buildPrompt = (data: OnboardingData): PromptData => {
  const goalDescriptions = data.goals.map(goal => {
    const goalMap: Record<string, string> = {
      "brand-awareness": "increase brand visibility and recognition",
      "product-promotion": "showcase products in an appealing way",
      "engagement": "drive social media interactions",
      "conversions": "encourage purchases and signups",
      "education": "inform and educate the audience",
      "announcements": "communicate news and updates",
    };
    return goalMap[goal] || goal;
  }).join(", ");

  const instructions = `Create a professional marketing image for a ${data.industry} business specializing in ${data.niche}. 
The image should have a ${data.style} visual style with a ${data.tone.toLowerCase()} tone. 
Primary brand color: ${data.colorPalette}.
The purpose is to ${goalDescriptions}.
Make it eye-catching, professional, and suitable for social media marketing.`;

  return {
    ...data,
    category: "marketing",
    agencyType: "digital-marketing",
    instructions,
  };
};

export const formatPromptForAI = (promptData: PromptData): string => {
  return promptData.instructions;
};
