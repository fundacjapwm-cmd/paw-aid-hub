import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl md:rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground md:hover:shadow-bubbly md:hover:scale-105 transition-bubbly",
        destructive:
          "bg-destructive text-destructive-foreground md:hover:bg-destructive/90",
        outline:
          "border-2 border-primary bg-background text-primary md:hover:bg-primary md:hover:text-primary-foreground md:hover:scale-105 transition-bubbly",
        secondary:
          "bg-secondary text-secondary-foreground md:hover:shadow-bubbly md:hover:scale-105 transition-bubbly",
        ghost: "md:hover:bg-accent md:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 md:hover:underline",
        hero: "bg-hero text-primary-foreground md:hover:shadow-bubbly md:hover:scale-105 transition-bubbly text-lg font-semibold",
        bubbly: "bg-primary text-primary-foreground md:hover:bg-accent md:hover:shadow-bubbly md:hover:scale-105 md:hover:-translate-y-1 transition-bubbly",
        light: "bg-primary-light text-primary-foreground md:hover:bg-primary md:hover:text-primary-foreground md:hover:scale-105 transition-bubbly",
        success: "bg-green-500 text-white md:hover:bg-green-600 md:hover:shadow-bubbly md:hover:scale-105 transition-bubbly",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4",
        lg: "h-14 px-8 text-lg",
        icon: "h-12 w-12",
        hero: "h-16 px-12 text-xl font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
