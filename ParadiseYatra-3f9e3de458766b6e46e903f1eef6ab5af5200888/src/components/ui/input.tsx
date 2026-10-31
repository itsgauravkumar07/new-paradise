import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    // design.md: rounded inputs, slate border, blue focus ring
    const baseClasses =
      "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-heading file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50";

    return (
      <input className={`${baseClasses} ${className}`} ref={ref} {...props} />
    );
  }
);

Input.displayName = "Input";

export { Input };