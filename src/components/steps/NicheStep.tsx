import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface NicheStepProps {
  onNext: (data: { niche: string }) => void;
  onBack: () => void;
}

export const NicheStep = ({ onNext, onBack }: NicheStepProps) => {
  const [niche, setNiche] = useState("");

  const handleNext = () => {
    if (niche.trim()) {
      onNext({ niche: niche.trim() });
    }
  };

  return (
    <OnboardingStep 
      title="What's Your Niche?"
      description="Tell us about your specific products or services"
    >
      <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
        {/* Niche Input Section */}
        <div className="space-y-3 sm:space-y-4">
          <Label htmlFor="niche" className="text-sm sm:text-base font-medium">
            Describe your niche or specialty
          </Label>
          <Textarea
            id="niche"
            placeholder="e.g., Sustainable fashion for young professionals, Organic meal prep services, AI-powered fitness apps..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            rows={5}
            className="resize-none text-sm sm:text-base min-h-[120px] sm:min-h-[140px] rounded-lg sm:rounded-xl p-3 sm:p-4 focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3 sm:p-4">
            <span className="text-lg sm:text-xl">💡</span>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              The more specific you are, the better we can tailor your visuals. Include details about your target audience and what makes your offering unique.
            </p>
          </div>
        </div>

        {/* Character Count (Optional Enhancement) */}
        <div className="text-right">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {niche.length} characters
          </span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:pt-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full sm:flex-1 h-12 sm:h-auto"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!niche.trim()}
            className="w-full sm:flex-1 gradient-primary text-white h-12 sm:h-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};