import { useState } from "react";
import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, ShoppingCart, Heart, BookOpen, Rocket } from "lucide-react";

interface GoalStepProps {
  onNext: (data: { goal?: string; goals?: string[] }) => void;
  onBack: () => void;
}

const goalOptions = [
  { 
    id: "awareness", 
    label: "Brand Awareness", 
    icon: TrendingUp,
    description: "Increase visibility and recognition of your brand",
    example: "Eye-catching visuals that showcase your brand identity and values"
  },
  { 
    id: "leads", 
    label: "Lead Generation", 
    icon: Users,
    description: "Capture contact information and build your prospect list",
    example: "Compelling call-to-action images that drive sign-ups and inquiries"
  },
  { 
    id: "sales", 
    label: "Drive Sales", 
    icon: ShoppingCart,
    description: "Convert viewers into paying customers",
    example: "Product-focused visuals with pricing, offers, and urgency triggers"
  },
  { 
    id: "engagement", 
    label: "Social Engagement", 
    icon: Heart,
    description: "Boost likes, comments, shares, and interactions",
    example: "Relatable, shareable content that sparks conversations and reactions"
  },
  { 
    id: "education", 
    label: "Customer Education", 
    icon: BookOpen,
    description: "Inform and teach your audience about your products or services",
    example: "Infographic-style visuals explaining features, benefits, or how-tos"
  },
  { 
    id: "launch", 
    label: "Product Launch", 
    icon: Rocket,
    description: "Create excitement and anticipation for new offerings",
    example: "Bold announcement visuals with 'New', 'Coming Soon', or 'Just Launched' themes"
  },
];

export const GoalStep = ({ onNext, onBack }: GoalStepProps) => {
  const [selectedGoal, setSelectedGoal] = useState<string>("");

  const handleNext = () => {
    if (selectedGoal) {
      onNext({ 
        goal: selectedGoal,
        goals: [selectedGoal]
      });
    }
  };

  return (
    <OnboardingStep
      title="What's Your Marketing Goal?"
      description="Select the primary objective for your marketing visuals"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {goalOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedGoal(option.label)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                selectedGoal === option.label
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg scale-[1.02]"
                  : "border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md"
              }`}
            >
              <div className="space-y-3">
                {/* Header with Icon and Label */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedGoal === option.label
                      ? "bg-purple-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {option.label}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                
                {/* Example */}
                <div className={`pt-3 border-t ${
                  selectedGoal === option.label
                    ? "border-purple-200 dark:border-purple-800"
                    : "border-slate-200 dark:border-slate-700"
                }`}>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Example Output:
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                    "{option.example}"
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4 md:pt-6 max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full sm:flex-1 h-11 sm:h-12"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedGoal}
          className="w-full sm:flex-1 gradient-primary text-white h-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          Continue
        </Button>
      </div>
    </OnboardingStep>
  );
};
