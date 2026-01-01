import { useState, useEffect } from 'react';

export type OnboardingStep = 'profile' | 'animal' | 'wishlist' | 'complete';

interface OnboardingState {
  currentStep: OnboardingStep;
  isOnboardingActive: boolean;
  targetAnimalName?: string;
  targetAnimalId?: string;
  showCongratulations: boolean;
}

interface UseOrgOnboardingProps {
  organization: any | null;
  animalsCount: number;
  hasWishlistItems: boolean;
}

export function useOrgOnboarding({ organization, animalsCount, hasWishlistItems }: UseOrgOnboardingProps) {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'complete',
    isOnboardingActive: false,
    showCongratulations: false,
  });

  useEffect(() => {
    if (!organization) return;

    // Check if onboarding was already dismissed
    const dismissed = localStorage.getItem(`org_onboarding_dismissed_${organization.id}`);
    if (dismissed) {
      setState(prev => ({ ...prev, currentStep: 'complete', isOnboardingActive: false }));
      return;
    }

    // Determine onboarding step based on organization state
    const isProfileIncomplete = !organization.description || !organization.city || !organization.address;
    
    if (isProfileIncomplete) {
      setState(prev => ({ ...prev, currentStep: 'profile', isOnboardingActive: true }));
    } else if (animalsCount === 0) {
      setState(prev => ({ ...prev, currentStep: 'animal', isOnboardingActive: true }));
    } else if (!hasWishlistItems) {
      // Show wishlist step only if we just added an animal (showCongratulations is true)
      // or if there are animals but no wishlist items
      setState(prev => ({ ...prev, currentStep: 'wishlist', isOnboardingActive: true }));
    } else {
      // Mark as complete and dismiss
      localStorage.setItem(`org_onboarding_dismissed_${organization.id}`, 'true');
      setState(prev => ({ ...prev, currentStep: 'complete', isOnboardingActive: false }));
    }
  }, [organization, animalsCount, hasWishlistItems]);

  const advanceStep = (animalName?: string, animalId?: string) => {
    setState(prev => {
      if (prev.currentStep === 'profile') {
        return { ...prev, currentStep: 'animal', isOnboardingActive: true };
      }
      if (prev.currentStep === 'animal') {
        return { 
          ...prev, 
          currentStep: 'wishlist', 
          isOnboardingActive: true, 
          targetAnimalName: animalName,
          targetAnimalId: animalId,
          showCongratulations: true,
        };
      }
      if (prev.currentStep === 'wishlist' && organization) {
        localStorage.setItem(`org_onboarding_dismissed_${organization.id}`, 'true');
        return { ...prev, currentStep: 'complete', isOnboardingActive: false, showCongratulations: false };
      }
      return prev;
    });
  };

  const dismissOnboarding = () => {
    if (organization) {
      localStorage.setItem(`org_onboarding_dismissed_${organization.id}`, 'true');
    }
    setState({ currentStep: 'complete', isOnboardingActive: false, showCongratulations: false });
  };

  const clearCongratulations = () => {
    setState(prev => ({ ...prev, showCongratulations: false }));
  };

  return {
    ...state,
    advanceStep,
    dismissOnboarding,
    clearCongratulations,
  };
}
