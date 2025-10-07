import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface FormatStepProps {
  onNext: (data: { formats: string[] }) => void;
  onBack: () => void;
}

const formatOptions = [
  { id: "1:1", label: "Square (1:1)", description: "Instagram, Facebook posts" },
  { id: "16:9", label: "Landscape (16:9)", description: "YouTube thumbnails, covers" },
  { id: "9:16", label: "Portrait (9:16)", description: "Instagram Stories, Reels" },
  { id: "4:5", label: "Portrait (4:5)", description: "Instagram feed vertical" },
];

export const FormatStep = ({ onNext, onBack }: FormatStepProps) => {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["1:1"]);

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev =>
      prev.includes(formatId)
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleNext = () => {
    if (selectedFormats.length > 0) {
      onNext({ formats: selectedFormats });
    }
  };

  return (
    <OnboardingStep 
      title="Choose Output Formats"
      description="Select the aspect ratios you need"
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <Label className="text-sm sm:text-base">Image formats</Label>
          <div className="space-y-2 sm:space-y-3">
            {formatOptions.map((format) => (
              <div
                key={format.id}
                onClick={() => toggleFormat(format.id)}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-smooth cursor-pointer ${
                  selectedFormats.includes(format.id)
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <Checkbox
                    checked={selectedFormats.includes(format.id)}
                    className="mt-0.5 sm:mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base mb-0.5 sm:mb-1">
                      {format.label}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {format.description}
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
            disabled={selectedFormats.length === 0}
            className="w-full sm:flex-1 gradient-primary text-white order-1 sm:order-2"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};