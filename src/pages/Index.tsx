import { useState } from "react";
import { WelcomeStep } from "@/components/steps/WelcomeStep";
import { IndustryStep } from "@/components/steps/IndustryStep";
import { NicheStep } from "@/components/steps/NicheStep";
import { GoalStep } from "@/components/steps/GoalStep";
import { StyleStep } from "@/components/steps/StyleStep";
import { FormatStep } from "@/components/steps/FormatStep";
import { ProfileStep } from "@/components/steps/ProfileStep";
import { ProgressBar } from "@/components/ProgressBar";
import { ImageGallery } from "@/components/ImageGallery";
import { PromptInput } from "@/components/PromptInput";
import { Button } from "@/components/ui/button";
import { Sparkles, ImagePlus, RefreshCw } from "lucide-react";
import { OnboardingData } from "@/types/onboarding";
import { buildPrompt, formatPromptForAI } from "@/utils/promptBuilder";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalSteps = 7;

  const handleStepData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);
  };

  const handleComplete = () => {
    setOnboardingComplete(true);
    toast({
      title: "Setup complete!",
      description: "You're ready to generate amazing marketing visuals.",
    });
  };

  const handleGenerateImage = async (customPrompt?: string) => {
    setIsGenerating(true);
    
    try {
      const promptData = buildPrompt(onboardingData as OnboardingData);
      const prompt = customPrompt || formatPromptForAI(promptData);
      
      console.log("Generating image with prompt:", prompt);
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt }
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.imageUrl) {
        throw new Error('No image URL returned');
      }

      setGeneratedImages(prev => [data.imageUrl, ...prev]);

      toast({
        title: "Image generated!",
        description: "Your marketing visual is ready.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, format: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `marketing-image-${format}-${Date.now()}.jpg`;
    link.click();
    
    toast({
      title: "Download started",
      description: `Downloading in ${format} format`,
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={() => setCurrentStep(1)} />;
      case 1:
        return <IndustryStep onNext={handleStepData} onBack={() => setCurrentStep(0)} />;
      case 2:
        return <NicheStep onNext={handleStepData} onBack={() => setCurrentStep(1)} />;
      case 3:
        return <GoalStep onNext={handleStepData} onBack={() => setCurrentStep(2)} />;
      case 4:
        return <StyleStep onNext={handleStepData} onBack={() => setCurrentStep(3)} />;
      case 5:
        return <FormatStep onNext={handleStepData} onBack={() => setCurrentStep(4)} />;
      case 6:
        return (
          <ProfileStep
            onNext={handleComplete}
            onBack={() => setCurrentStep(5)}
            onboardingData={onboardingData}
          />
        );
      default:
        return null;
    }
  };

  if (onboardingComplete) {
    const promptData = buildPrompt(onboardingData as OnboardingData);
    const defaultPrompt = formatPromptForAI(promptData);

    return (
      <div className="min-h-screen bg-background">
        {/* Prompt Input with Sidebar - This is the full interface */}
        <PromptInput
          defaultPrompt={defaultPrompt}
          jsonPrompt={promptData as unknown as Record<string, unknown>}
          onGenerate={handleGenerateImage}
          isGenerating={isGenerating}
        />

        {/* Generated Images Section - Positioned below the prompt input form */}
        {generatedImages.length > 0 && (
          <div className="bg-background border-t border-border">
            <div className="container mx-auto px-6 py-8 max-w-7xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Generated Images</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {generatedImages.length} {generatedImages.length === 1 ? 'image' : 'images'} created
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setGeneratedImages([])}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear All
                  </Button>
                </div>
                <ImageGallery 
                  images={generatedImages}
                  onDownload={handleDownload}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="min-h-screen gradient-subtle flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {currentStep > 0 && (
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
          )}
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Index;