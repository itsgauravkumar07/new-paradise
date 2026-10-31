import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Pill shape is the design.md default for every button.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary-hover",
        outline:
          "border border-primary bg-white text-primary hover:bg-primary hover:text-primary-foreground",
        soft: "bg-primary-light text-primary hover:bg-primary/15",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline rounded-none shadow-none",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        nav: "border border-slate-200 bg-white text-slate-700 shadow-xl hover:bg-slate-50",
        "nav-primary":
          "bg-primary text-primary-foreground shadow-xl shadow-blue-600/25 hover:bg-primary-hover",
        glass:
          "border border-white/20 bg-slate-900/50 text-white backdrop-blur-md hover:bg-slate-900/70",
        "admin-primary":
          "rounded-md font-medium shadow-none bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/20",
        "admin-outline":
          "rounded-md font-medium shadow-none border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500/20",
        "admin-secondary":
          "rounded-md font-medium shadow-none bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-500/20",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        xs: "h-6 gap-1 px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-4 text-xs has-[>svg]:px-3",
        lg: "h-12 px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
