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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, ImagePlus, RefreshCw, Heart, Mail, Shield, FileText } from "lucide-react";
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
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

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
      <div className="min-h-screen bg-background flex flex-col">
        {/* Prompt Input with Sidebar - This is the full interface */}
        <div className="flex-1">
          <PromptInput
            defaultPrompt={defaultPrompt}
            jsonPrompt={promptData as unknown as Record<string, unknown>}
            onGenerate={handleGenerateImage}
            isGenerating={isGenerating}
          />
        </div>

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

        {/* Footer with Credits */}
        <footer className="bg-background border-t border-border mt-auto " >
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Made </span>
                {/* <Heart className="w-4 h-4 text-red-500 fill-red-500" /> */}
                <span>by</span>
                <a 
                  href="https://github.com/HarmonJavier01" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Async
                </a>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <button 
                  onClick={() => setPrivacyOpen(true)}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => setTermsOpen(true)}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
                <button 
                  onClick={() => setContactOpen(true)}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Async. All rights reserved.
              </div>
            </div>
            
           <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Powered by AI technology. Images generated are for creative and marketing purposes.
              </p>
            </div>
          </div>
        </footer>

        {/* Privacy Policy Dialog */}
        <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Privacy Policy
              </DialogTitle>
              <DialogDescription>
                Last updated: {new Date().toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4 text-sm">
              <section>
                <h3 className="text-lg font-semibold mb-2">1. Information We Collect</h3>
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, including your name, email address, 
                  and any content you create using our service. We also automatically collect certain 
                  information about your device and how you interact with our service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">2. How We Use Your Information</h3>
                <p className="text-muted-foreground">
                  We use the information we collect to provide, maintain, and improve our services, 
                  to process your requests, and to communicate with you about updates and features.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">3. Information Sharing</h3>
                <p className="text-muted-foreground">
                  We do not sell your personal information. We may share your information with service 
                  providers who assist us in operating our service, and when required by law.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">4. Data Security</h3>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your 
                  personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">5. Your Rights</h3>
                <p className="text-muted-foreground">
                  You have the right to access, correct, or delete your personal information. 
                  You may also object to or restrict certain processing of your data.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">6. Contact Us</h3>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at privacy@async.com
                </p>
              </section>
            </div>
          </DialogContent>
        </Dialog>

        {/* Terms of Service Dialog */}
        <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Terms of Service
              </DialogTitle>
              <DialogDescription>
                Last updated: {new Date().toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4 text-sm">
              <section>
                <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By accessing and using Async, you accept and agree to be bound by the terms and 
                  provision of this agreement. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">2. Use License</h3>
                <p className="text-muted-foreground">
                  We grant you a limited, non-exclusive, non-transferable license to use our service 
                  for your personal or commercial use, subject to these terms.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">3. User Responsibilities</h3>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account and for all 
                  activities that occur under your account. You agree to use the service only for lawful purposes.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">4. Content Ownership</h3>
                <p className="text-muted-foreground">
                  You retain all rights to the content you create using our service. We claim no 
                  ownership over your generated images and creations.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">5. Service Modifications</h3>
                <p className="text-muted-foreground">
                  We reserve the right to modify or discontinue the service at any time, with or 
                  without notice. We shall not be liable to you or any third party for any modification 
                  or discontinuance of the service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">6. Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  In no event shall Async be liable for any indirect, incidental, special, consequential, 
                  or punitive damages arising out of or relating to your use of the service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">7. Termination</h3>
                <p className="text-muted-foreground">
                  We may terminate or suspend your account and access to the service immediately, 
                  without prior notice, for any breach of these Terms.
                </p>
              </section>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contact Dialog */}
        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Mail className="w-6 h-6 text-primary" />
                Contact Us
              </DialogTitle>
              <DialogDescription>
                We'd love to hear from you
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-semibold mb-2">General Inquiries</h4>
                  <a 
                    href="mailto:hello@async.com" 
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Harmonjavier01@gmail.com
                  </a>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-semibold mb-2">Support</h4>
                  <a 
                    href="mailto:support@async.com" 
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    support@async.com
                  </a>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-semibold mb-2">Github</h4>
                  <a 
                    href="mailto:Harmonjavier01@gmail.com" 
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    https://github.com/HarmonJavier01
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  We typically respond within 24-48 hours during business days
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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