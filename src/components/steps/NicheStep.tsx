import { useState } from "react";
import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";

interface NicheStepProps {
  onNext: (data: { niche?: string; targetAudience?: string }) => void;
  onBack: () => void;
}

export const NicheStep = ({ onNext, onBack }: NicheStepProps) => {
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  const handleNext = () => {
    if (niche.trim() && targetAudience.trim()) {
      onNext({
        niche: niche.trim(),
        targetAudience: targetAudience.trim()
      });
    }
  };

  const isValid = niche.trim().length > 0 && targetAudience.trim().length > 0;

  return (
    <OnboardingStep
      title="Define Your Niche & Audience"
      description="Help us understand your specific market and who you're targeting"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Niche Input */}
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <Label htmlFor="niche" className="text-sm sm:text-base font-medium">
            What's your specific niche?
          </Label>
          <Input
            id="niche"
            type="text"
            placeholder="e.g., Organic skincare for sensitive skin, Eco-friendly home products..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="h-11 sm:h-12 text-sm sm:text-base"
            autoFocus
          />
          <p className="text-xs sm:text-sm text-muted-foreground">
            Be as specific as possible for better results
          </p>
        </div>

        {/* Target Audience Input */}
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <Label htmlFor="targetAudience" className="text-sm sm:text-base font-medium">
            Who is your target audience?
          </Label>
          <Input
            id="targetAudience"
            type="text"
            placeholder="e.g., Women aged 25-40, Health-conscious millennials, Small business owners..."
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="h-11 sm:h-12 text-sm sm:text-base"
          />
          <p className="text-xs sm:text-sm text-muted-foreground">
            Describe your ideal customer demographics and interests
          </p>
        </div>

        {/* Example Suggestions */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
            💡 Examples:
          </p>
          <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
            <li>• Niche: "Sustainable fashion for professionals"</li>
            <li>• Audience: "Working women 25-45 who value ethical brands"</li>
          </ul>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4 md:pt-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full sm:flex-1 h-11 sm:h-12"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="w-full sm:flex-1 gradient-primary text-white h-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};
