import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface GoalStepProps {
  onNext: (data: { goals: string[] }) => void;
  onBack: () => void;
}

const goalOptions = [
  { id: "brand-awareness", label: "Brand Awareness", description: "Get your brand noticed" },
  { id: "product-promotion", label: "Product Promotion", description: "Showcase specific products" },
  { id: "engagement", label: "Social Engagement", description: "Increase likes and shares" },
  { id: "conversions", label: "Drive Conversions", description: "Boost sales and signups" },
  { id: "education", label: "Education", description: "Inform your audience" },
  { id: "announcements", label: "Announcements", description: "Share news and updates" },
];

export const GoalStep = ({ onNext, onBack }: GoalStepProps) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleNext = () => {
    if (selectedGoals.length > 0) {
      onNext({ goals: selectedGoals });
    }
  };

  return (
    <OnboardingStep 
      title="What's Your Marketing Goal?"
      description="Select all that apply"
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <Label className="text-sm sm:text-base">Choose your objectives</Label>
          <div className="space-y-2 sm:space-y-3">
            {goalOptions.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-smooth cursor-pointer ${
                  selectedGoals.includes(goal.id)
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <Checkbox
                    checked={selectedGoals.includes(goal.id)}
                    className="mt-0.5 sm:mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base mb-0.5 sm:mb-1">
                      {goal.label}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {goal.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="w-full sm:flex-1 order-2 sm:order-1"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedGoals.length === 0}
            className="w-full sm:flex-1 gradient-primary text-white order-1 sm:order-2"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};