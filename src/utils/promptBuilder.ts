import { OnboardingData } from "@/types/onboarding";

export interface PromptData {
  industry: string;
  niche: string;
  targetAudience: string;
  goals: string[];
  style: string;
  tone: string;
  colorPalette: string;
  formats: string[];
}

export function buildPrompt(data: OnboardingData): PromptData {
  return {
    industry: data.industry || "General",
    niche: data.niche || "Not specified",
    targetAudience: data.targetAudience || "General audience",
    goals: data.goals || ["Brand awareness"],
    style: data.style || "Modern",
    tone: data.tone || "Professional",
    colorPalette: data.colorPalette || "#6366F1",
    formats: data.formats || ["Square"],
  };
}

export function formatPromptForAI(promptData: PromptData): string {
  const parts = [
    `Create a professional marketing image for the ${promptData.industry} industry`,
    `focused on ${promptData.niche}`,
    `targeting ${promptData.targetAudience}`,
    `to achieve ${promptData.goals.join(", ")}`,
    `in a ${promptData.style} style with ${promptData.tone} tone`,
    `using ${promptData.colorPalette} as primary color`,
    `optimized for ${promptData.formats.join(", ")} format(s)`,
  ];

  return parts.join(", ") + ".";
}
