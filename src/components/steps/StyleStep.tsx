import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface StyleStepProps {
  onNext: (data: { style: string; tone: string; colorPalette: string }) => void;
  onBack: () => void;
}

const styles = [
  { id: "modern", label: "Modern & Minimal", emoji: "✨" },
  { id: "bold", label: "Bold & Vibrant", emoji: "🎨" },
  { id: "elegant", label: "Elegant & Luxurious", emoji: "💎" },
  { id: "playful", label: "Playful & Fun", emoji: "🎉" },
  { id: "professional", label: "Professional & Clean", emoji: "💼" },
  { id: "vintage", label: "Vintage & Retro", emoji: "📻" },
];

const tones = [
  "Inspirational", "Educational", "Humorous", "Serious", 
  "Friendly", "Authoritative"
];

export const StyleStep = ({ onNext, onBack }: StyleStepProps) => {
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [colorPalette, setColorPalette] = useState("#6366F1");

  const handleNext = () => {
    if (selectedStyle && selectedTone) {
      onNext({ style: selectedStyle, tone: selectedTone, colorPalette });
    }
  };

  return (
    <OnboardingStep 
      title="Define Your Style"
      description="Choose the visual style and tone for your content"
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base">Visual Style</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl border-2 transition-smooth ${
                  selectedStyle === style.id
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="text-2xl mb-2">{style.emoji}</div>
                <div className="font-medium text-sm">{style.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base">Content Tone</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tones.map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={`p-3 rounded-xl border-2 transition-smooth ${
                  selectedTone === tone
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <span className="font-medium text-sm">{tone}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="color" className="text-base">Primary Brand Color (Optional)</Label>
          <div className="flex gap-3 items-center">
            <Input
              id="color"
              type="color"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              className="w-20 h-12 cursor-pointer"
            />
            <Input
              type="text"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              placeholder="#6366F1"
              className="flex-1"
            />
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
            disabled={!selectedStyle || !selectedTone}
            className="flex-1 gradient-primary text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};
