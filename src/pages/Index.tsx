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
import { Sparkles, ImagePlus, RefreshCw, Heart, Mail, Shield, FileText, Zap, Github } from "lucide-react";
import { OnboardingData } from "@/types/onboarding";
import { buildPrompt, formatPromptForAI } from "@/utils/promptBuilder";
import { toast } from "@/hooks/use-toast";
import { functions } from "@/integrations/firebase/client";
import { httpsCallable } from "firebase/functions";



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

  const handleSkip = () => {
    setOnboardingComplete(true);
    toast({
      title: "Skipped setup!",
      description: "You can customize your preferences later or use custom prompts.",
    });
  };


//default Pollinations approach
const handleGenerateImage = async (customPrompt?: string) => {
  setIsGenerating(true);
  
  try {
    const promptData = buildPrompt(onboardingData as OnboardingData);
    const prompt = customPrompt || formatPromptForAI(promptData);
    
    console.log("Generating image with prompt:", prompt);
    
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux`;
    
    const img = new Image();
    
    const loadPromise = new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    await loadPromise;
    
    setGeneratedImages(prev => [imageUrl, ...prev]);
    
    toast({
      title: "Image generated!",
      description: "Your marketing visual is ready.",
    });
    
  } catch (error: unknown) {
    console.error("Generation error:", error);
    toast({
      title: "Generation failed",
      description: "Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsGenerating(false);
  }
};
//end

  //download image
  const handleDownload = async (imageUrl: string, format: string) => {
    try {
      // Fetch the image as a blob to bypass CORS issues
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `marketing-image-${format}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      
      toast({
        title: "Download started",
        description: `Downloading in ${format} format`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Please try right-clicking the image and selecting 'Save image as'",
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={() => setCurrentStep(1)} onSkip={handleSkip} />;
      case 1:
        return <IndustryStep onNext={handleStepData} onBack={() => setCurrentStep(0)} onSkip={handleSkip} />;
      case 2:
        return <NicheStep onNext={handleStepData} onBack={() => setCurrentStep(1)} onSkip={handleSkip} />;
      case 3:
        return <GoalStep onNext={handleStepData} onBack={() => setCurrentStep(2)} onSkip={handleSkip} />;
      case 4:
        return <StyleStep onNext={handleStepData} onBack={() => setCurrentStep(3)} onSkip={handleSkip} />;
      case 5:
        return <FormatStep onNext={handleStepData} onBack={() => setCurrentStep(4)} onSkip={handleSkip} />;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:via-purple-950 dark:to-indigo-950 flex flex-col relative overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-cyan-400/15 to-indigo-400/10 dark:from-blue-500/8 dark:via-cyan-500/6 dark:to-indigo-500/4 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/20 via-purple-400/15 to-pink-400/10 dark:from-indigo-500/8 dark:via-purple-500/6 dark:to-pink-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/20 via-pink-400/15 to-rose-400/10 dark:from-purple-500/8 dark:via-pink-500/6 dark:to-rose-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-cyan-400/8 dark:from-emerald-500/6 dark:via-teal-500/4 dark:to-cyan-500/3 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-br from-violet-400/15 via-fuchsia-400/10 to-purple-400/8 dark:from-violet-500/6 dark:via-fuchsia-500/4 dark:to-purple-500/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 dark:bg-white/10 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Enhanced Header with Advanced Glassmorphism */}
        <div className="relative border-b border-white/30 dark:border-slate-800/60 backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 shadow-2xl shadow-slate-900/10 dark:shadow-black/30">
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 dark:from-white/5 dark:via-transparent dark:to-white/5"></div>
          <div className="container mx-auto px-6 py-6 max-w-7xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 group">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-blue-500/40 dark:shadow-blue-500/20 animate-pulse">
                    <Sparkles className="w-7 h-7 text-white animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl blur-lg opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-indigo-600 group-hover:to-blue-600 dark:group-hover:from-purple-400 dark:group-hover:via-indigo-400 dark:group-hover:to-blue-400 transition-all duration-500">
                    Async Studio
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium tracking-wide">AI-Powered Marketing Visuals</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-green-500/10 to-teal-500/15 dark:from-emerald-500/8 dark:via-green-500/6 dark:to-teal-500/8 border border-emerald-500/30 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/20 backdrop-blur-sm">
                  <div className="relative">
                    <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                    <div className="absolute inset-0 bg-emerald-400 rounded-full blur-sm opacity-50 animate-ping" style={{ animationDuration: '2s' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 tracking-wide">Ready to Generate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative">
          <PromptInput
            defaultPrompt={defaultPrompt}
            jsonPrompt={promptData as unknown as Record<string, unknown>}
            onGenerate={handleGenerateImage}
            isGenerating={isGenerating}
          />
        </div>

        {/* Enhanced Generated Images Section */}
        {generatedImages.length > 0 && (
  <div className="relative bg-gradient-to-br from-white/80 via-slate-50/70 to-blue-50/60 dark:from-slate-900/80 dark:via-slate-800/70 dark:to-indigo-950/60 backdrop-blur-2xl border-t border-white/30 dark:border-slate-800/60 shadow-2xl shadow-slate-900/20 dark:shadow-black/40">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:from-transparent dark:via-white/5 dark:to-transparent"></div>
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-7xl relative">
      <div className="space-y-6 sm:space-y-8 md:space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 group">
          <div className="space-y-2 sm:space-y-3 w-full sm:w-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 via-pink-600 to-rose-600 rounded-lg sm:rounded-xl shadow-xl shadow-purple-500/40 dark:shadow-purple-500/20 animate-pulse">
                  <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg sm:rounded-xl blur-lg opacity-50 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-rose-600 dark:group-hover:from-purple-400 dark:group-hover:via-pink-400 dark:group-hover:to-rose-400 transition-all duration-500">
                  Your Creations
                </h2>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 tracking-wide">
                    AI-Generated Masterpieces
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-0 sm:ml-16 flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-rose-500/5 rounded-full border border-purple-500/20 dark:border-purple-500/10">
                <p className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300">
                  {generatedImages.length} {generatedImages.length === 1 ? 'masterpiece' : 'masterpieces'} generated
                </p>
              </div>
              <div className="hidden sm:flex -space-x-1">
                {[...Array(Math.min(generatedImages.length, 5))].map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-white dark:border-slate-800 shadow-lg animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
                {generatedImages.length > 5 && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-bold text-white">+{generatedImages.length - 5}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setGeneratedImages([])}
              className="gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border-2 border-slate-300 dark:border-slate-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950/30 dark:hover:to-pink-950/30 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/20 backdrop-blur-sm w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              Clear All
            </Button>
          </div>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ImageGallery
            images={generatedImages}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  </div>
)}

        {/* Enhanced Footer with Advanced Design */}
        <footer className="relative bg-gradient-to-br from-white/60 via-slate-50/50 to-blue-50/40 dark:from-slate-900/60 dark:via-slate-800/50 dark:to-indigo-950/40 backdrop-blur-2xl border-t border-white/30 dark:border-slate-800/60 mt-auto shadow-2xl shadow-slate-900/10 dark:shadow-black/30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:from-transparent dark:via-white/5 dark:to-transparent"></div>
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Created</span>
                <div className="relative">
                  <Heart className="w-4 sm:w-5 h-4 sm:h-5 text-red-500 fill-red-500 animate-pulse" />
                  <div className="absolute inset-0 bg-red-400 rounded-full blur-sm opacity-50 animate-ping" style={{ animationDuration: '2s' }}></div>
                </div>
                <span className="text-slate-600 dark:text-slate-400 font-medium">by</span>
                <a
                  href="https://github.com/HarmonJavier01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 dark:hover:from-purple-400 dark:hover:via-indigo-400 dark:hover:to-blue-400 transition-all duration-500"
                >
                  <span className="relative text-black dark:text-white">
                    Async
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                  </span>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="group relative text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 font-medium"
                >
                  <span className="relative z-10">Privacy Policy</span>
                  <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={() => setTermsOpen(true)}
                  className="group relative text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 font-medium"
                >
                  <span className="relative z-10">Terms of Service</span>
                  <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={() => setContactOpen(true)}
                  className="group relative text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 font-medium"
                >
                  <span className="relative z-10">Contact</span>
                  <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <div className="w-6 sm:w-8 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent dark:via-slate-600"></div>
                <span className="font-medium text-center">© {new Date().getFullYear()} Async. All rights reserved.</span>
                <div className="w-6 sm:w-8 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent dark:via-slate-600"></div>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-500/5 dark:via-indigo-500/5 dark:to-purple-500/5 rounded-full border border-blue-500/20 dark:border-blue-500/10">
                  <div className="relative">
                    <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500 animate-spin" style={{ animationDuration: '4s' }} />
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 tracking-wide">
                    Powered by Asyncdev AI technology
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 text-center">
                  <span>Images generated are for creative and marketing purposes</span>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Enhanced Privacy Policy Dialog */}
        <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Privacy Policy
                </span>
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Last updated: {new Date().toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4 text-sm">
              <section className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                  Information We Collect
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We collect information you provide directly to us, including your name, email address, 
                  and any content you create using our service. We also automatically collect certain 
                  information about your device and how you interact with our service.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                  How We Use Your Information
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, 
                  to process your requests, and to communicate with you about updates and features.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                  Information Sharing
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We do not sell your personal information. We may share your information with service 
                  providers who assist us in operating our service, and when required by law.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">4</span>
                  Data Security
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your 
                  personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">5</span>
                  Your Rights
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You have the right to access, correct, or delete your personal information. 
                  You may also object to or restrict certain processing of your data.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-pink-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">6</span>
                  Contact Us
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at privacy@async.com
                </p>
              </section>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Terms Dialog */}
        <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Terms of Service
                </span>
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Last updated: {new Date().toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4 text-sm">
              <section className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">1. Acceptance of Terms</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  By accessing and using Async, you accept and agree to be bound by the terms and 
                  provision of this agreement. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">2. Use License</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We grant you a limited, non-exclusive, non-transferable license to use our service 
                  for your personal or commercial use, subject to these terms.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">3. User Responsibilities</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account and for all 
                  activities that occur under your account. You agree to use the service only for lawful purposes.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">4. Content Ownership</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  You retain all rights to the content you create using our service. We claim no 
                  ownership over your generated images and creations.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">5. Service Modifications</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We reserve the right to modify or discontinue the service at any time, with or 
                  without notice. We shall not be liable to you or any third party for any modification 
                  or discontinuance of the service.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-200 dark:border-pink-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">6. Limitation of Liability</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  In no event shall Async be liable for any indirect, incidental, special, consequential, 
                  or punitive damages arising out of or relating to your use of the service.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">7. Termination</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  We may terminate or suspend your account and access to the service immediately, 
                  without prior notice, for any breach of these Terms.
                </p>
              </section>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Contact Dialog */}
        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Contact Us
                </span>
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                We'd love to hear from you
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                  <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">General Inquiries</h4>
                  <a 
                    
                    href="mailto:https://mail.google.com/mail/u/0/#inbox/FMfcgzQcqQvxdQqSxHrxrkhnbMlFggCP?compose=new" 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 group"
                  >
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span  className="font-medium">Harmonjavier01@gmail.com</span>
                  </a>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Support</h4>
                  <a 
                    href="mailto:support@async.com" 
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2 group"
                  >
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="font-medium">support@asyncai.com</span>
                  </a>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300">
                  <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">GitHub</h4>
                  <a 
                    href="https://github.com/HarmonJavier01" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-2 group"
                  >
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/50 group-hover:bg-slate-200 dark:group-hover:bg-slate-800/50 transition-colors">
                      <Github className="w-4 h-4" />
                    </div>
                    <span className="font-medium">HarmonJavier01</span>
                  </a>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-slate-700 dark:text-slate-300 text-center font-medium">
                    ⚡ We typically respond within 24-48 hours during business days
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:via-purple-950 dark:to-indigo-950 text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* Enhanced Animated Background for Onboarding */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-cyan-400/15 to-indigo-400/10 dark:from-blue-500/8 dark:via-cyan-500/6 dark:to-indigo-500/4 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/20 via-purple-400/15 to-pink-400/10 dark:from-indigo-500/8 dark:via-purple-500/6 dark:to-pink-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/20 via-pink-400/15 to-rose-400/10 dark:from-purple-500/8 dark:via-pink-500/6 dark:to-rose-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-cyan-400/8 dark:from-emerald-500/6 dark:via-teal-500/4 dark:to-cyan-500/3 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-br from-violet-400/15 via-fuchsia-400/10 to-purple-400/8 dark:from-violet-500/6 dark:via-fuchsia-500/4 dark:to-purple-500/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Floating Particles for Onboarding */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 dark:bg-white/15 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 1}s`,
            }}
          />
        ))}
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
        <div className="w-full max-w-6xl space-y-6 sm:space-y-8">
          {/* Enhanced Progress Section */}
          {currentStep > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex justify-center px-4">
                <div className="w-full max-w-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/20 border border-white/30 dark:border-slate-800/60 p-4 sm:p-6">
                  <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Main Card */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative group px-2 sm:px-0">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>

              {/* Main Card */}
              <div className="relative backdrop-blur-2xl bg-white/90 dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-900/20 dark:shadow-black/40 border border-white/30 dark:border-slate-800/60 p-6 sm:p-8 md:p-12 transition-all duration-500 hover:shadow-3xl hover:shadow-slate-900/30 dark:hover:shadow-black/50">
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 dark:from-white/5 dark:via-transparent dark:to-white/5 rounded-2xl sm:rounded-3xl"></div>

                {/* Content */}
                <div className="relative">
                  {renderStep()}
                </div>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center px-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-slate-800/50 overflow-x-auto">
              {[...Array(totalSteps)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                    i < currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 scale-125'
                      : i === currentStep
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;