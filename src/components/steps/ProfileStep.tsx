import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Briefcase, Palette, MessageSquare, Maximize, Target, Users } from "lucide-react";
import { OnboardingData } from "@/types/onboarding";

interface ProfileStepProps {
  onNext: () => void;
  onBack: () => void;
  onboardingData: Partial<OnboardingData>;
}

export const ProfileStep = ({ onNext, onBack, onboardingData }: ProfileStepProps) => {
  // Helper function to get descriptions based on selections
  const getStyleDescription = (style?: string) => {
    const descriptions: Record<string, string> = {
      "minimal": "Clean, simple designs with plenty of whitespace and focus on essential elements",
      "bold": "Vibrant colors, strong typography, and attention-grabbing visual elements",
      "professional": "Corporate-friendly designs with sophisticated color palettes and layouts",
      "playful": "Fun, energetic designs with creative elements and bright colors",
      "elegant": "Refined, luxury-focused designs with premium aesthetics",
      "modern": "Contemporary designs following current design trends and styles",
    };
    return descriptions[style?.toLowerCase() || ""] || "Custom styling tailored to your brand";
  };

  const getToneDescription = (tone?: string) => {
    const descriptions: Record<string, string> = {
      "friendly": "Warm, approachable messaging that builds connection with your audience",
      "professional": "Formal, business-focused communication that establishes authority",
      "casual": "Relaxed, conversational tone that feels natural and authentic",
      "inspiring": "Motivational messaging that energizes and uplifts your audience",
      "urgent": "Time-sensitive communication that drives immediate action",
    };
    return descriptions[tone?.toLowerCase() || ""] || "Messaging tone aligned with your brand voice";
  };

  const getGoalDescription = (goal?: string) => {
    const descriptions: Record<string, string> = {
      "Brand Awareness": "Visuals designed to increase visibility and recognition",
      "Lead Generation": "Images optimized to capture contact information and drive sign-ups",
      "Drive Sales": "Sales-focused visuals with clear product presentation and CTAs",
      "Social Engagement": "Shareable content that encourages likes, comments, and interactions",
      "Customer Education": "Informative visuals that explain features and benefits",
      "Product Launch": "Announcement-style images that generate excitement and anticipation",
    };
    return descriptions[goal || ""] || "Marketing visuals aligned with your objectives";
  };

  return (
    <OnboardingStep 
      title="You're All Set!" 
      description="Review your preferences and start creating amazing visuals"
    >
      <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
        {/* Success Animation Section */}
        <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold px-4 sm:px-0 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Profile Created Successfully!
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-2 sm:px-0">
              Your AI is now customized to generate visuals perfectly tailored to your brand and goals.
            </p>
          </div>
        </div>

        {/* What You'll Get Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-base sm:text-lg mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            What You'll Get:
          </h4>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {getGoalDescription(onboardingData.goals?.[0])}
          </p>
        </div>

        {/* Detailed Settings Summary */}
        <div className="space-y-4">
          <h4 className="font-semibold text-base sm:text-lg">Your Customization:</h4>
          
          <div className="space-y-3">
            {/* Industry */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Industry</span>
                    <span className="text-sm font-semibold">{onboardingData.industry || "Not specified"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Visuals optimized for {onboardingData.industry || "your"} industry standards and audience
                  </p>
                </div>
              </div>
            </div>

            {/* Niche & Target Audience */}
            {(onboardingData.niche || onboardingData.targetAudience) && (
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Target Market</span>
                      <span className="text-sm font-semibold">{onboardingData.niche || "Not specified"}</span>
                    </div>
                    {onboardingData.targetAudience && (
                      <p className="text-xs text-muted-foreground">
                        Targeting: {onboardingData.targetAudience}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Visual Style */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10">
                  <Palette className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Visual Style</span>
                    <span className="text-sm font-semibold capitalize">{onboardingData.style || "Not specified"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getStyleDescription(onboardingData.style)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tone */}
            {onboardingData.tone && (
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <MessageSquare className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Tone</span>
                      <span className="text-sm font-semibold capitalize">{onboardingData.tone}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getToneDescription(onboardingData.tone)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Format */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Maximize className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Format</span>
                    <span className="text-sm font-semibold">
                      {onboardingData.formats?.[0] || "Not specified"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Images optimized for your selected platform dimensions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">Pro Tip</p>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                You can always edit these settings later or create custom prompts for specific campaigns.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:pt-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full sm:flex-1 h-12 sm:h-auto"
          >
            Back to Edit
          </Button>
          <Button
            onClick={onNext}
            className="w-full sm:flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium h-12 sm:h-auto hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-[0.98]"
          >
            Start Creating ✨
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};