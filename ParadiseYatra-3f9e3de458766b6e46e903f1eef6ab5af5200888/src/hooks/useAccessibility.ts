import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAccessibilityOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  trapFocus?: boolean;
  autoFocus?: boolean;
  announceToScreenReader?: string;
}

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const {
    onEscape,
    onEnter,
    onSpace,
    onArrowKeys,
    trapFocus = false,
    autoFocus = false,
    announceToScreenReader
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Announce changes to screen readers
  const announce = useCallback((message: string) => {
    if (typeof window === 'undefined') return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'ArrowUp':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('up');
        }
        break;
      case 'ArrowDown':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('down');
        }
        break;
      case 'ArrowLeft':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('left');
        }
        break;
      case 'ArrowRight':
        if (onArrowKeys) {
          event.preventDefault();
          onArrowKeys('right');
        }
        break;
    }
  }, [onEscape, onEnter, onSpace, onArrowKeys]);

  // Focus trap implementation
  const trapFocusInElement = useCallback(() => {
    if (!elementRef.current || !trapFocus) return;

    const focusableElements = elementRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    elementRef.current.addEventListener('keydown', handleTabKey);

    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('keydown', handleTabKey);
      }
    };
  }, [trapFocus]);

  // Auto-focus implementation
  const autoFocusElement = useCallback(() => {
    if (!elementRef.current || !autoFocus) return;

    const focusableElements = elementRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, [autoFocus]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('focus', handleFocus, true);
    element.addEventListener('blur', handleBlur, true);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('focus', handleFocus, true);
      element.removeEventListener('blur', handleBlur, true);
    };
  }, [handleKeyDown, handleFocus, handleBlur]);

  // Set up focus trap
  useEffect(() => {
    const cleanup = trapFocusInElement();
    return cleanup;
  }, [trapFocusInElement]);

  // Auto-focus on mount
  useEffect(() => {
    autoFocusElement();
  }, [autoFocusElement]);

  // Announce to screen reader when needed
  useEffect(() => {
    if (announceToScreenReader) {
      announce(announceToScreenReader);
    }
  }, [announceToScreenReader, announce]);

  // Utility functions
  const focusFirstElement = useCallback(() => {
    if (!elementRef.current) return;

    const focusableElements = elementRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, []);

  const focusLastElement = useCallback(() => {
    if (!elementRef.current) return;

    const focusableElements = elementRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
    }
  }, []);

  const focusNextElement = useCallback(() => {
    if (!elementRef.current) return;

    const focusableElements = Array.from(elementRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;

    focusableElements[nextIndex]?.focus();
  }, []);

  const focusPreviousElement = useCallback(() => {
    if (!elementRef.current) return;

    const focusableElements = Array.from(elementRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[];

    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const previousIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;

    focusableElements[previousIndex]?.focus();
  }, []);

  return {
    elementRef,
    isFocused,
    announce,
    focusFirstElement,
    focusLastElement,
    focusNextElement,
    focusPreviousElement,
  };
}

// Hook for managing ARIA live regions
export function useAriaLive() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);

    // Remove announcement after a delay
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(announcement => announcement !== message));
    }, 5000);
  }, []);

  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
  }, []);

  return {
    announcements,
    announce,
    clearAnnouncements,
  };
}

// Hook for managing focus restoration
export function useFocusRestoration() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
  };
}
