import React from "react";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "soft"
  | "glass"
  | "glass-light"
  | "rating"
  | "amber"
  | "emerald"
  | "rose";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

// design.md: strict pill, 0.75rem text, frosted backgrounds on imagery.
const baseClasses =
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold leading-none whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive text-destructive-foreground",
  outline: "border-border bg-transparent text-foreground",
  soft: "border-blue-100 bg-primary-light text-primary",
  glass: "border-white/20 bg-slate-900/50 text-white backdrop-blur-md",
  "glass-light": "border-white/50 bg-white/90 text-heading backdrop-blur-md",
  rating: "border-transparent bg-white text-heading shadow-sm",
  amber: "border-transparent bg-tertiary text-white",
  emerald: "border-transparent bg-badge-emerald text-white",
  rose: "border-transparent bg-badge-rose text-white",
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
      <div className={classes} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
export type { BadgeProps, BadgeVariant };