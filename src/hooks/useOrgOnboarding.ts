import { useState, useEffect } from 'react';

export type OnboardingStep = 'profile' | 'animal' | 'wishlist' | 'complete';

interface OnboardingState {
  currentStep: OnboardingStep;
  isOnboardingActive: boolean;
  targetAnimalName?: string;
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
  });

  useEffect(() => {
    if (!organization) return;

    // Check if onboarding was already dismissed
    const dismissed = localStorage.getItem(`org_onboarding_dismissed_${organization.id}`);
    if (dismissed) {
      setState({ currentStep: 'complete', isOnboardingActive: false });
      return;
    }

    // Determine onboarding step based on organization state
    const isProfileIncomplete = !organization.description || !organization.city || !organization.address;
    
    if (isProfileIncomplete) {
      setState({ currentStep: 'profile', isOnboardingActive: true });
    } else if (animalsCount === 0) {
      setState({ currentStep: 'animal', isOnboardingActive: true });
    } else if (!hasWishlistItems) {
      setState({ currentStep: 'wishlist', isOnboardingActive: true });
    } else {
      // Mark as complete and dismiss
      localStorage.setItem(`org_onboarding_dismissed_${organization.id}`, 'true');
      setState({ currentStep: 'complete', isOnboardingActive: false });
    }
  }, [organization, animalsCount, hasWishlistItems]);

  const advanceStep = (animalName?: string) => {
    setState(prev => {
      if (prev.currentStep === 'profile') {
        return { currentStep: 'animal', isOnboardingActive: true };
      }
      if (prev.currentStep === 'animal') {
        return { currentStep: 'wishlist', isOnboardingActive: true, targetAnimalName: animalName };
      }
      if (prev.currentStep === 'wishlist' && organization) {
        localStorage.setItem(`org_onboarding_dismissed_${organization.id}`, 'true');
        return { currentStep: 'complete', isOnboardingActive: false };
      }
      return prev;
    });
  };

  const dismissOnboarding = () => {
    if (organization) {
      localStorage.setItem(`org_onboarding_dismissed_${organization.id}`, 'true');
    }
    setState({ currentStep: 'complete', isOnboardingActive: false });
  };

  return {
    ...state,
    advanceStep,
    dismissOnboarding,
  };
}
