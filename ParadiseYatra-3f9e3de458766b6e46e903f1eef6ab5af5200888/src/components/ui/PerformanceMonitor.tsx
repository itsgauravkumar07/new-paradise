"use client";

import { useEffect, useState, useCallback } from "react";
import { measurePerformance, checkPerformanceBudget } from "@/lib/performance";

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

interface PerformanceBudget {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

const DEFAULT_BUDGET: PerformanceBudget = {
  fcp: 1800, // 1.8 seconds
  lcp: 2500, // 2.5 seconds
  fid: 100, // 100 milliseconds
  cls: 0.1, // 0.1
  ttfb: 600, // 600 milliseconds
};

interface PerformanceMonitorProps {
  budget?: Partial<PerformanceBudget>;
  showInProduction?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export default function PerformanceMonitor({
  budget = DEFAULT_BUDGET,
  showInProduction = false,
  onMetricsUpdate,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  const [isVisible, setIsVisible] = useState(false);

  const updateMetrics = useCallback(
    (newMetrics: Partial<PerformanceMetrics>) => {
      setMetrics((prev) => {
        const updated = { ...prev, ...newMetrics };
        onMetricsUpdate?.(updated);
        return updated;
      });
    },
    [onMetricsUpdate]
  );

  // Measure First Contentful Paint (FCP)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === "first-contentful-paint") {
          const fcp = entry.startTime;
          updateMetrics({ fcp });
          checkPerformanceBudget("FCP", fcp, budget.fcp || DEFAULT_BUDGET.fcp);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ["paint"] });
    } catch (e) {
      // Fallback for browsers that don't support PerformanceObserver
      if ("performance" in window) {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          const fcp =
            navigation.domContentLoadedEventEnd - navigation.fetchStart;
          updateMetrics({ fcp });
          checkPerformanceBudget("FCP", fcp, budget.fcp || DEFAULT_BUDGET.fcp);
        }
      }
    }

    return () => observer.disconnect();
  }, [updateMetrics, budget.fcp]);

  // Measure Largest Contentful Paint (LCP)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === "largest-contentful-paint") {
          const lcp = entry.startTime;
          updateMetrics({ lcp });
          checkPerformanceBudget("LCP", lcp, budget.lcp || DEFAULT_BUDGET.lcp);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      console.warn("LCP measurement not supported");
    }

    return () => observer.disconnect();
  }, [updateMetrics, budget.lcp]);

  // Measure First Input Delay (FID)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === "first-input") {
          const fid = (entry as any).processingStart - entry.startTime;
          updateMetrics({ fid });
          checkPerformanceBudget("FID", fid, budget.fid || DEFAULT_BUDGET.fid);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      console.warn("FID measurement not supported");
    }

    return () => observer.disconnect();
  }, [updateMetrics, budget.fid]);

  // Measure Cumulative Layout Shift (CLS)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];
    let hasWarnedForCls = false;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (
          entry.entryType === "layout-shift" &&
          !(entry as any).hadRecentInput
        ) {
          clsEntries.push(entry);
          clsValue += (entry as any).value;
          updateMetrics({ cls: clsValue });
          if (!hasWarnedForCls) {
            const withinBudget = checkPerformanceBudget(
              "CLS",
              clsValue,
              budget.cls || DEFAULT_BUDGET.cls
            );
            if (!withinBudget) hasWarnedForCls = true;
          }
        }
      });
    });

    try {
      observer.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.warn("CLS measurement not supported");
    }

    return () => observer.disconnect();
  }, [updateMetrics, budget.cls]);

  // Measure Time to First Byte (TTFB)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      updateMetrics({ ttfb });
      checkPerformanceBudget("TTFB", ttfb, budget.ttfb || DEFAULT_BUDGET.ttfb);
    }
  }, [updateMetrics, budget.ttfb]);

  // Toggle visibility with keyboard shortcut (Ctrl+Shift+P)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === "P") {
        event.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === "production" && !showInProduction) {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50"
        title="Show Performance Monitor (Ctrl+Shift+P)"
        aria-label="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  const getMetricColor = (
    metric: keyof PerformanceMetrics,
    value: number | null
  ) => {
    if (value === null) return "text-gray-500";

    const budgetValue = budget[metric] || DEFAULT_BUDGET[metric];
    if (value <= budgetValue * 0.8) return "text-green-600";
    if (value <= budgetValue) return "text-yellow-600";
    return "text-red-600";
  };

  const formatMetric = (
    metric: keyof PerformanceMetrics,
    value: number | null
  ) => {
    if (value === null) return "N/A";

    switch (metric) {
      case "cls":
        return value.toFixed(3);
      case "fcp":
      case "lcp":
      case "fid":
      case "ttfb":
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
          aria-label="Close Performance Monitor"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="font-medium text-gray-700 uppercase">{key}:</span>
            <span
              className={getMetricColor(key as keyof PerformanceMetrics, value)}
            >
              {formatMetric(key as keyof PerformanceMetrics, value)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Press Ctrl+Shift+P to toggle • Budget: Green &lt;=80%, Yellow
          &lt;=100%, Red &gt;100%
        </p>
      </div>
    </div>
  );
}
