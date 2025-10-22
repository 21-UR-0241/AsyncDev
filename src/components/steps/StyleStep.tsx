import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface StyleStepProps {
  onNext: (data: { style: string; tone: string; colorPalette: string }) => void;
  onBack: () => void;
  onSkip?: () => void;
}

const styles = [
  { 
    id: "modern", 
    label: "Modern & Minimal",
    preview: {
      gradient: "linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)",
      shapes: [
        { type: "circle", color: "#667eea", size: "30%", pos: { top: "15%", left: "70%" } },
        { type: "rect", color: "#764ba2", size: "20%", pos: { bottom: "20%", right: "15%" } }
      ]
    },
    description: "Clean, spacious, modern"
  },
  { 
    id: "bold", 
    label: "Bold & Vibrant",
    preview: {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      shapes: [
        { type: "circle", color: "#feca57", size: "35%", pos: { top: "10%", right: "10%" } },
        { type: "circle", color: "#ff6b6b", size: "25%", pos: { bottom: "15%", left: "15%" } }
      ]
    },
    description: "Vibrant, high-energy, colorful"
  },
  { 
    id: "elegant", 
    label: "Elegant & Luxurious",
    preview: {
      gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      shapes: [
        { type: "rect", color: "#d4af37", size: "15%", pos: { top: "20%", right: "20%" } },
        { type: "line", color: "#d4af37", size: "40%", pos: { bottom: "30%", left: "10%" } }
      ]
    },
    description: "Sophisticated, premium, refined"
  },
  { 
    id: "playful", 
    label: "Playful & Fun",
    preview: {
      gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      shapes: [
        { type: "circle", color: "#ff6b6b", size: "25%", pos: { top: "20%", left: "15%" } },
        { type: "circle", color: "#4ecdc4", size: "20%", pos: { top: "50%", right: "20%" } },
        { type: "circle", color: "#ffe66d", size: "15%", pos: { bottom: "20%", left: "60%" } }
      ]
    },
    description: "Fun, colorful, energetic"
  },
  { 
    id: "professional", 
    label: "Professional & Clean",
    preview: {
      gradient: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
      shapes: [
        { type: "rect", color: "#2c3e50", size: "35%", pos: { top: "10%", left: "10%" } },
        { type: "rect", color: "#3498db", size: "25%", pos: { bottom: "15%", right: "15%" } }
      ]
    },
    description: "Corporate, trustworthy, clean"
  },
  { 
    id: "vintage", 
    label: "Vintage & Retro",
    preview: {
      gradient: "linear-gradient(135deg, #e8c39e 0%, #d4a574 100%)",
      shapes: [
        { type: "circle", color: "#8b4513", size: "30%", pos: { top: "15%", right: "15%" } },
        { type: "rect", color: "#cd853f", size: "20%", pos: { bottom: "20%", left: "20%" } }
      ]
    },
    description: "Nostalgic, warm, classic"
  },
];

const tones = [
  { id: "inspirational", label: "Inspirational", icon: "" },
  { id: "educational", label: "Educational", icon: "" },
  { id: "humorous", label: "Humorous", icon: "" },
  { id: "serious", label: "Serious", icon: "" },
  { id: "friendly", label: "Friendly", icon: "" },
  { id: "authoritative", label: "Authoritative", icon: "" }
];

export const StyleStep = ({ onNext, onBack, onSkip }: StyleStepProps) => {
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`group relative p-0 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                  selectedStyle === style.id
                    ? "border-primary shadow-lg scale-[0.98] ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
                }`}
              >
                {/* Visual Preview */}
                <div 
                  className="relative h-32 sm:h-36 overflow-hidden"
                  style={{ background: style.preview.gradient }}
                >
                  {/* Shapes/Elements */}
                  {style.preview.shapes.map((shape, idx) => (
                    <div
                      key={idx}
                      className={`absolute transition-transform duration-300 ${
                        selectedStyle === style.id ? "scale-110" : "group-hover:scale-105"
                      }`}
                      style={{
                        width: shape.size,
                        height: shape.size,
                        backgroundColor: shape.color,
                        opacity: 0.9,
                        ...shape.pos,
                        ...(shape.type === "circle" && { borderRadius: "50%" }),
                        ...(shape.type === "rect" && { borderRadius: "8px" }),
                        ...(shape.type === "line" && { 
                          height: "3px", 
                          width: shape.size,
                          borderRadius: "2px"
                        })
                      }}
                    />
                  ))}
                  
                  {/* Overlay gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent transition-opacity duration-300 ${
                    selectedStyle === style.id ? "opacity-40" : "opacity-0 group-hover:opacity-30"
                  }`} />
                </div>

                {/* Label */}
                <div className="p-3 sm:p-4 bg-card">
                  <h3 className="font-semibold text-sm sm:text-base mb-1 text-foreground">
                    {style.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {style.description}
                  </p>
                </div>

                {/* Selected Indicator */}
                {selectedStyle === style.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
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
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`p-3 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 min-h-[60px] flex flex-col items-center justify-center gap-1 ${
                  selectedTone === tone.id
                    ? "border-primary bg-primary/5 shadow-soft scale-[0.98]"
                    : "border-border hover:border-primary/50 hover:bg-muted/50 active:scale-[0.98]"
                }`}
              >
                <span className="text-xl">{tone.icon}</span>
                <span className="font-medium text-xs sm:text-sm text-center px-1">{tone.label}</span>
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
            <div className="relative">
              <Input
                id="color"
                type="color"
                value={colorPalette}
                onChange={(e) => setColorPalette(e.target.value)}
                className="w-full sm:w-20 h-12 cursor-pointer rounded-xl border-2"
                aria-label="Color picker"
              />
              <div 
                className="absolute inset-1 rounded-lg pointer-events-none"
                style={{ backgroundColor: colorPalette }}
              />
            </div>
            <Input
              type="text"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              placeholder="#6366F1"
              className="flex-1 h-12 text-sm sm:text-base font-mono"
              aria-label="Color hex value"
            />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            This color will be incorporated into your generated images
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