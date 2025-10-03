import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ProfileStepProps {
  onNext: () => void;
  onBack: () => void;
  onboardingData: any;
}

export const ProfileStep = ({ onNext, onBack, onboardingData }: ProfileStepProps) => {
  return (
    <OnboardingStep 
      title="You're All Set!"
      description="Review your preferences and start creating"
    >
      <div className="space-y-6">
        <div className="text-center space-y-4 py-4">
          <div className="w-20 h-20 mx-auto gradient-primary rounded-full flex items-center justify-center shadow-glow">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Profile Created Successfully!</h3>
            <p className="text-muted-foreground">
              We've saved your preferences and you're ready to start generating amazing visuals.
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-6 space-y-4">
          <h4 className="font-semibold mb-3">Your Settings:</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Industry:</span>
              <span className="font-medium">{onboardingData.industry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Style:</span>
              <span className="font-medium capitalize">{onboardingData.style}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tone:</span>
              <span className="font-medium">{onboardingData.tone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Formats:</span>
              <span className="font-medium">{onboardingData.formats?.join(", ")}</span>
            </div>
          </div>
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
            onClick={onNext}
            className="flex-1 gradient-primary text-white font-medium"
          >
            Start Creating
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};
