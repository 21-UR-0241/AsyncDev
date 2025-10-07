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
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Visual Style Selection */}
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <Label className="text-sm sm:text-base font-medium">Visual Style</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 min-h-[80px] sm:min-h-[90px] flex flex-col items-center justify-center ${
                  selectedStyle === style.id
                    ? "border-primary bg-primary/5 shadow-soft scale-[0.98]"
                    : "border-border hover:border-primary/50 hover:bg-muted/50 active:scale-[0.98]"
                }`}
              >
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{style.emoji}</div>
                <div className="font-medium text-xs sm:text-sm leading-tight text-center px-1">
                  {style.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Tone Selection */}
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <Label className="text-sm sm:text-base font-medium">Content Tone</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3">
            {tones.map((tone) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone)}
                className={`p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 min-h-[52px] sm:min-h-[56px] flex items-center justify-center ${
                  selectedTone === tone
                    ? "border-primary bg-primary/5 shadow-soft scale-[0.98]"
                    : "border-border hover:border-primary/50 hover:bg-muted/50 active:scale-[0.98]"
                }`}
              >
                <span className="font-medium text-xs sm:text-sm text-center px-1">{tone}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette Picker */}
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <Label htmlFor="color" className="text-sm sm:text-base font-medium">
            Primary Brand Color{" "}
            <span className="text-muted-foreground font-normal text-xs sm:text-sm">(Optional)</span>
          </Label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <Input
              id="color"
              type="color"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              className="w-full sm:w-16 md:w-20 h-11 sm:h-12 cursor-pointer rounded-lg sm:rounded-xl"
              aria-label="Color picker"
            />
            <Input
              type="text"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              placeholder="#6366F1"
              className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
              aria-label="Color hex value"
            />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Choose a color that represents your brand
          </p>
        </div>

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
            disabled={!selectedStyle || !selectedTone}
            className="w-full sm:flex-1 gradient-primary text-white h-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingStep>
  );
};