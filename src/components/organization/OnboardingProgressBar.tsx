import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingStep } from '@/hooks/useOrgOnboarding';

interface OnboardingProgressBarProps {
  currentStep: OnboardingStep;
}

const steps = [
  { id: 'profile', label: 'Dane organizacji', number: 1 },
  { id: 'animal', label: 'Pierwszy podopieczny', number: 2 },
  { id: 'wishlist', label: 'Lista potrzeb', number: 3 },
] as const;

export function OnboardingProgressBar({ currentStep }: OnboardingProgressBarProps) {
  if (currentStep === 'complete') return null;

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">Konfiguracja organizacji</span>
        <span className="text-xs text-muted-foreground">
          Krok {currentStepIndex + 1} z {steps.length}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div key={step.id} className="flex-1 flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all shrink-0",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>
                <span
                  className={cn(
                    "text-xs hidden sm:block truncate",
                    isCurrent && "font-medium text-foreground",
                    !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-4 sm:w-8 transition-colors shrink-0",
                    index < currentStepIndex ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
