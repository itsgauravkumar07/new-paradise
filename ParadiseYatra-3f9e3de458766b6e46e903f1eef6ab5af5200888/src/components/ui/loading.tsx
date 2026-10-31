import React, { memo } from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  "aria-label"?: string;
}

const Loading: React.FC<LoadingProps> = memo(
  ({
    size = "md",
    className = "",
    text = "Loading...",
    "aria-label": ariaLabel,
  }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    };

    const spinnerAriaLabel = ariaLabel || `${text} spinner`;

    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
        role="status"
        aria-live="polite"
      >
        <div
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
          aria-label={spinnerAriaLabel}
          role="img"
        />
        {text && (
          <p className="mt-2 text-sm text-gray-600 sr-only sm:not-sr-only">
            {text}
          </p>
        )}
      </div>
    );
  }
);

Loading.displayName = "Loading";

export default Loading;
