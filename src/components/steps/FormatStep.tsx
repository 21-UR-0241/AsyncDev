import { useState } from "react";
import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Maximize, Square, RectangleHorizontal, RectangleVertical, Minimize2 } from "lucide-react";

interface FormatStepProps {
  onNext: (data: { format?: string; formats?: string[] }) => void;
  onBack: () => void;
}

const formatOptions = [
  { 
    id: "square", 
    label: "Square (1:1)", 
    icon: Square,
    platform: "Instagram Post",
    description: "Perfect for Instagram feed posts and Facebook",
    example: "Product showcases, quotes, announcements - works great on all feeds",
    dimensions: "1080x1080"
  },
  { 
    id: "landscape", 
    label: "Landscape (16:9)", 
    icon: RectangleHorizontal,
    platform: "YouTube Thumbnail",
    description: "Ideal for YouTube, LinkedIn articles, and presentations",
    example: "Video thumbnails, blog headers, wide promotional banners",
    dimensions: "1920x1080"
  },
  { 
    id: "portrait", 
    label: "Portrait (4:5)", 
    icon: RectangleVertical,
    platform: "Instagram Story",
    description: "Optimized for Instagram and Facebook stories",
    example: "Story ads, vertical videos, mobile-first content",
    dimensions: "1080x1350"
  },
  { 
    id: "wide", 
    label: "Wide (21:9)", 
    icon: Minimize2,
    platform: "Banner/Header",
    description: "Best for website headers and cover photos",
    example: "Website banners, Twitter headers, LinkedIn cover images",
    dimensions: "2560x1080"
  },
];

export const FormatStep = ({ onNext, onBack }: FormatStepProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string>("");

  const handleNext = () => {
    if (selectedFormat) {
      onNext({ 
        format: selectedFormat,
        formats: [selectedFormat]
      });
    }
  };

  return (
    <OnboardingStep
      title="Choose Your Format"
      description="Select the aspect ratio optimized for your target platform"
    >

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {formatOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedFormat(option.label)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                selectedFormat === option.label
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 shadow-lg scale-[1.02]"
                  : "border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-md"
              }`}
            >
              <div className="space-y-3">
                {/* Header with Icon and Label */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedFormat === option.label
                      ? "bg-cyan-500 text-white"
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
                
                {/* Platform Badge */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  selectedFormat === option.label
                    ? "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}>
                  📱 {option.platform}
                </div>

                {/* Dimensions */}
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {option.dimensions}px
                </div>
                
                {/* Example Use Case */}
                <div className={`pt-3 border-t ${
                  selectedFormat === option.label
                    ? "border-cyan-200 dark:border-cyan-800"
                    : "border-slate-200 dark:border-slate-700"
                }`}>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Best For:
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {option.example}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Format Preview */}
      {selectedFormat && (
        <div className="max-w-4xl mx-auto p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-xl border border-cyan-200 dark:border-cyan-800">
          <p className="text-sm text-center text-cyan-800 dark:text-cyan-200">
            ✓ Selected: <span className="font-semibold">{selectedFormat}</span> - Your images will be optimized for this format
          </p>
        </div>
      )}

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
          disabled={!selectedFormat}
          className="w-full sm:flex-1 gradient-primary text-white h-11 sm:h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          Continue
        </Button>
      </div>
    </OnboardingStep>
  );
};
