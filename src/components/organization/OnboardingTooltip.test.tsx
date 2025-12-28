import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import OnboardingTooltip from './OnboardingTooltip';

describe('OnboardingTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render children', () => {
      render(
        <OnboardingTooltip message="Test message" show={false}>
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
    });

    it('should not show tooltip when show is false', () => {
      render(
        <OnboardingTooltip message="Test message" show={false}>
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('should show tooltip when show is true after delay', async () => {
      render(
        <OnboardingTooltip message="Test message" show={true}>
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      // Tooltip message should be in DOM but not visible initially
      expect(screen.getByText('Test message')).toBeInTheDocument();

      // After delay, should be visible
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should show highlight ring when visible', async () => {
      const { container } = render(
        <OnboardingTooltip message="Test message" show={true}>
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(400);
      });

      const ringElement = container.querySelector('.ring-4');
      expect(ringElement).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('should render with bottom position by default', () => {
      const { container } = render(
        <OnboardingTooltip message="Test message" show={true}>
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      const tooltip = container.querySelector('.top-full');
      expect(tooltip).toBeInTheDocument();
    });

    it('should render with top position when specified', () => {
      const { container } = render(
        <OnboardingTooltip message="Test message" show={true} position="top">
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      const tooltip = container.querySelector('.bottom-full');
      expect(tooltip).toBeInTheDocument();
    });

    it('should render with left position when specified', () => {
      const { container } = render(
        <OnboardingTooltip message="Test message" show={true} position="left">
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      const tooltip = container.querySelector('.right-full');
      expect(tooltip).toBeInTheDocument();
    });

    it('should render with right position when specified', () => {
      const { container } = render(
        <OnboardingTooltip message="Test message" show={true} position="right">
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      const tooltip = container.querySelector('.left-full');
      expect(tooltip).toBeInTheDocument();
    });
  });

  describe('Dismiss Functionality', () => {
    it('should show dismiss button when onDismiss is provided', async () => {
      const onDismiss = vi.fn();
      render(
        <OnboardingTooltip message="Test message" show={true} onDismiss={onDismiss}>
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(400);
      });

      const dismissButtons = screen.getAllByRole('button');
      // Find the dismiss button (not the child button)
      const dismissButton = dismissButtons.find(btn => btn !== screen.getByText('Test Button'));
      expect(dismissButton).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', async () => {
      const onDismiss = vi.fn();
      render(
        <OnboardingTooltip message="Test message" show={true} onDismiss={onDismiss}>
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(400);
      });

      const dismissButtons = screen.getAllByRole('button');
      const dismissButton = dismissButtons.find(btn => btn !== screen.getByText('Test Button'));
      
      if (dismissButton) {
        fireEvent.click(dismissButton);
        expect(onDismiss).toHaveBeenCalledTimes(1);
      }
    });

    it('should not show dismiss button when onDismiss is not provided', () => {
      render(
        <OnboardingTooltip message="Test message" show={true}>
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1); // Only the child button
    });
  });

  describe('Animation', () => {
    it('should start with opacity-0 and scale-95', () => {
      const { container } = render(
        <OnboardingTooltip message="Test message" show={true}>
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      const tooltipWrapper = container.querySelector('.opacity-0');
      expect(tooltipWrapper).toBeInTheDocument();
    });

    it('should transition to opacity-100 and scale-100 after delay', () => {
      const { container } = render(
        <OnboardingTooltip message="Test message" show={true}>
          <button>Test Button</button>
        </OnboardingTooltip>
      );

      act(() => {
        vi.advanceTimersByTime(400);
      });

      const tooltipWrapper = container.querySelector('.opacity-100');
      expect(tooltipWrapper).toBeInTheDocument();
    });
  });
});
