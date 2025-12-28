import { ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingTooltipProps {
  children: ReactNode;
  message: string;
  show: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onDismiss?: () => void;
}

export default function OnboardingTooltip({
  children,
  message,
  show,
  position = 'bottom',
  onDismiss,
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Delay showing tooltip for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-emerald-500',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-emerald-500',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-emerald-500',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-emerald-500',
  };

  return (
    <div className="relative inline-block">
      {/* Highlight ring around target element */}
      <div
        className={cn(
          'transition-all duration-500',
          show && isVisible && 'ring-4 ring-emerald-500/50 ring-offset-2 rounded-xl'
        )}
      >
        {children}
      </div>

      {/* Tooltip */}
      {show && (
        <div
          className={cn(
            'absolute z-50 transition-all duration-300',
            positionClasses[position],
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
        >
          <div className="relative bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg max-w-xs min-w-[200px]">
            <p className="text-sm font-medium pr-6">{message}</p>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 text-white hover:bg-emerald-600 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-0 h-0 border-8',
                arrowClasses[position]
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
