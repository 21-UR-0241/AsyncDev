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
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base">Image formats</Label>
          <div className="space-y-3">
            {formatOptions.map((format) => (
              <div
                key={format.id}
                onClick={() => toggleFormat(format.id)}
                className={`p-4 rounded-xl border-2 transition-smooth cursor-pointer ${
                  selectedFormats.includes(format.id)
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedFormats.includes(format.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium mb-1">{format.label}</div>
                    <div className="text-sm text-muted-foreground">{format.description}</div>
                  </div>
                </div>
              </div>
            ))}
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
            onClick={handleNext}
            disabled={selectedFormats.length === 0}
            className="flex-1 gradient-primary text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};
