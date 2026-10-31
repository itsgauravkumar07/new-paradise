"use client";

import React, {
  Suspense,
  lazy,
  ComponentType,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Loading from "./loading";

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

const LazyWrapper = ({
  children,
  fallback = <Loading size="lg" className="min-h-[200px]" />,
  className = "",
}: LazyWrapperProps) => {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </div>
  );
};

// Error boundary component for lazy loading with accessibility improvements
const ErrorFallback = ({ retry }: { error: Error; retry: () => void }) => (
  <div
    className="flex flex-col items-center justify-center min-h-[200px] p-4"
    role="alert"
    aria-live="polite"
  >
    <div className="text-red-600 mb-4" id="error-message">
      Failed to load component
    </div>
    <button
      onClick={retry}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      aria-describedby="error-message"
    >
      Retry
    </button>
  </div>
);

const PRELOAD_MARGIN = "1200px 0px";

// Optimized lazy component with Intersection Observer
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ReactNode,
  options: {
    threshold?: number;
    rootMargin?: string;
  } = {}
) => {
  const LazyComponent = lazy(importFunc);

  const LazyWrappedComponent = React.memo((props: React.ComponentProps<T>) => {
    const [hasError, setHasError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [, setError] = useState<Error | null>(null);
    const mountedRef = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { threshold = 0.1 } = options;
    // Start loading a section well before it scrolls into view (about 1.5 screens), so its code and data
    // arrive and it reaches its real height off-screen. Loading it only ~200px ahead made sections pop in
    // and resize under the reader, so the page jumped while scrolling.
    const rootMargin = PRELOAD_MARGIN;

    const retry = useCallback(() => {
      if (!mountedRef.current) return;
      setHasError(false);
      setError(null);
      setIsLoaded(false);
    }, []);

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (!containerRef.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isLoaded) {
            setIsVisible(true);
            setIsLoaded(true);
            // Disconnect observer after first intersection
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observerRef.current = observer;
      observer.observe(containerRef.current);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [threshold, rootMargin, isLoaded]);

    useEffect(() => {
      mountedRef.current = true;
      setHasError(false);
      setError(null);

      return () => {
        mountedRef.current = false;
      };
    }, []);

    if (hasError) {
      return (
        <ErrorFallback
          error={new Error("Component failed to load")}
          retry={retry}
        />
      );
    }

    // Only render the component when it's visible
    if (!isVisible) {
      return (
        <div ref={containerRef} className="min-h-[200px]">
          {fallback}
        </div>
      );
    }

    return (
      <div ref={containerRef}>
        <LazyWrapper fallback={fallback}>
          <ErrorBoundary
            onError={(error) => {
              if (mountedRef.current) {
                setHasError(true);
                setError(error);
              }
            }}
          >
            <LazyComponent {...props} />
          </ErrorBoundary>
        </LazyWrapper>
      </div>
    );
  });

  LazyWrappedComponent.displayName = "LazyWrappedComponent";
  return LazyWrappedComponent;
};

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Let the parent handle the error display
    }

    return this.props.children;
  }
}

export default LazyWrapper;
