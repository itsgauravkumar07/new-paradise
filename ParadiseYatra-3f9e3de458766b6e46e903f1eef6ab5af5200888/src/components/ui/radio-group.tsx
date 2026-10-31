"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange }}>
        <div
          ref={ref}
          className={cn("space-y-2", className)}
          role="radiogroup"
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  id: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value: itemValue, id, ...props }, ref) => {
    const { value: contextValue, onValueChange } = React.useContext(RadioGroupContext);

    const isChecked = contextValue === itemValue;
    const handleChange = () => {
      if (itemValue && onValueChange) {
        onValueChange(itemValue);
      }
    };

    return (
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="radio"
          id={id}
          checked={isChecked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <div
          onClick={handleChange}
          className={cn(
            "h-4 w-4 rounded-full border border-slate-300 peer-checked:border-[#000945] flex items-center justify-center cursor-pointer transition-all",
            className
          )}
        >
          {isChecked && (
            <div className="h-2 w-2 rounded-full bg-[#000945]" />
          )}
        </div>
      </div>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
