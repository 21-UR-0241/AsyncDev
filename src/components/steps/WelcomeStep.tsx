
import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Palette, Smartphone } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  const features = [
    {
      icon: Palette,
      title: "Custom Styles",
      description: "Match your brand perfectly",
      example: "Choose from minimal, bold, professional, or playful visual styles that align with your brand identity"
    },
    {
      icon: Zap,
      title: "Fast Generation",
      description: "Get results in seconds",
      example: "AI-powered image creation delivers high-quality marketing visuals in under 30 seconds"
    },
    {
      icon: Smartphone,
      title: "Multiple Formats",
      description: "All social media sizes",
      example: "Generate images optimized for Instagram, Facebook, LinkedIn, YouTube, and more platforms"
    }
  ];

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.5s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .animate-bounce-slow {
          animation: bounce 2s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-600 {
          animation-delay: 0.6s;
        }

        .gradient-primary {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%);
        }

        .shadow-glow {
          box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
        }

        .transition-smooth {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      <OnboardingStep 
        title="Welcome to AI Async Studio"
        description="Create stunning marketing visuals in minutes with the power of AI"
      >
        <div className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-4 sm:space-y-6 py-4 sm:py-8">
            {/* Animated Icon - Responsive sizing with glow effect */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-glow animate-float opacity-0 animate-fadeInScale relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer"></div>
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse-slow relative z-10" />
            </div>
            
            {/* Hero Text - Responsive typography with staggered animation */}
            <div className="space-y-2 sm:space-y-3 px-4 sm:px-0">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight opacity-0 animate-fadeInUp delay-100">
                Generate professional marketing images tailored to your brand
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto opacity-0 animate-fadeInUp delay-200">
                Answer a few quick questions and we'll create custom AI-powered visuals that perfectly match your business needs.
              </p>
            </div>

            {/* Feature Cards - Responsive grid with staggered animations and detailed descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6 px-4 sm:px-0">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={feature.title}
                    className={`p-4 sm:p-5 rounded-xl bg-muted/50 hover:bg-muted/70 transition-all duration-200 card-hover opacity-0 animate-fadeInUp delay-${300 + (index * 100)} border border-transparent hover:border-primary/20 group`}
                  >
                    {/* Icon with background */}
                    <div className="mb-3 flex justify-center">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">
                      {feature.title}
                    </h4>
                    
                    {/* Short description */}
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      {feature.description}
                    </p>
                    
                    {/* Detailed example with divider */}
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground/80 leading-relaxed">
                        {feature.example}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Button - Responsive sizing with enhanced animations */}
          <div className="opacity-0 animate-fadeInUp delay-600">
            <Button 
              onClick={onNext}
              className="w-full gradient-primary text-white font-medium py-5 sm:py-6 text-base sm:text-lg hover:shadow-glow transition-smooth active:scale-[0.98] relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Button>
          </div>
        </div>
      </OnboardingStep>
    </>
  );
};