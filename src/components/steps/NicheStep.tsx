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
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="niche" className="text-base">
            Describe your niche or specialty
          </Label>
          <Textarea
            id="niche"
            placeholder="e.g., Sustainable fashion for young professionals, Organic meal prep services, AI-powered fitness apps..."
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">
            The more specific you are, the better we can tailor your visuals
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!niche.trim()}
            className="flex-1 gradient-primary text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};
