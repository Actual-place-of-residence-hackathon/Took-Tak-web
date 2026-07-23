import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary-500 hover:bg-primary-600 text-white",
  secondary: "bg-accent-200 hover:bg-accent-300 text-zinc-800",
  ghost: "bg-transparent hover:bg-zinc-100 text-zinc-700",
  danger: "bg-rose-500 hover:bg-rose-600 text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`rounded-lg font-medium transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
