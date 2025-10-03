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
      <div className="min-h-screen gradient-subtle">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="inline-block text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ⚡AI Async Studio
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Generate stunning visuals tailored to your brand
              </p>
              
              <Button
                onClick={() => setOnboardingComplete(false)}
                variant="outline"
                className="mb-8"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update Preferences
              </Button>
            </div>

            <div className="max-w-3xl mx-auto mb-12">
              <PromptInput
                defaultPrompt={defaultPrompt}
                jsonPrompt={promptData as unknown as Record<string, unknown>}
                onGenerate={handleGenerateImage}
                isGenerating={isGenerating}
              />
            </div>

            {generatedImages.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Your Generated Images</h2>
                <ImageGallery 
                  images={generatedImages}
                  onDownload={handleDownload}
                />
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 gradient-primary rounded-full flex items-center justify-center shadow-glow">
                  <ImagePlus className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Ready to Create</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Click the button above to generate your first set of marketing images
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {currentStep > 0 && (
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        )}
        {renderStep()}
      </div>
    </div>
  );
};

export default Index;
