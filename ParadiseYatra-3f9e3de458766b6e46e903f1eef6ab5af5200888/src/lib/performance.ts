/**
 * Performance and accessibility utilities for Paradise Yatra
 */

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Intersection Observer options for lazy loading
export const intersectionObserverOptions = {
  root: null,
  rootMargin: '50px',
  threshold: 0.1,
} as const;

// Preload critical resources
export function preloadResource(href: string, as: string) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

// Prefetch non-critical resources
export function prefetchResource(href: string) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void) {
  if (typeof window === 'undefined') {
    fn();
    return;
  }

  const start = performance.now();
  fn();
  const end = performance.now();

  if (process.env.NODE_ENV === 'development') {
    console.log(`${name} took ${end - start} milliseconds`);
  }
}

// Accessibility utilities
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// Focus management utilities
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  function handleTabKey(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Image loading optimization
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Batch DOM updates for better performance
export function batchDOMUpdates(updates: (() => void)[]) {
  if (typeof window === 'undefined') {
    updates.forEach(update => update());
    return;
  }

  // Use requestAnimationFrame for smooth updates
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

// Memory leak prevention
export function createCleanupFunction() {
  const cleanupFunctions: (() => void)[] = [];

  return {
    add: (fn: () => void) => cleanupFunctions.push(fn),
    cleanup: () => {
      cleanupFunctions.forEach(fn => fn());
      cleanupFunctions.length = 0;
    }
  };
}

// Service Worker registration for PWA capabilities
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('SW registered: ', registration);
  } catch (registrationError) {
    console.log('SW registration failed: ', registrationError);
  }
}

// Performance budget checking
export function checkPerformanceBudget(metric: string, value: number, budget: number): boolean {
  const isWithinBudget = value <= budget;

  if (!isWithinBudget && process.env.NODE_ENV === 'development') {
    const unit = metric === "CLS" ? "" : "ms";
    console.warn(`Performance budget exceeded for ${metric}: ${value}${unit} (budget: ${budget}${unit})`);
  }

  return isWithinBudget;
}
