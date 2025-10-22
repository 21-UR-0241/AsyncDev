import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface IndustryStepProps {
  onNext: (data: { industry: string }) => void;
  onBack: () => void;
  onSkip?: () => void;
}

const industries = [
  "E-commerce", "Fashion & Apparel", "Food & Beverage", "Technology",
  "Healthcare", "Real Estate", "Education", "Fitness & Wellness",
  "Beauty & Cosmetics", "Travel & Hospitality", "Finance", "Other"
];

export const IndustryStep = ({ onNext, onBack, onSkip }: IndustryStepProps) => {
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");

  const handleNext = () => {
    const industry = selectedIndustry === "Other" ? customIndustry : selectedIndustry;
    if (industry) {
      onNext({ industry });
    }
  };

  return (
    <OnboardingStep 
      title="What's Your Industry?"
      description="Help us understand your business better"
    >
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Industry Selection Grid */}
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <Label className="text-sm sm:text-base font-medium">Select your industry</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left min-h-[56px] sm:min-h-[64px] md:min-h-[70px] flex items-center justify-center text-center ${
                  selectedIndustry === industry
                    ? "border-primary bg-primary/5 shadow-soft scale-[0.98]"
                    : "border-border hover:border-primary/50 hover:bg-muted/50 active:scale-[0.98]"
                }`}
              >
                <span className="font-medium text-xs sm:text-sm leading-tight break-words w-full px-1">
                  {industry}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Industry Input - Animated Entry */}
        {selectedIndustry === "Other" && (
          <div className="space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="custom-industry" className="text-sm sm:text-base font-medium">
              Specify your industry
            </Label>
            <Input
              id="custom-industry"
              placeholder="Enter your industry..."
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
              className="h-11 sm:h-12 text-sm sm:text-base"
              autoFocus
            />
            <p className="text-xs sm:text-sm text-muted-foreground">
              Be as specific as possible for better results
            </p>
          </div>
        )}

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
            disabled={!selectedIndustry || (selectedIndustry === "Other" && !customIndustry.trim())}
            className="w-full sm:flex-1 gradient-primary text-white h-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            Continue
          </Button>
        </div>

        {/* Skip Button */}
        {onSkip && (
          <div className="pt-2">
            <Button
              onClick={onSkip}
              variant="ghost"
              className="w-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              Skip to Prompt
            </Button>
          </div>
        )}
      </div>
    </OnboardingStep>
  );
};