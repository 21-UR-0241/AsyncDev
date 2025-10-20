import React from "react";

interface OnboardingStepProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const OnboardingStep = ({ title, description, children }: OnboardingStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">{title}</h2>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
};