interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-12">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full gradient-primary transition-smooth"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
