import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&:not(:disabled)]:cursor-pointer"
    
    const variants = {
      default: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow hover:bg-[var(--color-primary)]/90 hover:shadow-md active:scale-[0.98]",
      destructive: "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] shadow hover:bg-[var(--color-destructive)]/90 hover:shadow-md active:scale-[0.98]",
      outline: "border-2 border-[var(--color-input)] bg-[var(--color-background)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] hover:border-[var(--color-primary)] active:scale-[0.98]",
      secondary: "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] shadow-sm hover:bg-[var(--color-secondary)]/80 hover:shadow active:scale-[0.98]",
      ghost: "hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] active:scale-[0.98]",
      link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3 text-xs",
      lg: "h-11 rounded-md px-8 text-base",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
