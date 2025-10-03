import { ReactNode } from "react";

interface OnboardingStepProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export const OnboardingStep = ({ children, title, description }: OnboardingStepProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-lg">{description}</p>
        )}
      </div>
      <div className="bg-card shadow-card rounded-2xl p-8 border border-border/50">
        {children}
      </div>
    </div>
  );
};
