import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "purple";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-blue-50 text-blue-700 border-blue-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
    destructive: "bg-red-50 text-red-700 border-red-200",
    outline: "text-slate-700 border-slate-300",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors font-sans",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
