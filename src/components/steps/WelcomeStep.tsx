import { OnboardingStep } from "../OnboardingStep";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <OnboardingStep 
      title="Welcome to AI Async Studio"
      description="Create stunning marketing visuals in minutes with the power of AI"
    >
      <div className="space-y-6">
        <div className="text-center space-y-4 py-8">
          <div className="w-20 h-20 mx-auto gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-float">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">Generate professional marketing images tailored to your brand</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Answer a few quick questions and we'll create custom AI-powered visuals that perfectly match your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-medium mb-1">Custom Styles</h4>
              <p className="text-sm text-muted-foreground">Match your brand perfectly</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-medium mb-1">Fast Generation</h4>
              <p className="text-sm text-muted-foreground">Get results in seconds</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-medium mb-1">Multiple Formats</h4>
              <p className="text-sm text-muted-foreground">All social media sizes</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onNext}
          className="w-full gradient-primary text-white font-medium py-6 text-lg hover:shadow-glow transition-smooth"
        >
          Get Started
        </Button>
      </div>
    </OnboardingStep>
  );
};
