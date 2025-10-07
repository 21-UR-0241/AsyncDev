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
      <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
        {/* Success Animation Section */}
        <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold px-4 sm:px-0">
              Profile Created Successfully!
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-2 sm:px-0">
              We've saved your preferences and you're ready to start generating amazing visuals.
            </p>
          </div>
        </div>

        {/* Settings Summary Card */}
        <div className="bg-muted/50 rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
          <h4 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Your Settings:</h4>
          <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 pb-3 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Industry:</span>
              <span className="font-semibold sm:text-right break-words">
                {onboardingData.industry || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 pb-3 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Style:</span>
              <span className="font-semibold capitalize sm:text-right">
                {onboardingData.style || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 pb-3 border-b border-border/50">
              <span className="text-muted-foreground font-medium">Tone:</span>
              <span className="font-semibold sm:text-right">
                {onboardingData.tone || "Not specified"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
              <span className="text-muted-foreground font-medium">Formats:</span>
              <span className="font-semibold sm:text-right break-words">
                {onboardingData.formats?.join(", ") || "Not specified"}
              </span>
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
            Back
          </Button>
          <Button
            onClick={onNext}
            className="w-full sm:flex-1 gradient-primary text-white font-medium h-12 sm:h-auto hover:shadow-glow transition-all active:scale-[0.98]"
          >
            Start Creating
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};