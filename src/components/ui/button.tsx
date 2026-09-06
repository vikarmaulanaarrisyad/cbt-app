import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const variantStyles = {
      default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-[0.98]",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20 active:scale-[0.98]",
      outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 shadow-xs",
      ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
      link: "text-blue-600 underline-offset-4 hover:underline",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 active:scale-[0.98]",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl",
      sm: "h-8 px-3 text-xs font-bold rounded-lg",
      lg: "h-12 px-6 text-sm font-bold rounded-2xl",
      icon: "h-9 w-9 p-0 flex items-center justify-center rounded-xl",
    };

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:pointer-events-none disabled:opacity-50 cursor-pointer font-sans",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
