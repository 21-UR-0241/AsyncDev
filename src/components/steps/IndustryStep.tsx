import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface IndustryStepProps {
  onNext: (data: { industry: string }) => void;
  onBack: () => void;
}

const industries = [
  "E-commerce", "Fashion & Apparel", "Food & Beverage", "Technology",
  "Healthcare", "Real Estate", "Education", "Fitness & Wellness",
  "Beauty & Cosmetics", "Travel & Hospitality", "Finance", "Other"
];

export const IndustryStep = ({ onNext, onBack }: IndustryStepProps) => {
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
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base">Select your industry</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`p-4 rounded-xl border-2 transition-smooth text-left ${
                  selectedIndustry === industry
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <span className="font-medium">{industry}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedIndustry === "Other" && (
          <div className="space-y-2">
            <Label htmlFor="custom-industry">Specify your industry</Label>
            <Input
              id="custom-industry"
              placeholder="Enter your industry"
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
            />
          </div>
        )}

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
            disabled={!selectedIndustry || (selectedIndustry === "Other" && !customIndustry)}
            className="flex-1 gradient-primary text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};
