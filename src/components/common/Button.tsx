import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "ghost" | "solid" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isActive?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  ghost:
    "bg-transparent hover:bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
  solid:
    "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white",
  outline:
    "border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-2 text-xs rounded-md",
  md: "h-8 px-3 text-sm rounded-md",
  lg: "h-10 px-4 text-sm rounded-lg",
};

/**
 * Reusable accessible button with variant/size/active state support.
 * Forwards refs so parent components can manage focus.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "ghost", size = "md", isActive = false, className, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium select-none",
          "transition-colors duration-150 outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1",
          "disabled:opacity-40 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          isActive && "bg-[var(--color-accent-muted)] text-[var(--color-accent)]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
