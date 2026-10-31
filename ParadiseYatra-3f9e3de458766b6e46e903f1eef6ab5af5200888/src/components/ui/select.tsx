"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ children, value, onValueChange, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Merge refs
    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(containerRef.current);
      } else {
        (ref as any).current = containerRef.current;
      }
    }, [ref]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () =>
        document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleSelect = (selectedValue: string) => {
      onValueChange?.(selectedValue);
      setIsOpen(false);
    };

    // Filter out non-DOM props to avoid React warnings
    const domProps = Object.fromEntries(
      Object.entries(props).filter(
        ([key]) =>
          !key.startsWith("on") &&
          !["isOpen", "setIsOpen", "onSelect", "handleSelect"].includes(key)
      )
    );

    return (
      <div
        className={`relative ${disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        ref={containerRef}
        {...domProps}
      >
        <AnimatePresence>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Only pass setIsOpen to SelectTrigger components
              if (child.type === SelectTrigger) {
                return React.cloneElement(
                  child as React.ReactElement<SelectTriggerProps>,
                  {
                    isOpen,
                    setIsOpen,
                    handleSelect: handleSelect,
                    value,
                    disabled,
                    parentChildren: children,
                  }
                );
              }
              // For other components, only pass necessary props
              if (child.type === SelectContent) {
                return (
                  isOpen &&
                  React.cloneElement(
                    child as React.ReactElement<SelectContentProps>,
                    {
                      isOpen,
                      handleSelect: handleSelect,
                    }
                  )
                );
              }
              // For other components, don't pass any additional props
              return child;
            }
            return child;
          })}
        </AnimatePresence>
      </div>
    );
  }
);

Select.displayName = "Select";

interface SelectTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  children: React.ReactNode;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  handleSelect?: (value: string) => void;
  disabled?: boolean;
  value?: string;
  parentChildren?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  (
    {
      className = "",
      children,
      isOpen,
      setIsOpen,
      disabled,
      handleSelect,
      parentChildren,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all active:scale-[0.98] cursor-pointer";

    return (
      <button
        className={`${baseClasses} ${className}`}
        ref={ref}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen?.(!isOpen);
        }}
        disabled={disabled}
        type="button"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Pass the value prop to SelectValue components
            if (child.type === SelectValue || (child.type as any).displayName === "SelectValue") {
              return React.cloneElement(
                child as React.ReactElement<SelectValueProps>,
                {
                  value: props.value,
                  parentChildren: parentChildren
                }
              );
            }
            return child;
          }
          return child;
        })}
        <ChevronDown
          className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>
    );
  }
);

SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
  children?: React.ReactNode;
  value?: string;
  parentChildren?: React.ReactNode;
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, children, value, parentChildren, ...props }, ref) => {
    // Find matching label from SelectContent -> SelectItems
    const getDisplayValue = () => {
      if (!value) return children || placeholder;

      let displayLabel: React.ReactNode = null;

      // Iterate through siblings to find SelectContent
      React.Children.forEach(parentChildren, (child) => {
        if (React.isValidElement(child)) {
          // In some cases (like forwardRef), we might need to checkdisplayName or other properties
          // but usually comparing with the component itself works if they are in the same file
          const childrenOfChild = (child.props as any).children;

          // If this is SelectContent
          if (child.type === SelectContent || (child.type as any).displayName === "SelectContent") {
            React.Children.forEach(childrenOfChild, (item) => {
              if (React.isValidElement(item) && (item.type === SelectItem || (item.type as any).displayName === "SelectItem")) {
                if ((item.props as any).value === value) {
                  displayLabel = (item.props as any).children;
                }
              }
            });
          }
        }
      });

      if (displayLabel) return displayLabel;

      // Fallback: capitalize first letter of the raw value
      if (typeof value === 'string') {
        return value.charAt(0).toUpperCase() + value.slice(1);
      }

      return value;
    };

    return (
      <span className="block truncate" ref={ref} {...props}>
        {getDisplayValue()}
      </span>
    );
  }
);

SelectValue.displayName = "SelectValue";

interface SelectContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
  handleSelect?: (value: string) => void;
  className?: string;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className = "", children, isOpen, handleSelect, ...props }, ref) => {
    const baseClasses =
      "absolute top-full left-0 right-0 z-50 min-w-[8rem] overflow-y-auto rounded-xl border border-slate-100 bg-white text-popover-foreground shadow-2xl mt-2 max-h-[300px] overscroll-contain";

    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={`${baseClasses} ${className}`}
        ref={ref}
        onWheel={(e) => {
          e.stopPropagation();
        }}
        {...props}
      >
        <div className="p-1">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Only pass handleSelect to SelectItem components
              if (child.type === SelectItem) {
                return React.cloneElement(
                  child as React.ReactElement<SelectItemProps>,
                  {
                    handleSelect,
                  }
                );
              }
              // For other components, don't pass handleSelect
              return child;
            }
            return child;
          })}
        </div>
      </motion.div>
    );
  }
);

SelectContent.displayName = "SelectContent";

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  handleSelect?: (value: string) => void;
  className?: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className = "", children, value, handleSelect, ...props }, ref) => {
    const baseClasses =
      "relative flex w-full cursor-pointer text-slate-700 bg-white select-none items-center rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-50 hover:text-blue-600 transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 font-medium";

    const handleItemSelect = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleSelect?.(value);
    };

    return (
      <div
        className={`${baseClasses} ${className}`}
        ref={ref}
        onClick={handleItemSelect}
        role="option"
        aria-selected={false}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect?.(value);
          }
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
