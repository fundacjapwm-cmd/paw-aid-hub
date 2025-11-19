import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface WishlistCelebrationProps {
  animalName: string;
  onComplete?: () => void;
}

export const WishlistCelebration = ({ animalName, onComplete }: WishlistCelebrationProps) => {
  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        onComplete?.();
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Launch confetti from two sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, [animalName, onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9998] pointer-events-none">
      <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-2 border-primary animate-scale-in pointer-events-auto max-w-md mx-4">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">🎉</div>
          <h3 className="text-2xl font-bold text-foreground">
            Gratulacje!
          </h3>
          <p className="text-lg text-muted-foreground">
            Wishlist dla <span className="font-bold text-primary">{animalName}</span> został w pełni zrealizowany!
          </p>
          <p className="text-sm text-muted-foreground">
            Dziękujemy za Twoje wsparcie ❤️
          </p>
        </div>
      </div>
    </div>
  );
};
